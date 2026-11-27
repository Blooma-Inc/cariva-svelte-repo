import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AppointmentStore from './index.svelte';
import { appointmentBranch } from '$lib/utils/appointment-booking';
import { PERMISSIONS } from '$lib/configs/permissions';
import type { RootStore } from '../index.svelte';
import {
	getAppointmentAvailability,
	postAppointment,
	getAppointmentDetail,
	patchAppointmentTime,
	postAppointmentAction
} from '$lib/requests/appointments';
vi.mock('$lib/requests/appointments', () => ({
	getAppointmentAvailability: vi.fn(),
	postAppointment: vi.fn(),
	getAppointmentDetail: vi.fn(),
	patchAppointmentTime: vi.fn(),
	postAppointmentAction: vi.fn()
}));
vi.mock('@cariva/ui/components/toast/index.js', () => ({ toast: { success: vi.fn() } }));
const payload: CreateAppointmentPayload = {
	patient_uid: '11111111-1111-4111-8111-111111111111',
	practitioner_uid: '22222222-2222-4222-8222-222222222222',
	branch_healthcare_service_uid: '33333333-3333-4333-8333-333333333333',
	starts_at: '2030-01-02T09:00:00Z',
	ends_at: '2030-01-02T09:30:00Z',
	reason_for_visit: 'Review'
};
const token = (branch_uid = 'branch-a') =>
	`eyJhbGciOiJub25lIn0.${Buffer.from(JSON.stringify({ user: { tenant_uid: 'tenant-a', branch_uid } })).toString('base64url')}.signature`;
function setup() {
	const permissions: string[] = Object.values(PERMISSIONS);
	const root = {
		AppStore: { currentTenant: { uid: 'tenant-a' } },
		AuthStore: {
			accessToken: token(),
			user: {
				branch_assignments: [
					{
						revoked_at: null,
						branch: { uid: 'branch-a', name: 'Main', timezone: 'Africa/Lagos', is_active: true }
					},
					{
						revoked_at: null,
						branch: { uid: 'branch-b', name: 'Other', timezone: 'UTC', is_active: true }
					}
				]
			}
		},
		PermissionStore: { can: (permission: string) => permissions.includes(permission) }
	};
	return { root, permissions, store: new AppointmentStore(root as unknown as RootStore) };
}
const available = () =>
	({ data: { data: { ...payload, timezone: 'Africa/Lagos', intervals: [payload] } } }) as never;
describe('appointment creation', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2030-01-01T00:00:00Z'));
		vi.mocked(getAppointmentAvailability).mockResolvedValue(available());
		vi.mocked(postAppointment).mockResolvedValue({
			data: {
				data: {
					...payload,
					uid: 'appointment-a',
					branch_uid: 'branch-a',
					tenant_uid: 'tenant-a',
					status: 'booked'
				}
			}
		} as never);
	});
	afterEach(() => vi.useRealTimers());
	it('uses the token branch rather than choosing another assignment', () => {
		const { root } = setup();
		expect(appointmentBranch(root as unknown as RootStore)?.branch_uid).toBe('branch-a');
		root.AuthStore.accessToken = token('');
		expect(appointmentBranch(root as unknown as RootStore)).toBeNull();
	});
	it('rechecks the exact patient interval and sends the documented payload to the branch path', async () => {
		const { store } = setup();
		expect(await store.create('branch-a', payload)).toMatchObject({ uid: 'appointment-a' });
		expect(getAppointmentAvailability).toHaveBeenCalledWith('branch-a', {
			patient_uid: payload.patient_uid,
			practitioner_uid: payload.practitioner_uid,
			branch_healthcare_service_uid: payload.branch_healthcare_service_uid,
			starts_at: payload.starts_at,
			ends_at: payload.ends_at
		});
		expect(postAppointment).toHaveBeenCalledWith('branch-a', payload);
	});
	it('blocks cross-branch booking even with manage permissions', async () => {
		const { store } = setup();
		await store.create('branch-b', payload);
		expect(getAppointmentAvailability).not.toHaveBeenCalled();
		expect(postAppointment).not.toHaveBeenCalled();
	});
	it('blocks missing permissions and past or invalid intervals', async () => {
		const { store, permissions } = setup();
		await store.create('branch-a', { ...payload, starts_at: payload.ends_at });
		await store.create('branch-a', { ...payload, starts_at: '2029-01-01T09:00:00Z' });
		permissions.splice(permissions.indexOf(PERMISSIONS.APPOINTMENTS_CREATE), 1);
		await store.create('branch-a', payload);
		expect(postAppointment).not.toHaveBeenCalled();
		expect(getAppointmentAvailability).not.toHaveBeenCalled();
	});
	it('preserves a conflict instead of posting when the selected slot has disappeared', async () => {
		const { store } = setup();
		vi.mocked(getAppointmentAvailability).mockResolvedValue({
			data: { data: { ...payload, intervals: [] } }
		} as never);
		expect(await store.create('branch-a', payload)).toBeNull();
		expect(store.slotConflict).toBe(true);
		expect(postAppointment).not.toHaveBeenCalled();
	});
	it('does not post if the active branch changes during availability revalidation', async () => {
		const { root, store } = setup();
		vi.mocked(getAppointmentAvailability).mockImplementation(async () => {
			root.AuthStore.accessToken = token('branch-b');
			return available();
		});
		await store.create('branch-a', payload);
		expect(postAppointment).not.toHaveBeenCalled();
	});
	it('treats a server conflict as a slot refresh and never retries the creation', async () => {
		const { store } = setup();
		vi.mocked(postAppointment).mockRejectedValue({ isAxiosError: true, response: { status: 409 } });
		expect(await store.create('branch-a', payload)).toBeNull();
		expect(store.slotConflict).toBe(true);
		expect(postAppointment).toHaveBeenCalledTimes(1);
		expect(store.loading).toBe(false);
	});
});

const record = (): AppointmentDetailItem => ({
	...payload,
	uid: 'appointment-a',
	branch_uid: 'branch-a',
	tenant_uid: 'tenant-a',
	patient_tenant_link_uid: 'link-a',
	created_at: '2030-01-01T00:00:00Z',
	updated_at: '2030-01-01T00:00:00Z',
	status: 'booked',
	patient: null,
	practitioner: null,
	service: null,
	created_by: null,
	allowed_actions: ['arrive', 'reschedule', 'cancel', 'mark_no_show']
});
describe('appointment worklist actions', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2030-01-01T00:00:00Z'));
		vi.mocked(getAppointmentDetail).mockResolvedValue({ data: { data: record() } } as never);
		vi.mocked(postAppointmentAction).mockResolvedValue({ data: {} } as never);
		vi.mocked(patchAppointmentTime).mockResolvedValue({ data: {} } as never);
	});
	afterEach(() => vi.useRealTimers());
	it('records arrival with appointment permissions alone after rechecking the latest actions', async () => {
		const { store, permissions } = setup();
		permissions.splice(
			0,
			permissions.length,
			PERMISSIONS.APPOINTMENTS_READ,
			PERMISSIONS.APPOINTMENTS_UPDATE
		);
		expect(await store.perform('branch-a', record(), 'arrive')).toBe(true);
		expect(getAppointmentDetail).toHaveBeenCalledWith('branch-a', 'appointment-a');
		expect(postAppointmentAction).toHaveBeenCalledWith(
			'branch-a',
			'appointment-a',
			'arrive',
			undefined
		);
	});
	it('does not request or mutate across branches or without update permission', async () => {
		const { store, permissions } = setup();
		await store.perform('branch-b', record(), 'arrive');
		permissions.splice(permissions.indexOf(PERMISSIONS.APPOINTMENTS_UPDATE), 1);
		await store.perform('branch-a', record(), 'arrive');
		expect(getAppointmentDetail).not.toHaveBeenCalled();
		expect(postAppointmentAction).not.toHaveBeenCalled();
	});
	it('refuses an action removed by the server since the list was loaded', async () => {
		const { store } = setup();
		vi.mocked(getAppointmentDetail).mockResolvedValue({
			data: { data: { ...record(), status: 'cancelled', allowed_actions: [] } }
		} as never);
		expect(await store.perform('branch-a', record(), 'arrive')).toBe(false);
		expect(store.actionConflict).toBe(true);
		expect(postAppointmentAction).not.toHaveBeenCalled();
	});
	it('refuses a mutation if the branch session changes during the details refresh', async () => {
		const { store, root } = setup();
		vi.mocked(getAppointmentDetail).mockImplementation(async () => {
			root.AuthStore.accessToken = token('branch-b');
			return { data: { data: record() } } as never;
		});
		await store.perform('branch-a', record(), 'arrive');
		expect(postAppointmentAction).not.toHaveBeenCalled();
	});
	it('requires a cancellation reason and sends the trimmed reason', async () => {
		const { store } = setup();
		expect(await store.perform('branch-a', record(), 'cancel', { cancellation_reason: '  ' })).toBe(
			false
		);
		expect(getAppointmentDetail).not.toHaveBeenCalled();
		expect(
			await store.perform('branch-a', record(), 'cancel', {
				cancellation_reason: '  Patient request  '
			})
		).toBe(true);
		expect(postAppointmentAction).toHaveBeenCalledWith('branch-a', 'appointment-a', 'cancel', {
			cancellation_reason: 'Patient request'
		});
	});
	it('patches only a valid future interval for a reschedule', async () => {
		const { store } = setup();
		const interval = { starts_at: payload.starts_at, ends_at: payload.ends_at };
		expect(await store.perform('branch-a', record(), 'reschedule', interval)).toBe(true);
		expect(patchAppointmentTime).toHaveBeenCalledWith('branch-a', 'appointment-a', interval);
		expect(postAppointmentAction).not.toHaveBeenCalled();
	});
	it('requires encounter create permission even when the server offers start encounter', async () => {
		const { store, permissions } = setup();
		permissions.splice(permissions.indexOf(PERMISSIONS.ENCOUNTERS_CREATE), 1);
		expect(
			await store.perform(
				'branch-a',
				{ ...record(), status: 'checked-in', allowed_actions: ['start_encounter'] },
				'start_encounter',
				{ encounter_class: 'outpatient' }
			)
		).toBe(false);
		expect(getAppointmentDetail).not.toHaveBeenCalled();
	});
	it('preserves server conflicts and does not retry a mutation', async () => {
		const { store } = setup();
		vi.mocked(postAppointmentAction).mockRejectedValue({
			isAxiosError: true,
			response: { status: 409 }
		});
		expect(await store.perform('branch-a', record(), 'arrive')).toBe(false);
		expect(store.actionConflict).toBe(true);
		expect(store.actionLoading).toBe(false);
		expect(postAppointmentAction).toHaveBeenCalledTimes(1);
	});
});
