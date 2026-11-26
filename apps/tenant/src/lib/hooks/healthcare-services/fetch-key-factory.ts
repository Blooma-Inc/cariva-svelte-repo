import { HEALTHCARE_SERVICES } from '$lib/constants/api';

export const healthcareServices = {
	all: (tenantUid: string) => [HEALTHCARE_SERVICES.ALL, tenantUid] as const,
	list(tenantUid: string, params: HealthcareServiceQueryParams) {
		const snapshot = { ...params };
		return {
			path: HEALTHCARE_SERVICES.ALL,
			params: snapshot,
			keys: () => [...healthcareServices.all(tenantUid), 'list', snapshot] as const
		};
	},
	detail(tenantUid: string, uid: string) {
		return {
			path: HEALTHCARE_SERVICES.SINGLE.replace(':uid', uid),
			keys: () => [...healthcareServices.all(tenantUid), 'detail', uid] as const
		};
	}
};
