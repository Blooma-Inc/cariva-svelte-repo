import { expect, it, vi } from 'vitest';
import { getMenuForUser } from '$lib/configs/menu-items';
import ROUTES from '$lib/configs/routes.svelte';
import { PERMISSIONS } from '$lib/configs/permissions';
import type { RootStore } from '../index.svelte';
import PermissionStore from './index.svelte';

vi.mock('$app/paths', () => ({ resolve: (path: string) => path }));

it('updates the sidebar menu when permissions arrive, change, and clear', () => {
	const store = new PermissionStore({} as RootStore);
	const subscribedPermissions = store.permissions;
	const menu = () => getMenuForUser([...subscribedPermissions]).map((item) => item.title);

	expect(menu()).toEqual([]);
	store.setPermissions([
		PERMISSIONS.PLATFORM_READ,
		PERMISSIONS.PLATFORM_MANAGE,
		PERMISSIONS.TENANTS_READ,
		PERMISSIONS.TENANTS_CREATE
	]);
	expect(menu()).toEqual([
		ROUTES.DASHBOARD.title,
		ROUTES.TENANT.title,
		ROUTES.SYSTEM_SETTINGS.title,
		ROUTES.AUDIT_LOGS.title,
		ROUTES.PLATFORM_ANALYTICS.title
	]);
	expect(store.can(PERMISSIONS.TENANTS_CREATE)).toBe(true);
	store.setPermissions([PERMISSIONS.TENANTS_READ]);
	expect(menu()).toEqual([ROUTES.TENANT.title]);
	expect(store.can(PERMISSIONS.TENANTS_CREATE)).toBe(false);
	store.clear();
	expect(menu()).toEqual([]);
});
