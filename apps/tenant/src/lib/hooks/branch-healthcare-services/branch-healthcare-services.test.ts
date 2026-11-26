import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	useFetchBranchHealthcareService,
	useFetchBranchHealthcareServices
} from './use-fetch-branch-healthcare-services';
import { PERMISSIONS } from '$lib/configs/permissions';
import server from '$lib/requests';

type Options = {
	enabled: boolean;
	queryKey: readonly unknown[];
	meta: { path: string; params?: HealthcareServiceQueryParams };
	queryFn: (context: { signal: AbortSignal }) => Promise<unknown>;
};
const state = vi.hoisted(() => ({
	tenant: 'tenant-a',
	token: '',
	permissions: [] as string[],
	queries: [] as (() => Options)[]
}));
vi.mock('$app/environment', () => ({ browser: true }));
vi.mock('$lib/store/index.svelte', () => ({
	stores: {
		PermissionStore: { can: (permission: string) => state.permissions.includes(permission) },
		AppStore: {
			currentTenant: {
				get uid() {
					return state.tenant;
				}
			}
		},
		AuthStore: {
			get accessToken() {
				return state.token;
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
const token = (branch: string) =>
	`eyJhbGciOiJub25lIn0.${Buffer.from(JSON.stringify({ user: { tenant_uid: state.tenant, branch_uid: branch } })).toString('base64url')}.signature`;

describe('branch service queries', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		state.tenant = 'tenant-a';
		state.token = token('branch-a');
		state.permissions = [PERMISSIONS.BRANCH_HEALTHCARE_SERVICES_READ];
		state.queries = [];
	});
	it('requires the action permission and a matching token branch or branches.manage for automatic and manual reads', async () => {
		useFetchBranchHealthcareServices(() => 'branch-b', { limit: 10, offset: 0 });
		const getOptions = state.queries[0];
		expect(getOptions().enabled).toBe(false);
		await expect(getOptions().queryFn({ signal: new AbortController().signal })).rejects.toThrow(
			'permission'
		);
		state.permissions.push(PERMISSIONS.BRANCHES_MANAGE);
		expect(getOptions().enabled).toBe(true);
		state.permissions = [PERMISSIONS.BRANCHES_MANAGE];
		expect(getOptions().enabled).toBe(false);
		expect(server.get).not.toHaveBeenCalled();
	});
	it('snapshots filters and scopes keys to tenant, branch, and catalogue UID', () => {
		state.permissions.push(PERMISSIONS.BRANCHES_MANAGE);
		let branch = 'branch-a';
		const params = { limit: 10, offset: 0, is_active: false };
		useFetchBranchHealthcareServices(() => branch, params);
		const first = state.queries[0]();
		params.offset = 10;
		expect(state.queries[0]().queryKey).not.toEqual(first.queryKey);
		expect(first.meta.params).toMatchObject({ offset: 0, is_active: false });
		branch = 'branch-b';
		expect(state.queries[0]().queryKey).toContain('branch-b');
		useFetchBranchHealthcareService(
			() => branch,
			() => 'catalog-a'
		);
		expect(state.queries[1]().meta.path).toBe('/healthcare-services/branch/branch-b/catalog-a');
		state.tenant = 'tenant-b';
		state.token = token(branch);
		expect(state.queries[0]().queryKey).toContain('tenant-b');
	});
	it('blocks stale query callbacks after switching branch or tenant', async () => {
		state.permissions.push(PERMISSIONS.BRANCHES_MANAGE);
		let branch = 'branch-a';
		useFetchBranchHealthcareServices(() => branch, { limit: 10, offset: 0 });
		const first = state.queries[0]();
		branch = 'branch-b';
		await expect(first.queryFn({ signal: new AbortController().signal })).rejects.toThrow(
			'permission'
		);
		const second = state.queries[0]();
		state.tenant = 'tenant-b';
		state.token = token(branch);
		await expect(second.queryFn({ signal: new AbortController().signal })).rejects.toThrow(
			'permission'
		);
		expect(server.get).not.toHaveBeenCalled();
	});
	it('disables detail reads until a catalogue UID and valid scope are available', () => {
		useFetchBranchHealthcareService(
			() => 'branch-a',
			() => ''
		);
		expect(state.queries[0]().enabled).toBe(false);
		state.token = 'invalid';
		useFetchBranchHealthcareService(
			() => 'branch-a',
			() => 'catalog-a'
		);
		expect(state.queries[1]().enabled).toBe(false);
	});
});
