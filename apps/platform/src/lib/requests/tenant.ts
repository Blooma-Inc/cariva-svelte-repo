import { TENANT } from '$lib/constants/api';
import type { TProvisionTenantSchema } from '$routes/(protected)/tenants/modals/tenant-form-modal.svelte';
import server from './index';

export const postTenantRequest = async (payload: TProvisionTenantSchema) =>
	await server.post<CarivaServerResp<boolean>>(TENANT.TENANCY_REQUEST, payload);

export const postActivateTenant = async (tenant_uid: string) =>
	await server.post<CarivaServerResp<boolean>>(TENANT.ACTIVATE_TENANT, {
		tenant_uid,
		notes: 'All good!'
	});

export const postTenantLifecycle = (
	action: TenantLifecycleAction,
	tenant_uid: string,
	reason: string
) => {
	const paths = {
		activate: TENANT.ACTIVATE_TENANT,
		reject: TENANT.REJECT_TENANT,
		suspend: TENANT.SUSPEND_TENANT
	};
	return server.post<CarivaServerResp<boolean>>(paths[action], {
		tenant_uid,
		...(action === 'activate' ? { notes: reason || null } : { reason })
	});
};
