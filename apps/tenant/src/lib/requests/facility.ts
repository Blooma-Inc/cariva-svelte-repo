import { FACILITY } from '$lib/constants/api';
import server from './index';

export const postWard = async (branch_uid: string, payload: CreateWardPayload) =>
	await server.post<CarivaServerResp<WardItem>>(
		FACILITY.WARDS.replace(':branch_uid', branch_uid),
		payload
	);

export const patchWard = async (branch_uid: string, ward_uid: string, payload: UpdateWardPayload) =>
	await server.patch<CarivaServerResp<WardItem>>(
		`${FACILITY.WARDS.replace(':branch_uid', branch_uid)}/${ward_uid}`,
		payload
	);
