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
	getTenantAdmin(tenant_uid: string) {
		return {
			path: TENANT.ADMIN.replace(':uid', tenant_uid),
			keys: () => [TENANT.ADMIN, tenant_uid] as const
		};
	}
};
