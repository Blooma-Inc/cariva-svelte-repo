import { createQuery } from '@tanstack/svelte-query';
import { tenant } from './fetch-key-factory';
import { stores } from '$lib/store/index.svelte';
import { PERMISSIONS } from '$lib/configs/permissions';

export function useFetchTenantAdmin(
	getTenantUuid: () => string = () => ''
): QueryHookResponse<PlatformTenantUserItem | undefined> {
	const query = createQuery(() => {
		const tenant_uid = getTenantUuid();
		const meta = tenant.getTenantAdmin(tenant_uid);

		return {
			queryKey: meta.keys(),
			meta,
			enabled: !!tenant_uid && stores.PermissionStore.can(PERMISSIONS.TENANTS_READ),
			select: (resp: CarivaServerResp<PlatformTenantUserItem>) => resp.data
		};
	});

	return {
		get data() {
			return query.data;
		},

		get isLoading() {
			return query.isLoading;
		},

		get error() {
			return query.error;
		},
		get status() {
			return query.status;
		},
		refetch: query.refetch
	};
}
