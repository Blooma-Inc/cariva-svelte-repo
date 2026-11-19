import { ENCOUNTERS } from '$lib/constants/api';

export const encounters = {
	getTypes(tenant_uid: string | undefined) {
		return {
			path: ENCOUNTERS.TYPES,
			keys: () => [ENCOUNTERS.TYPES, tenant_uid] as const
		};
	},
	getPatientEncounters(
		tenant_uid: string | undefined,
		branch_uid: string,
		patient_uid: string,
		params: Partial<CarivaBaseQueryParams> = {}
	) {
		const queryParams = { ...params, patient_uid };
		return {
			path: ENCOUNTERS.ALL.replace(':branch_uid', branch_uid),
			params: queryParams,
			keys: () => [ENCOUNTERS.ALL, tenant_uid, branch_uid, queryParams] as const
		};
	}
};
