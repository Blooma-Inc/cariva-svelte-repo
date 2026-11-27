import { PRACTITIONER_AVAILABILITY } from '$lib/constants/api';
import server from './index';
const path = (branchUid: string) => PRACTITIONER_AVAILABILITY.ALL.replace(':branch_uid', branchUid);
export const postPractitionerAvailability = (
	branchUid: string,
	payload: CreatePractitionerAvailabilityPayload
) => server.post<CarivaServerResp<PractitionerAvailabilityItem>>(path(branchUid), payload);
export const patchPractitionerAvailability = (
	branchUid: string,
	uid: string,
	payload: BranchHealthcareServicePayload
) =>
	server.patch<CarivaServerResp<PractitionerAvailabilityItem>>(
		`${path(branchUid)}/${uid}`,
		payload
	);
