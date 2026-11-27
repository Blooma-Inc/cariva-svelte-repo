import { beforeEach, describe, expect, it, vi } from 'vitest';
import PractitionerAvailabilityStore from './index.svelte';
import type { RootStore } from '../index.svelte';
import { PERMISSIONS } from '$lib/configs/permissions';
import {
	postPractitionerAvailability,
	patchPractitionerAvailability
} from '$lib/requests/practitioner-availability';

vi.mock('$lib/requests/practitioner-availability', () => ({
	postPractitionerAvailability: vi.fn(),
	patchPractitionerAvailability: vi.fn()
}));
vi.mock('@cariva/ui/components/toast/index.js', () => ({ toast: { success: vi.fn() } }));
const context: PractitionerScheduleContext = {
	branch_uid: 'branch-a',
	branch_name: 'Main',
	timezone: 'Africa/Lagos',
	branch_is_active: true,
	practitioner_uid: 'self',
	practitioner_name: 'Self',
	practitioner_is_active: true,
	assignment_uid: 'assignment-a',
	assignment_is_active: true
};
const record = (overrides: Partial<PractitionerAvailabilityItem> = {}) =>
	({
		uid: 'schedule-a',
		tenant_uid: 'tenant-a',
		branch_uid: 'branch-a',
		practitioner_uid: 'self',
		assignment_uid: 'assignment-a',
		branch_healthcare_service_uid: null,
		is_active: true,
		availability: null,
		practitioner_is_active: true,
		assignment_is_active: true,
		branch_is_active: true,
		offering_is_active: null,
		catalog_is_active: null,
		...overrides
	}) as PractitionerAvailabilityItem;
const payload = () => ({
	practitioner_uid: 'self',
	branch_healthcare_service_uid: null,
	is_active: true,
	availability: null
});
const ownPermissions: string[] = [
	PERMISSIONS.PRACTITIONER_AVAILABILITY_READ,
	PERMISSIONS.PRACTITIONER_AVAILABILITY_CREATE,
	PERMISSIONS.PRACTITIONER_AVAILABILITY_UPDATE
];
function setup(permissions: string[] = ownPermissions) {
	const root = {
		AppStore: { currentTenant: { uid: 'tenant-a' } },
		AuthStore: {
			accessToken: `eyJhbGciOiJub25lIn0.${Buffer.from(JSON.stringify({ user: { uid: 'self', tenant_uid: 'tenant-a', branch_uid: 'branch-a' } })).toString('base64url')}.signature`
		},
		PermissionStore: { can: (permission: string) => permissions.includes(permission) }
	};
	return { store: new PractitionerAvailabilityStore(root as unknown as RootStore), root };
}

describe('practitioner schedule mutations', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(postPractitionerAvailability).mockResolvedValue({
			data: { message: 'Created' }
		} as never);
		vi.mocked(patchPractitionerAvailability).mockResolvedValue({
			data: { message: 'Saved' }
		} as never);
	});
	it('allows self setup and editing without manage, staff-read, or offering-read permissions', async () => {
		const { store } = setup();
		await store.save(context, payload());
		await store.save(
			context,
			{ availability: { available_time: [], not_available_time: [] } },
			record()
		);
		expect(postPractitionerAvailability).toHaveBeenCalledExactlyOnceWith('branch-a', payload());
		expect(patchPractitionerAvailability).toHaveBeenCalledExactlyOnceWith(
			'branch-a',
			'schedule-a',
			{ availability: { available_time: [], not_available_time: [] } }
		);
	});
	it('requires manage in addition to action permissions for someone else', async () => {
		const { store } = setup();
		await store.save(
			{ ...context, practitioner_uid: 'other' },
			{ ...payload(), practitioner_uid: 'other' }
		);
		await store.save(
			{ ...context, practitioner_uid: 'other' },
			{ is_active: false },
			record({ practitioner_uid: 'other' })
		);
		expect(postPractitionerAvailability).not.toHaveBeenCalled();
		expect(patchPractitionerAvailability).not.toHaveBeenCalled();
		await setup([...ownPermissions, PERMISSIONS.PRACTITIONER_AVAILABILITY_MANAGE]).store.save(
			{ ...context, practitioner_uid: 'other' },
			{ ...payload(), practitioner_uid: 'other' }
		);
		expect(postPractitionerAvailability).toHaveBeenCalledOnce();
	});
	it('blocks both read-only users and write permissions without read access', async () => {
		await setup([PERMISSIONS.PRACTITIONER_AVAILABILITY_READ]).store.save(context, payload());
		await setup([PERMISSIONS.PRACTITIONER_AVAILABILITY_READ]).store.save(
			context,
			{ is_active: false },
			record()
		);
		await setup([PERMISSIONS.PRACTITIONER_AVAILABILITY_CREATE]).store.save(context, payload());
		expect(postPractitionerAvailability).not.toHaveBeenCalled();
		expect(patchPractitionerAvailability).not.toHaveBeenCalled();
	});

	it('does not treat manage as a substitute for create/update or branch management', async () => {
		await setup([
			PERMISSIONS.PRACTITIONER_AVAILABILITY_READ,
			PERMISSIONS.PRACTITIONER_AVAILABILITY_MANAGE
		]).store.save(context, payload());
		await setup([...ownPermissions, PERMISSIONS.PRACTITIONER_AVAILABILITY_MANAGE]).store.save(
			{ ...context, branch_uid: 'branch-b' },
			payload()
		);
		expect(postPractitionerAvailability).not.toHaveBeenCalled();
		await setup([...ownPermissions, PERMISSIONS.BRANCHES_MANAGE]).store.save(
			{ ...context, branch_uid: 'branch-b' },
			payload()
		);
		expect(postPractitionerAvailability).toHaveBeenCalledExactlyOnceWith('branch-b', payload());
	});
	it('rejects mismatched identities, immutable fields, and empty patches', async () => {
		const { store } = setup([...ownPermissions, PERMISSIONS.PRACTITIONER_AVAILABILITY_MANAGE]);
		await store.save(context, { is_active: false }, record({ practitioner_uid: 'other' }));
		await store.save(context, { is_active: false }, record({ tenant_uid: 'other-tenant' }));
		await store.save(context, { is_active: false }, record({ branch_uid: 'branch-b' }));
		await store.save(
			context,
			{ practitioner_uid: 'self' } as unknown as BranchHealthcareServicePayload,
			record()
		);
		await store.save(
			context,
			{ branch_healthcare_service_uid: 'offering-a' } as unknown as BranchHealthcareServicePayload,
			record()
		);
		await store.save(context, {}, record());
		expect(patchPractitionerAvailability).not.toHaveBeenCalled();
	});
	it('blocks creation without an active practitioner assignment and rejects assignment injection', async () => {
		const { store } = setup();
		await store.save({ ...context, assignment_is_active: false }, payload());
		await store.save({ ...context, practitioner_is_active: false }, payload());
		await store.save(context, {
			...payload(),
			assignment_uid: 'injected'
		} as CreatePractitionerAvailabilityPayload);
		expect(postPractitionerAvailability).not.toHaveBeenCalled();
	});
	it('preserves explicit clearing and status-only updates, and blocks activation of inactive contexts', async () => {
		const { store } = setup();
		await store.save(context, { is_active: true }, record({ branch_is_active: false }));
		expect(patchPractitionerAvailability).not.toHaveBeenCalled();
		await store.save(context, { is_active: false }, record({ assignment_is_active: false }));
		await store.save(context, { availability: null }, record());
		expect(patchPractitionerAvailability).toHaveBeenNthCalledWith(1, 'branch-a', 'schedule-a', {
			is_active: false
		});
		expect(patchPractitionerAvailability).toHaveBeenNthCalledWith(2, 'branch-a', 'schedule-a', {
			availability: null
		});
	});
	it('prevents duplicate submissions and handles server conflicts without closing the form', async () => {
		let finish!: (value: never) => void;
		vi.mocked(postPractitionerAvailability).mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				})
		);
		const { store } = setup();
		const success = vi.fn();
		const pending = store.save(context, payload(), undefined, success);
		await store.save(context, payload());
		finish({ data: { message: 'Created' } } as never);
		await pending;
		expect(postPractitionerAvailability).toHaveBeenCalledOnce();
		expect(success).toHaveBeenCalledOnce();
		vi.mocked(postPractitionerAvailability).mockRejectedValueOnce(
			new Error('Schedule already exists')
		);
		success.mockClear();
		await store.save(context, payload(), undefined, success);
		expect(success).not.toHaveBeenCalled();
		expect(store.error).toBe('Schedule already exists');
		expect(store.loading).toBe(false);
	});
	it('does not close a different tenant’s screen when an older request finishes', async () => {
		let finish!: (value: never) => void;
		vi.mocked(postPractitionerAvailability).mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				})
		);
		const { store, root } = setup();
		const success = vi.fn();
		const pending = store.save(context, payload(), undefined, success);
		root.AppStore.currentTenant.uid = 'tenant-b';
		finish({ data: { message: 'Created' } } as never);
		await pending;
		expect(success).not.toHaveBeenCalled();
	});
});
