import { PERMISSIONS } from '$lib/constants/api';
import server from './index';

export const getMyPermissions = async () =>
	server.get<CarivaServerResp<Array<string>, null>>(PERMISSIONS.ME);

export const postOverrideUserPermissions = async (payload: UserPermissionsOverridePayload) =>
	await server.post<CarivaServerResp<boolean, null>>(PERMISSIONS.OVERRIDE, payload);

export const delRemoveOverrideUserPermission = async (uid: string) =>
	await server.delete<CarivaServerResp<boolean, null>>(
		PERMISSIONS.REMOVE_OVERRIDE.replace(':uid', uid)
	);
