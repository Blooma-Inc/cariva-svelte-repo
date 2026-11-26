import { createQuery } from '@tanstack/svelte-query';
import { stores } from '$lib/store/index.svelte';
import { PERMISSIONS } from '$lib/configs/permissions';
import { tenant } from './fetch-key-factory';

function useTenantQuery<T>(
	getUid: () => string,
	factory: (uid: string) => { path: string; keys: () => readonly string[] },
	enabled: () => boolean = () => true
) {
	return createQuery(() => {
		const uid = getUid();
		const meta = factory(uid);
		return {
			queryKey: meta.keys(),
			meta,
			enabled: !!uid && enabled() && stores.PermissionStore.can(PERMISSIONS.TENANTS_READ),
			select: (response: CarivaServerResp<T>) => response.data
		};
	});
}

export const useFetchTenantDetails = (getUid: () => string) =>
	useTenantQuery<PlatformTenantItem>(getUid, tenant.getTenantDetails);

export const useFetchTenantStats = (getUid: () => string) =>
	useTenantQuery<PlatformTenantStats>(getUid, tenant.getTenantStats);

export function useFetchTenantBranches(
	getUid: () => string,
	enabled: () => boolean,
	getParams: () => CarivaBaseQueryParams = () => ({ limit: 10, offset: 0 })
) {
	return createQuery(() => {
		const uid = getUid();
		const meta = tenant.getTenantBranches(uid, { ...getParams() });
		return {
			queryKey: meta.keys(),
			meta,
			enabled: !!uid && enabled() && stores.PermissionStore.can(PERMISSIONS.TENANTS_READ),
			select: (response: CarivaServerResp<PlatformTenantBranchItem[], OffsetPagination | null>) =>
				response
		};
	});
}
