import { HEALTHCARE_SERVICES } from '$lib/constants/api';

export const branchHealthcareServices = {
	all: (tenantUid: string, branchUid: string) =>
		[HEALTHCARE_SERVICES.ALL, tenantUid, 'branch', branchUid] as const,
	list(tenantUid: string, branchUid: string, params: HealthcareServiceQueryParams) {
		const snapshot = { ...params };
		return {
			path: HEALTHCARE_SERVICES.BRANCH.replace(':branch_uid', branchUid),
			params: snapshot,
			keys: () => [...branchHealthcareServices.all(tenantUid, branchUid), 'list', snapshot] as const
		};
	},
	detail(tenantUid: string, branchUid: string, serviceUid: string) {
		return {
			path: `${HEALTHCARE_SERVICES.BRANCH.replace(':branch_uid', branchUid)}/${serviceUid}`,
			keys: () =>
				[...branchHealthcareServices.all(tenantUid, branchUid), 'detail', serviceUid] as const
		};
	}
};
