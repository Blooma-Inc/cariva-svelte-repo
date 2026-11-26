import { HEALTHCARE_SERVICES } from '$lib/constants/api';
import server from './index';

const path = (branchUid: string, serviceUid: string) =>
	`${HEALTHCARE_SERVICES.BRANCH.replace(':branch_uid', branchUid)}/${serviceUid}`;
export const postBranchHealthcareService = (
	branchUid: string,
	serviceUid: string,
	payload: BranchHealthcareServicePayload
) =>
	server.post<CarivaServerResp<BranchHealthcareServiceItem>>(path(branchUid, serviceUid), payload);
export const patchBranchHealthcareService = (
	branchUid: string,
	serviceUid: string,
	payload: BranchHealthcareServicePayload
) =>
	server.patch<CarivaServerResp<BranchHealthcareServiceItem>>(path(branchUid, serviceUid), payload);
