import { TENANT } from '$lib/constants/api';

export const tenant = {
	getTenantSuggestedCode(hospital_name: string, city: string) {
		return {
			path: TENANT.SUGGEST_CODE,
			keys: () => [TENANT.SUGGEST_CODE, hospital_name, city] as const,
			params: { hospital_name, city }
		};
	}
};
