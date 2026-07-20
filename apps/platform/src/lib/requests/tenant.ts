import { PLATFORM } from '$lib/constants/api';
import type { TProvisionTenantSchema } from '$routes/(protected)/tenants/new/validation';
import server from './index';

export const postTenantRequest = async (payload: TProvisionTenantSchema) =>
	await server.post<CarivaServerResp<boolean>>(PLATFORM.TENANCY_REQUEST, payload);
