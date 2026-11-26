import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	useFetchTenantDetails,
	useFetchTenantStats,
	useFetchTenantBranches
} from './use-fetch-tenant-details';
import { useFetchTenantAdmin } from './use-fetch-tenant-admin.svelte';
import { tenantDetailQueryKeys, tenant } from './fetch-key-factory';

type Options = {
	enabled: boolean;
	queryKey: readonly unknown[];
	meta: { path: string; params?: CarivaBaseQueryParams };
	select: (response: never) => unknown;
};
const state = vi.hoisted(() => ({ allowed: false, queries: [] as (() => Options)[] }));
vi.mock('$lib/store/index.svelte', () => ({
	stores: { PermissionStore: { can: () => state.allowed } }
}));
vi.mock('@tanstack/svelte-query', () => ({
	createQuery: (options: () => Options) => {
		state.queries.push(options);
		return {};
	}
}));

describe('tenant detail queries', () => {
	beforeEach(() => {
		state.allowed = false;
		state.queries = [];
	});

	it('gates every request and scopes paths and keys to the current tenant', () => {
		let uid = 'tenant-a';
		useFetchTenantDetails(() => uid);
		useFetchTenantStats(() => uid);
		useFetchTenantAdmin(() => uid);
		useFetchTenantBranches(
			() => uid,
			() => true
		);
		for (const options of state.queries) expect(options().enabled).toBe(false);
		state.allowed = true;
		for (const options of state.queries) {
			expect(options().enabled).toBe(true);
			expect(options().meta.path).toContain('/tenant/tenant-a/');
			expect(options().queryKey).toContain('tenant-a');
		}
		uid = 'tenant-b';
		for (const options of state.queries) {
			expect(options().meta.path).toContain('/tenant/tenant-b/');
			expect(options().queryKey).not.toContain('tenant-a');
		}
	});

	it('does not fetch branches while their section is disabled', () => {
		state.allowed = true;
		useFetchTenantBranches(
			() => 'tenant-a',
			() => false
		);
		expect(state.queries[0]().enabled).toBe(false);
	});

	it('invalidates all dependent sections for the affected tenant', () => {
		const keys = tenantDetailQueryKeys('tenant-a');
		expect(keys).toContainEqual(tenant.getTenantAdmin('tenant-a').keys());
		expect(keys).toContainEqual(tenant.getTenantDetails('tenant-a').keys());
		expect(keys).toContainEqual(tenant.getTenantStats('tenant-a').keys());
		expect(keys).toContainEqual(tenant.getTenantBranches('tenant-a').keys());
		expect(keys.flat()).not.toContain('tenant-b');
	});
	it('keeps branch search and pagination in independent immutable cache keys', () => {
		state.allowed = true;
		const params = { q: 'Main', limit: 10, offset: 0 };
		useFetchTenantBranches(
			() => 'tenant-a',
			() => true,
			() => params
		);
		const first = state.queries[0]();
		params.offset = 10;
		const second = state.queries[0]();
		expect(first.meta.params).toEqual({ q: 'Main', limit: 10, offset: 0 });
		expect(second.meta.params).toEqual({ q: 'Main', limit: 10, offset: 10 });
		expect(second.queryKey).not.toEqual(first.queryKey);
		params.q = 'Annex';
		params.limit = 20;
		expect(state.queries[0]().queryKey).not.toEqual(second.queryKey);
		const prefix = tenant.getTenantBranches('tenant-a').keys();
		expect(first.queryKey.slice(0, prefix.length)).toEqual(prefix);
		expect(second.queryKey.slice(0, prefix.length)).toEqual(prefix);
	});

	it('retains branch pagination metadata for the table controls', () => {
		useFetchTenantBranches(
			() => 'tenant-a',
			() => true
		);
		const response = {
			data: [],
			meta: { total: 23, page: 2, per_page: 10, total_pages: 3 },
			message: 'Retrieved',
			status: 'success'
		};
		expect(state.queries[0]().select(response as never)).toBe(response);
	});
});
