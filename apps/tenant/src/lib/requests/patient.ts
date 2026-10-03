import { PATIENTS } from '$lib/constants/api';
import type { PatientRegistrySearch } from '$routes/(protected)/patients/register/components/registry-search.svelte';
import type { PatientBio, PatientReg } from '$routes/(protected)/patients/register/validation';
import server from './index';

export const getPatientRegistrySearch = async (params: PatientRegistrySearch) =>
	await server.get<CarivaServerResp<Array<PatientSearchResultItem>>>(PATIENTS.REGISTRY_SEARCH, {
		params
	});

export const postCheckExisting = async (payload: PatientBio) =>
	await server.post<CarivaServerResp<PatientExistenceCheckResult>>(
		PATIENTS.CHECK_EXISTING,
		payload
	);

export const postPatientRegistration = async (
	patientReg: PatientReg,
	dismissed_candidate_uids: Array<string>,
	was_ambiguous_check: boolean
) => {
	const payload = {
		...patientReg,
		dismissed_candidate_uids,
		was_ambiguous_check
	};
	return await server.post<CarivaServerResp<PatientExistenceCheckResult>>(
		PATIENTS.REGISTER,
		payload
	);
};

export const postLinkPatientToTenant = async (patient_uid: string) =>
	await server.post<CarivaServerResp<boolean>>(
		PATIENTS.LINK_TO_TENANT.replace(':patient_uid', patient_uid)
	);
