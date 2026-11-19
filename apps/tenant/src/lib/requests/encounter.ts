import { ENCOUNTERS } from '$lib/constants/api';
import server from './index';

export const postEncounter = (branchUid: string, payload: CreateEncounterPayload) =>
	server.post<CarivaServerResp<EncounterItem>>(
		ENCOUNTERS.ALL.replace(':branch_uid', branchUid),
		payload
	);
