import { PLATFORM } from '$lib/constants/api';

export const platform = {
	getTenants(query: Partial<TenantQuery>) {
		return {
			path: PLATFORM.TENANTS,
			keys: () => [PLATFORM.TENANTS, query] as const,
			params: query
		};
	}
};
