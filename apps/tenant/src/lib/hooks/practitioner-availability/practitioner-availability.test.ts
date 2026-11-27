import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	useFetchPractitionerAvailability,
	useFetchPractitionerSchedule,
	useFindPractitionerSchedule
} from './use-fetch-practitioner-availability';
import { PERMISSIONS } from '$lib/configs/permissions';
import server from '$lib/requests';

type Options = {
	enabled: boolean;
	queryKey: readonly unknown[];
	meta: { path: string; params?: PractitionerAvailabilityQueryParams };
	queryFn: (context: { signal: AbortSignal }) => Promise<unknown>;
};
const state = vi.hoisted(() => ({
	tenant: 'tenant-a',
	token: '',
	permissions: [] as string[],
	queries: [] as (() => Options)[]
}));
vi.mock('$app/environment', () => ({ browser: true }));
vi.mock('$lib/store/index.svelte', () => ({
	stores: {
		AppStore: {
			currentTenant: {
				get uid() {
					return state.tenant;
				}
			}
		},
		AuthStore: {
			get accessToken() {
				return state.token;
			}
		},
		PermissionStore: { can: (permission: string) => state.permissions.includes(permission) }
	}
}));
vi.mock('$lib/requests', () => ({ default: { get: vi.fn() } }));
vi.mock('@tanstack/svelte-query', () => ({
	createQuery: (options: () => Options) => {
		state.queries.push(options);
		return {};
	}
}));
const token = () =>
	`eyJhbGciOiJub25lIn0.${Buffer.from(JSON.stringify({ user: { uid: 'self', tenant_uid: state.tenant, branch_uid: 'branch-a' } })).toString('base64url')}.signature`;
const context: PractitionerScheduleContext = {
	branch_uid: 'branch-a',
	branch_name: 'Main',
	timezone: 'Africa/Lagos',
	branch_is_active: true,
	practitioner_uid: 'other',
	practitioner_name: 'Other Staff',
	practitioner_is_active: true,
	assignment_uid: 'current',
	assignment_is_active: true
};
const record = (assignmentUid = 'current', offeringUid: string | null = null) => ({
	uid: 'schedule-a',
	tenant_uid: 'tenant-a',
	branch_uid: 'branch-a',
	practitioner_uid: 'other',
	assignment_uid: assignmentUid,
	branch_healthcare_service_uid: offeringUid
});
const signal = () => ({ signal: new AbortController().signal });

describe('practitioner schedule queries', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		state.tenant = 'tenant-a';
		state.token = token();
		state.permissions = [PERMISSIONS.PRACTITIONER_AVAILABILITY_READ];
		state.queries = [];
	});
	it('loads every page internally for the schedule card', async () => {
		useFetchPractitionerAvailability(
			() => 'branch-a',
			{ practitioner_uid: 'other', limit: 100, offset: 0 },
			true
		);
		vi.mocked(server.get)
			.mockResolvedValueOnce({
				data: { data: Array.from({ length: 100 }, () => record()), meta: { total: 101 } }
			})
			.mockResolvedValueOnce({ data: { data: [record()], meta: { total: 101 } } });
		await expect(state.queries[0]().queryFn(signal())).resolves.toMatchObject({
			data: Array.from({ length: 101 }, () => record())
		});
		expect(server.get).toHaveBeenNthCalledWith(
			2,
			'/practitioner-availability/branch/branch-a',
			expect.objectContaining({ params: expect.objectContaining({ offset: 100 }) })
		);
	});
	it('allows reading another practitioner without manage but enforces branch scope for automatic and manual requests', async () => {
		useFetchPractitionerAvailability(() => 'branch-a', {
			practitioner_uid: 'other',
			limit: 10,
			offset: 0
		});
		expect(state.queries[0]().enabled).toBe(true);
		useFetchPractitionerAvailability(() => 'branch-b', {
			practitioner_uid: 'other',
			limit: 10,
			offset: 0
		});
		expect(state.queries[1]().enabled).toBe(false);
		await expect(state.queries[1]().queryFn(signal())).rejects.toThrow('permission');
		state.permissions.push(PERMISSIONS.BRANCHES_MANAGE);
		expect(state.queries[1]().enabled).toBe(true);
		state.permissions = [PERMISSIONS.BRANCHES_MANAGE];
		expect(state.queries[1]().enabled).toBe(false);
		expect(server.get).not.toHaveBeenCalled();
	});
	it('snapshots filters and isolates practitioner, branch and tenant cache keys', () => {
		let branch = 'branch-a';
		const params: PractitionerAvailabilityQueryParams = {
			practitioner_uid: 'self',
			limit: 10,
			offset: 0,
			is_active: false
		};
		useFetchPractitionerAvailability(() => branch, params);
		const first = state.queries[0]();
		params.offset = 10;
		expect(first.meta.params).toMatchObject({ offset: 0, is_active: false });
		expect(state.queries[0]().queryKey).not.toEqual(first.queryKey);
		params.practitioner_uid = 'other';
		expect(state.queries[0]().queryKey).not.toEqual(first.queryKey);
		branch = 'branch-b';
		expect(state.queries[0]().queryKey).toContain('branch-b');
		state.tenant = 'tenant-b';
		expect(state.queries[0]().queryKey).toContain('tenant-b');
	});
	it('rejects stale callbacks after switching practitioner, branch or tenant', async () => {
		let branch = 'branch-a';
		const params = { practitioner_uid: 'self', limit: 10, offset: 0 };
		useFetchPractitionerAvailability(() => branch, params);
		const first = state.queries[0]();
		params.practitioner_uid = 'other';
		await expect(first.queryFn(signal())).rejects.toThrow('permission');
		const second = state.queries[0]();
		branch = 'branch-b';
		state.permissions.push(PERMISSIONS.BRANCHES_MANAGE);
		await expect(second.queryFn(signal())).rejects.toThrow('permission');
		const third = state.queries[0]();
		state.tenant = 'tenant-b';
		state.token = token();
		await expect(third.queryFn(signal())).rejects.toThrow('permission');
		expect(server.get).not.toHaveBeenCalled();
	});
	it('rejects detail responses that do not belong to the requested practitioner', async () => {
		useFetchPractitionerSchedule(context, 'schedule-a');
		vi.mocked(server.get).mockResolvedValue({
			data: { data: { ...record(), practitioner_uid: 'self' } }
		});
		await expect(state.queries[0]().queryFn(signal())).rejects.toThrow('does not belong');
	});
	it('finds an existing schedule across all pages and ignores older branch assignments', async () => {
		useFindPractitionerSchedule(
			context,
			() => null,
			() => true
		);
		vi.mocked(server.get)
			.mockResolvedValueOnce({
				data: { data: Array.from({ length: 100 }, () => record('old')), meta: { total: 101 } }
			})
			.mockResolvedValueOnce({ data: { data: [record()], meta: { total: 101 } } });
		await expect(state.queries[0]().queryFn(signal())).resolves.toEqual(record());
		expect(server.get).toHaveBeenNthCalledWith(
			1,
			'/practitioner-availability/branch/branch-a',
			expect.objectContaining({
				params: { practitioner_uid: 'other', limit: 100, offset: 0, general_only: true }
			})
		);
		expect(server.get).toHaveBeenNthCalledWith(
			2,
			'/practitioner-availability/branch/branch-a',
			expect.objectContaining({ params: expect.objectContaining({ offset: 100 }) })
		);
	});
	it('uses the offering UID for service contexts without mixing it with general_only', async () => {
		useFindPractitionerSchedule(
			context,
			() => 'offering-a',
			() => true
		);
		vi.mocked(server.get).mockResolvedValue({
			data: { data: [record('current', 'offering-a')], meta: { total: 1 } }
		});
		await state.queries[0]().queryFn(signal());
		expect(server.get).toHaveBeenCalledWith(
			'/practitioner-availability/branch/branch-a',
			expect.objectContaining({
				params: {
					practitioner_uid: 'other',
					limit: 100,
					offset: 0,
					branch_healthcare_service_uid: 'offering-a'
				}
			})
		);
	});
	it('does not fetch a disabled or incomplete context, including manual retries', async () => {
		useFindPractitionerSchedule(
			context,
			() => '',
			() => true
		);
		expect(state.queries[0]().enabled).toBe(false);
		await expect(state.queries[0]().queryFn(signal())).rejects.toThrow('permission');
		useFindPractitionerSchedule(
			context,
			() => null,
			() => false
		);
		expect(state.queries[1]().enabled).toBe(false);
		await expect(state.queries[1]().queryFn(signal())).rejects.toThrow('permission');
		expect(server.get).not.toHaveBeenCalled();
	});
});
