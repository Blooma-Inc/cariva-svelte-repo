import { beforeEach, describe, expect, it, vi } from 'vitest';
import BranchHealthcareServiceStore from './index.svelte';
import type { RootStore } from '../index.svelte';
import { PERMISSIONS } from '$lib/configs/permissions';
import {
	postBranchHealthcareService,
	patchBranchHealthcareService
} from '$lib/requests/branch-healthcare-services';

vi.mock('$lib/requests/branch-healthcare-services', () => ({
	postBranchHealthcareService: vi.fn(),
	patchBranchHealthcareService: vi.fn()
}));
vi.mock('@cariva/ui/components/toast/index.js', () => ({ toast: { success: vi.fn() } }));
const setup = (permissions: string[] = Object.values(PERMISSIONS), tokenBranch = 'branch-a') =>
	new BranchHealthcareServiceStore({
		AppStore: { currentTenant: { uid: 'tenant-a' } },
		AuthStore: {
			accessToken: `eyJhbGciOiJub25lIn0.${Buffer.from(JSON.stringify({ user: { tenant_uid: 'tenant-a', branch_uid: tokenBranch } })).toString('base64url')}.signature`
		},
		PermissionStore: { can: (permission: string) => permissions.includes(permission) }
	} as unknown as RootStore);

describe('branch service mutations', () => {
	beforeEach(() => vi.resetAllMocks());
	it('blocks missing permissions, catalogue access on assignment, and cross-branch writes without manage', async () => {
		await setup([PERMISSIONS.BRANCH_HEALTHCARE_SERVICES_READ]).save(
			'branch-a',
			'catalog-a',
			true,
			{}
		);
		await setup([
			PERMISSIONS.BRANCH_HEALTHCARE_SERVICES_READ,
			PERMISSIONS.BRANCH_HEALTHCARE_SERVICES_CREATE
		]).save('branch-a', 'catalog-a', true, {});
		await setup([
			PERMISSIONS.BRANCH_HEALTHCARE_SERVICES_READ,
			PERMISSIONS.BRANCH_HEALTHCARE_SERVICES_UPDATE
		]).save('branch-b', 'catalog-a', false, { is_active: false });
		expect(postBranchHealthcareService).not.toHaveBeenCalled();
		expect(patchBranchHealthcareService).not.toHaveBeenCalled();
	});
	it('rejects empty changes and invalid availability before sending requests', async () => {
		const store = setup();
		await store.save('branch-a', 'catalog-a', false, {});
		await store.save('branch-a', 'catalog-a', false, {
			availability: {
				available_time: [{ days_of_week: [], all_day: true }],
				not_available_time: []
			}
		});
		expect(patchBranchHealthcareService).not.toHaveBeenCalled();
	});
	it('preserves status-only updates, explicit clearing, and configured empty schedules', async () => {
		vi.mocked(patchBranchHealthcareService).mockResolvedValue({
			data: { message: 'Saved' }
		} as never);
		const store = setup();
		await store.save('branch-a', 'catalog-a', false, { is_active: false });
		await store.save('branch-a', 'catalog-a', false, { availability: null });
		await store.save('branch-a', 'catalog-a', false, {
			availability: { available_time: [], not_available_time: [] }
		});
		expect(patchBranchHealthcareService).toHaveBeenNthCalledWith(1, 'branch-a', 'catalog-a', {
			is_active: false
		});
		expect(patchBranchHealthcareService).toHaveBeenNthCalledWith(2, 'branch-a', 'catalog-a', {
			availability: null
		});
		expect(patchBranchHealthcareService).toHaveBeenNthCalledWith(3, 'branch-a', 'catalog-a', {
			availability: { available_time: [], not_available_time: [] }
		});
	});
	it('prevents duplicate assignment submissions and uses the catalogue UID', async () => {
		let finish!: (value: never) => void;
		vi.mocked(postBranchHealthcareService).mockImplementation(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				})
		);
		const store = setup();
		const success = vi.fn();
		const pending = store.save(
			'branch-a',
			'catalog-a',
			true,
			{ is_active: true, availability: null },
			success
		);
		await store.save('branch-a', 'catalog-a', true, {});
		finish({ data: { message: 'Assigned' } } as never);
		await pending;
		expect(postBranchHealthcareService).toHaveBeenCalledExactlyOnceWith('branch-a', 'catalog-a', {
			is_active: true,
			availability: null
		});
		expect(success).toHaveBeenCalledOnce();
		expect(store.loading).toBe(false);
	});
	it('keeps failed assignments open for correction and retry', async () => {
		vi.mocked(postBranchHealthcareService).mockRejectedValue(
			new Error('Service is already configured')
		);
		const store = setup();
		const success = vi.fn();
		await store.save('branch-a', 'catalog-a', true, {}, success);
		expect(store.error).toBe('Service is already configured');
		expect(store.loading).toBe(false);
		expect(success).not.toHaveBeenCalled();
	});
});
