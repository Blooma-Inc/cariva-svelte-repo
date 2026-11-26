import { browser } from '$app/environment';
import { createQuery } from '@tanstack/svelte-query';
import { stores } from '$lib/store/index.svelte';
import { PERMISSIONS } from '$lib/configs/permissions';
import server from '$lib/requests';
import { healthcareServices } from './fetch-key-factory';

function canRead() {
	return (
		stores.PermissionStore.can(PERMISSIONS.HEALTHCARE_SERVICES_READ) &&
		Boolean(stores.AppStore.currentTenant.uid)
	);
}
export function useFetchHealthcareServices(
	params: HealthcareServiceQueryParams,
	enabled: () => boolean = () => true
) {
	return createQuery(() => {
		const tenantUid = stores.AppStore.currentTenant.uid ?? '';
		const meta = healthcareServices.list(tenantUid, params);
		return {
			queryKey: meta.keys(),
			meta,
			enabled: browser && canRead() && enabled(),
			queryFn: async ({ signal }) => {
				if (!canRead() || !enabled() || tenantUid !== stores.AppStore.currentTenant.uid)
					throw new Error('You do not have permission to view healthcare services.');
				return (
					await server.get<CarivaServerResp<HealthcareServiceItem[], OffsetPagination>>(meta.path, {
						signal,
						params: meta.params
					})
				).data;
			}
		};
	});
}
export function useFetchHealthcareService(uid: () => string) {
	return createQuery(() => {
		const tenantUid = stores.AppStore.currentTenant.uid ?? '';
		const serviceUid = uid();
		const meta = healthcareServices.detail(tenantUid, serviceUid);
		return {
			queryKey: meta.keys(),
			meta,
			enabled: browser && canRead() && Boolean(uid()),
			staleTime: 0,
			refetchOnMount: 'always',
			refetchInterval: false,
			refetchOnReconnect: false,
			queryFn: async ({ signal }) => {
				if (
					!canRead() ||
					!uid() ||
					tenantUid !== stores.AppStore.currentTenant.uid ||
					serviceUid !== uid()
				)
					throw new Error('You do not have permission to view this service.');
				return (await server.get<CarivaServerResp<HealthcareServiceItem>>(meta.path, { signal }))
					.data.data;
			}
		};
	});
}
