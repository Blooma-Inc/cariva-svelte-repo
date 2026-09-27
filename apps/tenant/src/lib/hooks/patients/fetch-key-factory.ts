import { PATIENTS } from '$lib/constants/api';

export const patients = {
	getTenantPatients(params: PatientSearchParams) {
		return {
			path: PATIENTS.ALL,
			keys: () => [PATIENTS.ALL] as const,
			params
		};
	},

	getPatient(patient_uid: string) {
		return {
			path: PATIENTS.SINGLE.replace(':uid', patient_uid),
			keys: () => [PATIENTS.ALL, PATIENTS.SINGLE, patient_uid]
		};
	},

	getRegistrySearch(params: PatientRegistrySearchParams) {
		return {
			path: PATIENTS.REGISTRY_SEARCH,
			keys: () => [PATIENTS.REGISTRY_SEARCH] as const,
			params
		};
	}
};
