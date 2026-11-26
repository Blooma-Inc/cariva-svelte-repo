import { beforeEach, describe, expect, it, vi } from 'vitest';
import HealthcareServiceStore from './index.svelte';
import type { RootStore } from '../index.svelte';
import { postHealthcareService, patchHealthcareService } from '$lib/requests/healthcare-services';
import { PERMISSIONS } from '$lib/configs/permissions';

vi.mock('$lib/requests/healthcare-services', () => ({
	postHealthcareService: vi.fn(),
	patchHealthcareService: vi.fn()
}));
vi.mock('@cariva/ui/components/toast/index.js', () => ({ toast: { success: vi.fn() } }));
const setup = (permissions = Object.values(PERMISSIONS) as string[]) =>
	new HealthcareServiceStore({
		AppStore: { currentTenant: { uid: 'tenant-a' } },
		PermissionStore: { can: (permission: string) => permissions.includes(permission) }
	} as unknown as RootStore);

describe('healthcare service mutations', () => {
	beforeEach(() => vi.resetAllMocks());
	it('requires read and the applicable write permission', async () => {
		await setup([PERMISSIONS.HEALTHCARE_SERVICES_CREATE]).save('', { name: 'Therapy' });
		await setup([PERMISSIONS.HEALTHCARE_SERVICES_READ]).save('', { name: 'Therapy' });
		await setup([
			PERMISSIONS.HEALTHCARE_SERVICES_READ,
			PERMISSIONS.HEALTHCARE_SERVICES_CREATE
		]).save('service-a', { is_active: false });
		expect(postHealthcareService).not.toHaveBeenCalled();
		expect(patchHealthcareService).not.toHaveBeenCalled();
	});
	it('rejects empty patches and invalid names', async () => {
		const store = setup();
		await store.save('', { name: '  ' });
		await store.save('service-a', {});
		await store.save('service-a', { name: 'a'.repeat(256) });
		expect(postHealthcareService).not.toHaveBeenCalled();
		expect(patchHealthcareService).not.toHaveBeenCalled();
	});
	it('prevents duplicate submissions and trims service names', async () => {
		let finish!: (value: never) => void;
		vi.mocked(postHealthcareService).mockImplementation(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				})
		);
		const store = setup();
		const success = vi.fn();
		const pending = store.save('', { name: ' Therapy ', description: null }, success);
		expect(store.loading).toBe(true);
		await store.save('', { name: 'Duplicate' });
		finish({ data: { message: 'Created' } } as never);
		await pending;
		expect(postHealthcareService).toHaveBeenCalledExactlyOnceWith({
			name: 'Therapy',
			description: null
		});
		expect(success).toHaveBeenCalledOnce();
		expect(store.loading).toBe(false);
	});
	it('sends description clearing and status-only changes without overwriting other fields', async () => {
		vi.mocked(patchHealthcareService).mockResolvedValue({ data: { message: 'Updated' } } as never);
		const store = setup();
		await store.save('service-a', { description: null });
		await store.save('service-a', { is_active: false });
		expect(patchHealthcareService).toHaveBeenNthCalledWith(1, 'service-a', { description: null });
		expect(patchHealthcareService).toHaveBeenNthCalledWith(2, 'service-a', { is_active: false });
	});
	it('keeps failed mutations open for correction and retry', async () => {
		vi.mocked(postHealthcareService).mockRejectedValue(new Error('Service already exists'));
		const store = setup();
		const success = vi.fn();
		await store.save('', { name: 'Therapy' }, success);
		expect(store.error).toBe('Service already exists');
		expect(store.loading).toBe(false);
		expect(success).not.toHaveBeenCalled();
	});
});
