import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppointmentBookingContext } from './use-appointment-booking';
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
const context = () => ({
	branch: {
		uid: 'branch-a',
		name: 'Main',
		timezone: 'Africa/Lagos',
		is_active: true,
		operating_hours: null
	}
});
const signal = () => ({ signal: new AbortController().signal });
describe('appointment booking context', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		state.tenant = 'tenant-a';
		state.branch = 'branch-a';
		state.permissions = [PERMISSIONS.APPOINTMENTS_READ];
		state.queries = [];
	});
	it('loads before service selection using appointment read alone and the documented endpoint', async () => {
		useAppointmentBookingContext(() => 'branch-a');
		const query = state.queries[0]();
		expect(query.enabled).toBe(true);
		expect(query.meta.path).toBe('/appointments/branch/branch-a/booking-context');
		vi.mocked(server.get).mockResolvedValue({ data: { data: context() } });
		expect(await query.queryFn(signal())).toEqual(context());
		expect(server.get).toHaveBeenCalledWith(query.meta.path, { signal: expect.any(AbortSignal) });
	});
	it('does not enable context for another branch or without appointment read', () => {
		useAppointmentBookingContext(() => 'branch-b');
		expect(state.queries[0]().enabled).toBe(false);
		state.permissions = [PERMISSIONS.BRANCHES_READ];
		useAppointmentBookingContext(() => 'branch-a');
		expect(state.queries[1]().enabled).toBe(false);
	});
	it('rejects mismatched branch data and an omitted hours field instead of reporting missing hours', async () => {
		useAppointmentBookingContext(() => 'branch-a');
		const query = state.queries[0]();
		vi.mocked(server.get).mockResolvedValue({
			data: { data: { branch: { ...context().branch, uid: 'branch-b' } } }
		});
		await expect(query.queryFn(signal())).rejects.toThrow('does not match');
		vi.mocked(server.get).mockResolvedValue({ data: { data: { branch: { uid: 'branch-a' } } } });
		await expect(query.queryFn(signal())).rejects.toThrow('incomplete');
	});
	it('returns inactive or unconfigured context so the UI can explain the restriction', async () => {
		useAppointmentBookingContext(() => 'branch-a');
		const record = { branch: { ...context().branch, is_active: false } };
		vi.mocked(server.get).mockResolvedValue({ data: { data: record } });
		expect(await state.queries[0]().queryFn(signal())).toEqual(record);
	});
	it('rejects an in-flight response if the tenant changes', async () => {
		useAppointmentBookingContext(() => 'branch-a');
		const query = state.queries[0]();
		vi.mocked(server.get).mockImplementation(async () => {
			state.tenant = 'tenant-b';
			return { data: { data: context() } };
		});
		await expect(query.queryFn(signal())).rejects.toThrow('session or permissions changed');
	});
	it('separates cached context by tenant and branch', () => {
		const key = appointments.bookingContext('tenant-a', 'branch-a').keys();
		expect(appointments.bookingContext('tenant-b', 'branch-a').keys()).not.toEqual(key);
		expect(appointments.bookingContext('tenant-a', 'branch-b').keys()).not.toEqual(key);
	});
});
