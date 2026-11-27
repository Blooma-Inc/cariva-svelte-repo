import { browser } from '$app/environment';
import { createQuery } from '@tanstack/svelte-query';
import { stores } from '$lib/store/index.svelte';
import { canAccessBranchServices } from '$lib/utils/branch-service-access';
import server from '$lib/requests';
import { branchHealthcareServices } from './fetch-key-factory';

export function useFetchBranchHealthcareServices(
	branchUid: () => string,
	params: HealthcareServiceQueryParams,
	enabled: () => boolean = () => true
) {
	return createQuery(() => {
		const tenantUid = stores.AppStore.currentTenant.uid;
		const selectedBranch = branchUid();
		const meta = branchHealthcareServices.list(
			stores.AppStore.currentTenant.uid ?? '',
			branchUid(),
			params
		);
		return {
			queryKey: meta.keys(),
			meta,
			enabled: browser && enabled() && canAccessBranchServices(stores, branchUid()),
			queryFn: async ({ signal }) => {
				if (
					!enabled() ||
					tenantUid !== stores.AppStore.currentTenant.uid ||
					selectedBranch !== branchUid() ||
					!canAccessBranchServices(stores, branchUid())
				)
					throw new Error('You do not have permission to view services for this branch.');
				return (
					await server.get<CarivaServerResp<BranchHealthcareServiceItem[], OffsetPagination>>(
						meta.path,
						{ signal, params: meta.params }
					)
				).data;
			}
		};
	});
}

export function useFetchBranchHealthcareService(branchUid: () => string, serviceUid: () => string) {
	return createQuery(() => {
		const tenantUid = stores.AppStore.currentTenant.uid;
		const selectedBranch = branchUid();
		const selectedService = serviceUid();
		const meta = branchHealthcareServices.detail(
			stores.AppStore.currentTenant.uid ?? '',
			branchUid(),
			serviceUid()
		);
		return {
			queryKey: meta.keys(),
			meta,
			enabled: browser && Boolean(serviceUid()) && canAccessBranchServices(stores, branchUid()),
			staleTime: 0,
			refetchOnMount: 'always' as const,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			queryFn: async ({ signal }) => {
				if (
					!serviceUid() ||
					selectedService !== serviceUid() ||
					tenantUid !== stores.AppStore.currentTenant.uid ||
					selectedBranch !== branchUid() ||
					!canAccessBranchServices(stores, branchUid())
				)
					throw new Error('You do not have permission to view this branch service.');
				return (
					await server.get<CarivaServerResp<BranchHealthcareServiceItem>>(meta.path, { signal })
				).data.data;
			}
		};
	});
}
