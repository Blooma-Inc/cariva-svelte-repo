import { PERMISSIONS } from '$lib/constants/api';
import server from './index';

export const getMyPermissions = async () => server.get<CarivaServerResp<string[]>>(PERMISSIONS.ME);
