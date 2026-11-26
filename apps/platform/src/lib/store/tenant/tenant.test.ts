import { beforeEach, describe, expect, it, vi } from 'vitest';
import { postTenantLifecycle } from '$lib/requests/tenant';
import type { RootStore } from '../index.svelte';
import TenantStore from './index.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$lib/configs/routes.svelte', () => ({ default: {} }));
vi.mock('$lib/requests/tenant', () => ({
	postTenantLifecycle: vi.fn(),
	postActivateTenant: vi.fn(),
	postTenantRequest: vi.fn()
}));
vi.mock('@cariva/ui/components/toast/index.js', () => ({
	toast: { success: vi.fn(), error: vi.fn() }
}));

const setup = (allowed = true) =>
	new TenantStore({ PermissionStore: { canAll: () => allowed } } as unknown as RootStore);

describe('tenant lifecycle', () => {
	beforeEach(() => vi.resetAllMocks());

	it('rejects submissions without management permissions', async () => {
		const store = setup(false);
		await store.changeTenantStatus('tenant-a', 'active', 'suspend', 'Reason');
		expect(postTenantLifecycle).not.toHaveBeenCalled();
		expect(store.errors.isTenantLifecycle).toContain('permission');
	});

	it('rejects unsupported transitions and blank reasons', async () => {
		const store = setup();
		await store.changeTenantStatus('tenant-a', 'suspended', 'activate', '');
		await store.changeTenantStatus('tenant-a', 'active', 'suspend', '  ');
		expect(postTenantLifecycle).not.toHaveBeenCalled();
		expect(store.errors.isTenantLifecycle).toBe('Enter a reason.');
	});

	it('keeps the mutation busy and prevents duplicate submissions', async () => {
		let finish!: (value: never) => void;
		vi.mocked(postTenantLifecycle).mockImplementation(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				})
		);
		const store = setup();
		const success = vi.fn();
		const pending = store.changeTenantStatus(
			'tenant-a',
			'active',
			'suspend',
			'  Overdue  ',
			success
		);
		expect(store.loaders.isTenantLifecycle).toBe(true);
		await store.changeTenantStatus('tenant-a', 'active', 'suspend', 'Duplicate');
		finish({ data: { message: 'Suspended' } } as never);
		await pending;
		expect(postTenantLifecycle).toHaveBeenCalledExactlyOnceWith('suspend', 'tenant-a', 'Overdue');
		expect(success).toHaveBeenCalledOnce();
		expect(store.loaders.isTenantLifecycle).toBe(false);
	});

	it('preserves the dialog on server failure and permits retry', async () => {
		vi.mocked(postTenantLifecycle).mockRejectedValue(new Error('Tenant changed status'));
		const store = setup();
		const success = vi.fn();
		await store.changeTenantStatus('tenant-a', 'active', 'suspend', 'Reason', success);
		expect(success).not.toHaveBeenCalled();
		expect(store.errors.isTenantLifecycle).toBe('Tenant changed status');
		expect(store.loaders.isTenantLifecycle).toBe(false);
	});
});
