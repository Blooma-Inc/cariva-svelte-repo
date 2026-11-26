import { TENANT } from '$lib/constants/api';

export const tenant = {
	getTenants(query: Partial<TenantQuery>) {
		return {
			path: TENANT.TENANTS,
			keys: () => [TENANT.TENANTS, query] as const,
			params: query
		};
	},
	getTenantSuggestedCode(hospital_name: string, city: string) {
		return {
			path: TENANT.SUGGEST_CODE,
			keys: () => [TENANT.SUGGEST_CODE, hospital_name, city] as const,
			params: { hospital_name, city }
		};
	},
	getTenantDetails(tenant_uid: string) {
		return {
			path: TENANT.DETAILS.replace(':uid', tenant_uid),
			keys: () => [TENANT.DETAILS, tenant_uid] as const
		};
	},
	getTenantStats(tenant_uid: string) {
		return {
			path: TENANT.STATS.replace(':uid', tenant_uid),
			keys: () => [TENANT.STATS, tenant_uid] as const
		};
	},
	getTenantBranches(tenant_uid: string, params?: CarivaBaseQueryParams) {
		return {
			path: TENANT.BRANCHES.replace(':uid', tenant_uid),
			keys: () =>
				params
					? ([TENANT.BRANCHES, tenant_uid, params] as const)
					: ([TENANT.BRANCHES, tenant_uid] as const),
			params
		};
	},
	getTenantAdmin(tenant_uid: string) {
		return {
			path: TENANT.ADMIN.replace(':uid', tenant_uid),
			keys: () => [TENANT.ADMIN, tenant_uid] as const
		};
	}
};

export function tenantDetailQueryKeys(tenant_uid: string) {
	return [
		tenant.getTenants({}).keys().slice(0, 1),
		tenant.getTenantDetails(tenant_uid).keys(),
		tenant.getTenantStats(tenant_uid).keys(),
		tenant.getTenantAdmin(tenant_uid).keys(),
		tenant.getTenantBranches(tenant_uid).keys()
	];
}
