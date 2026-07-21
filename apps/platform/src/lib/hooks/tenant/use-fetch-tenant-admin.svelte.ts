import { createQuery } from '@tanstack/svelte-query';
import { tenant } from './fetch-key-factory';

export function useFetchTenantAdmin(
	getTenantUuid: () => string = () => ''
): QueryHookResponse<PlatformTenantUserItem | undefined> {
	const query = createQuery(() => {
		const tenant_uid = getTenantUuid();
		const meta = tenant.getTenantAdmin(tenant_uid);

		return {
			queryKey: meta.keys(),
			meta,
			enabled: !!tenant_uid,
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
