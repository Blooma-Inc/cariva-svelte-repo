import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/paths', () => ({ resolve: (path: string) => path }));

import ROUTES, { getRoute } from './routes.svelte';
import { PERMISSIONS } from './permissions';
import { getMenuForUser } from './menu-items';

describe('platform access configuration', () => {
	it('guards the grouped dashboard route', () => {
		expect(getRoute('/(protected)')?.requiredPermission).toBe(PERMISSIONS.PLATFORM_READ);
	});

	it('guards direct navigation to tenant details', () => {
		expect(getRoute('/(protected)/tenants/[id]')?.requiredPermission).toBe(
			PERMISSIONS.TENANTS_READ
		);
	});

	it('keeps password reset and verification public', () => {
		expect(ROUTES.RESET_PWD.isProtected).toBe(false);
		expect(ROUTES.VERIFY.isProtected).toBe(false);
	});

	it('hides all privileged navigation without grants', () => {
		expect(getMenuForUser([])).toEqual([]);
	});

	it('shows tenant navigation without requiring a first-role match', () => {
		expect(getMenuForUser([PERMISSIONS.TENANTS_READ]).map((item) => item.url)).toEqual([
			ROUTES.TENANT.path
		]);
	});

	it('requires management access for system settings', () => {
		expect(getMenuForUser([PERMISSIONS.PLATFORM_READ]).map((item) => item.url)).not.toContain(
			ROUTES.SYSTEM_SETTINGS.path
		);
		expect(getMenuForUser([PERMISSIONS.PLATFORM_MANAGE]).map((item) => item.url)).toContain(
			ROUTES.SYSTEM_SETTINGS.path
		);
	});
});
