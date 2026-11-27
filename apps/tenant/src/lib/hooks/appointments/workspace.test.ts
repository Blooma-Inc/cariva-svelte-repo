import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	useAppointmentList,
	useAppointmentDetail,
	useAppointmentSummary,
	useAppointmentWeek
} from './use-appointment-workspace';
import server from '$lib/requests';
import { PERMISSIONS } from '$lib/configs/permissions';
import { appointments } from './fetch-key-factory';
const state = vi.hoisted(() => ({
	tenant: 'tenant-a',
	branch: 'branch-a',
	permissions: [] as string[],
	queries: [] as (() => Options)[]
}));
type Options = {
	enabled: boolean;
	queryKey: readonly unknown[];
	meta: { path: string };
	queryFn: (context: { signal: AbortSignal }) => Promise<unknown>;
};
vi.mock('$app/environment', () => ({ browser: true }));
vi.mock('$lib/requests', () => ({ default: { get: vi.fn() } }));
vi.mock('@tanstack/svelte-query', () => ({
	createQuery: (options: () => Options) => {
		state.queries.push(options);
		return {};
	}
}));
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
				return `eyJhbGciOiJub25lIn0.${Buffer.from(JSON.stringify({ user: { tenant_uid: state.tenant, branch_uid: state.branch } })).toString('base64url')}.signature`;
			},
			user: {
				get branch_assignments() {
					return [
						{
							revoked_at: null,
							branch: { uid: state.branch, name: 'Main', timezone: 'Africa/Lagos', is_active: true }
						}
					];
				}
			}
		},
		PermissionStore: { can: (permission: string) => state.permissions.includes(permission) }
	}
}));

const signal = () => ({ signal: new AbortController().signal });
const params = {
	limit: 10,
	offset: 0,
	period_start: '2030-01-01T23:00:00Z',
	period_end: '2030-01-02T23:00:00Z',
	q: 'Ada',
	status: 'booked' as const
};
describe('appointment workspace reads', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		state.tenant = 'tenant-a';
		state.branch = 'branch-a';
		state.permissions = [PERMISSIONS.APPOINTMENTS_READ];
		state.queries = [];
	});
	it('allows the daily list without booking, patient, staff or branch administration permissions', async () => {
		useAppointmentList(
			() => 'branch-a',
			() => params,
			() => true
		);
		const query = state.queries[0]();
		expect(query.enabled).toBe(true);
		vi.mocked(server.get).mockResolvedValue({
			data: { data: [{ uid: 'appointment-a', tenant_uid: 'tenant-a', branch_uid: 'branch-a' }] }
		});
		await query.queryFn(signal());
		expect(server.get).toHaveBeenCalledWith('/appointments/branch/branch-a', {
			params,
			signal: expect.any(AbortSignal)
		});
	});
	it('keeps summary requests separate from status and pagination', () => {
		const summary = appointments.summary('tenant-a', 'branch-a', { date: '2030-01-02', q: 'Ada' });
		expect(summary.params).toEqual({ date: '2030-01-02', q: 'Ada' });
		expect(summary.path).toBe('/appointments/branch/branch-a/summary');
		expect(summary.keys()).not.toEqual(appointments.list('tenant-a', 'branch-a', params).keys());
	});
	it('rejects mixed-branch records instead of displaying them', async () => {
		useAppointmentList(
			() => 'branch-a',
			() => params,
			() => true
		);
		vi.mocked(server.get).mockResolvedValue({
			data: { data: [{ tenant_uid: 'tenant-a', branch_uid: 'branch-b' }] }
		});
		await expect(state.queries[0]().queryFn(signal())).rejects.toThrow('does not match');
	});
	it('rejects mismatched appointment details', async () => {
		useAppointmentDetail(
			() => 'branch-a',
			() => 'appointment-a'
		);
		vi.mocked(server.get).mockResolvedValue({
			data: { data: { uid: 'appointment-b', tenant_uid: 'tenant-a', branch_uid: 'branch-a' } }
		});
		await expect(state.queries[0]().queryFn(signal())).rejects.toThrow('does not match');
	});
	it('disables reads outside the session branch or without read permission', () => {
		useAppointmentList(
			() => 'branch-b',
			() => params,
			() => true
		);
		expect(state.queries[0]().enabled).toBe(false);
		state.permissions = [];
		useAppointmentSummary(
			() => 'branch-a',
			() => ({ date: '2030-01-02' }),
			() => true
		);
		expect(state.queries[1]().enabled).toBe(false);
	});
	it('rejects in-flight reads after permissions change and uses distinct action-bearing cache keys', async () => {
		useAppointmentList(
			() => 'branch-a',
			() => params,
			() => true
		);
		const query = state.queries[0]();
		state.permissions.push(PERMISSIONS.APPOINTMENTS_UPDATE);
		expect(state.queries[0]().queryKey).not.toEqual(query.queryKey);
		await expect(query.queryFn(signal())).rejects.toThrow('access or branch session changed');
		expect(server.get).not.toHaveBeenCalled();
	});
});

const weekParams = {
	period_start: '2030-01-06T23:00:00Z',
	period_end: '2030-01-13T23:00:00Z',
	q: 'Ada'
};
const weekRows = (count: number, offset = 0) =>
	Array.from({ length: count }, (_, index) => ({
		uid: `appointment-${index + offset}`,
		tenant_uid: 'tenant-a',
		branch_uid: 'branch-a'
	}));
describe('complete appointment week reads', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		state.tenant = 'tenant-a';
		state.branch = 'branch-a';
		state.permissions = [PERMISSIONS.APPOINTMENTS_READ];
		state.queries = [];
	});
	it('loads every API page and returns one complete calendar result', async () => {
		useAppointmentWeek(
			() => 'branch-a',
			() => weekParams,
			() => true
		);
		const query = state.queries[0]();
		vi.mocked(server.get)
			.mockResolvedValueOnce({ data: { data: weekRows(100), meta: { total: 101 } } })
			.mockResolvedValueOnce({ data: { data: weekRows(1, 100), meta: { total: 101 } } });
		const result = await query.queryFn(signal());
		expect(result).toHaveLength(101);
		expect(server.get).toHaveBeenNthCalledWith(2, '/appointments/branch/branch-a', {
			signal: expect.any(AbortSignal),
			params: { ...weekParams, limit: 100, offset: 100 }
		});
	});
	it('does not return a partial calendar when a later page fails', async () => {
		useAppointmentWeek(
			() => 'branch-a',
			() => weekParams,
			() => true
		);
		vi.mocked(server.get)
			.mockResolvedValueOnce({ data: { data: weekRows(100), meta: { total: 101 } } })
			.mockRejectedValueOnce(new Error('Request failed'));
		await expect(state.queries[0]().queryFn(signal())).rejects.toThrow('Request failed');
	});
	it('detects records shifting between pages and asks for a fresh read', async () => {
		useAppointmentWeek(
			() => 'branch-a',
			() => weekParams,
			() => true
		);
		vi.mocked(server.get)
			.mockResolvedValueOnce({ data: { data: weekRows(100), meta: { total: 101 } } })
			.mockResolvedValueOnce({ data: { data: weekRows(1, 99), meta: { total: 101 } } });
		await expect(state.queries[0]().queryFn(signal())).rejects.toThrow(
			'changed while the week was loading'
		);
	});
	it('rejects another branch and disabled views before fetching', async () => {
		useAppointmentWeek(
			() => 'branch-b',
			() => weekParams,
			() => true
		);
		expect(state.queries[0]().enabled).toBe(false);
		await expect(state.queries[0]().queryFn(signal())).rejects.toThrow(
			'access or branch session changed'
		);
		useAppointmentWeek(
			() => 'branch-a',
			() => weekParams,
			() => false
		);
		expect(state.queries[1]().enabled).toBe(false);
		expect(server.get).not.toHaveBeenCalled();
	});
	it('does not fetch another page after the session changes', async () => {
		useAppointmentWeek(
			() => 'branch-a',
			() => weekParams,
			() => true
		);
		const query = state.queries[0]();
		vi.mocked(server.get).mockImplementation(async () => {
			state.branch = 'branch-b';
			return { data: { data: weekRows(100), meta: { total: 101 } } };
		});
		await expect(query.queryFn(signal())).rejects.toThrow('does not match');
		expect(server.get).toHaveBeenCalledTimes(1);
	});
	it('separates complete week caches from paginated lists and filters', () => {
		const key = appointments.week('tenant-a', 'branch-a', weekParams).keys();
		expect(key).not.toEqual(
			appointments.list('tenant-a', 'branch-a', { ...weekParams, limit: 100, offset: 0 }).keys()
		);
		expect(key).not.toEqual(
			appointments.week('tenant-a', 'branch-a', { ...weekParams, status: 'booked' }).keys()
		);
	});
});
