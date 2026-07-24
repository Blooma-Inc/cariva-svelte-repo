import { TENANT } from '$lib/constants/api';
import type { TProvisionTenantSchema } from '$routes/(protected)/tenants/modals/tenant-form-modal/validation';
import server from './index';

export const postTenantRequest = async (payload: TProvisionTenantSchema) =>
	await server.post<CarivaServerResp<boolean>>(TENANT.TENANCY_REQUEST, payload);

export const postActivateTenant = async (tenant_uid: string) =>
	await server.post<CarivaServerResp<boolean>>(TENANT.ACTIVATE_TENANT, {
		tenant_uid,
		notes: 'All good!'
	});
