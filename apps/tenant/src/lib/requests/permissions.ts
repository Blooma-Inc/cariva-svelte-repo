import { PERMISSIONS } from '$lib/constants/api';
import server from './index';

export const getMyPermissions = async () =>
	server.get<CarivaServerResp<Array<string>, null>>(PERMISSIONS.ME);

export const postOverridePermissions = async (payload: Record<string, string>) =>
	await server.post<CarivaServerResp<boolean, null>>(PERMISSIONS.OVERRIDE, payload);
