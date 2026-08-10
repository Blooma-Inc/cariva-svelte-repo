import { TENANT } from '$lib/constants/api';

export const tenant = {
	getDashboardStats() {
		return {
			path: TENANT.STATS,
			keys: () => [TENANT.STATS] as const
		};
	},

	getCurrentTenant() {
		return {
			path: TENANT.CURRENT_TENANT,
			keys: () => [TENANT.CURRENT_TENANT] as const
		};
	},

	getTenantBranches(params: CarivaBaseQueryParams) {
		return {
			path: TENANT.BRANCHES,
			keys: () => [TENANT.BRANCHES] as const,
			params
		};
	}
};
