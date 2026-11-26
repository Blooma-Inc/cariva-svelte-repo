import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	useFetchHealthcareService,
	useFetchHealthcareServices
} from './use-fetch-healthcare-services';
import { healthcareServices } from './fetch-key-factory';
import server from '$lib/requests';

type Options = {
	enabled: boolean;
	queryKey: readonly unknown[];
	meta: { params?: HealthcareServiceQueryParams };
	queryFn: (context: { signal: AbortSignal }) => Promise<unknown>;
};
const state = vi.hoisted(() => ({
	allowed: false,
	tenantUid: 'tenant-a',
	queries: [] as (() => Options)[]
}));
vi.mock('$app/environment', () => ({ browser: true }));
vi.mock('$lib/store/index.svelte', () => ({
	stores: {
		PermissionStore: { can: () => state.allowed },
		AppStore: {
			currentTenant: {
				get uid() {
					return state.tenantUid;
				}
			}
		}
	}
}));
vi.mock('$lib/requests', () => ({ default: { get: vi.fn() } }));
vi.mock('@tanstack/svelte-query', () => ({
	createQuery: (options: () => Options) => {
		state.queries.push(options);
		return {};
	}
}));

describe('healthcare service queries', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		state.allowed = false;
		state.tenantUid = 'tenant-a';
		state.queries = [];
	});
	it('blocks automatic and manual fetches without read permission', async () => {
		useFetchHealthcareServices({ limit: 10, offset: 0 });
		useFetchHealthcareService(() => 'service-a');
		for (const getOptions of state.queries) {
			expect(getOptions().enabled).toBe(false);
			await expect(getOptions().queryFn({ signal: new AbortController().signal })).rejects.toThrow(
				'permission'
			);
		}
		expect(server.get).not.toHaveBeenCalled();
	});
	it('keeps tenant and filter scopes independent and snapshots query parameters', () => {
		state.allowed = true;
		const params = { q: 'Therapy', limit: 10, offset: 0, is_active: false };
		useFetchHealthcareServices(params);
		const first = state.queries[0]();
		params.offset = 10;
		const second = state.queries[0]();
		expect(first.meta.params?.offset).toBe(0);
		expect(second.queryKey).not.toEqual(first.queryKey);
		expect(first.meta.params?.is_active).toBe(false);
		state.tenantUid = 'tenant-b';
		expect(state.queries[0]().queryKey).not.toEqual(second.queryKey);
		expect(first.queryKey.slice(0, 2)).toEqual(healthcareServices.all('tenant-a'));
	});
	it('disables requests until the tenant and service are available', () => {
		state.allowed = true;
		state.tenantUid = '';
		useFetchHealthcareServices({ limit: 10, offset: 0 });
		expect(state.queries[0]().enabled).toBe(false);
		state.tenantUid = 'tenant-a';
		useFetchHealthcareService(() => '');
		expect(state.queries[1]().enabled).toBe(false);
	});
	it('blocks stale catalogue callbacks after a tenant switch', async () => {
		state.allowed = true;
		useFetchHealthcareServices({ limit: 10, offset: 0 });
		const options = state.queries[0]();
		state.tenantUid = 'tenant-b';
		await expect(options.queryFn({ signal: new AbortController().signal })).rejects.toThrow(
			'permission'
		);
		expect(server.get).not.toHaveBeenCalled();
	});
});
