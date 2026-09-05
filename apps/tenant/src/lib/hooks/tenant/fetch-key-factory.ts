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
			keys: () => [TENANT.STATS, TENANT.CURRENT_TENANT] as const
		};
	},

	getTenantBranches(params: CarivaBaseQueryParams) {
		return {
			path: TENANT.BRANCHES,
			keys: () => [TENANT.STATS, TENANT.BRANCHES] as const,
			params
		};
	},

	getTenantUsers(params: StaffQueryParams) {
		return {
			path: TENANT.BRANCHES,
			keys: () => [TENANT.STATS, TENANT.BRANCHES] as const,
			params
		};
	}
};
