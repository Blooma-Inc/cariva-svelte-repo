import { createQuery } from '@tanstack/svelte-query';
import { platform } from './FetchKeyFactory';

export function useFetchTenants(
	params: Partial<TenantQuery>
): QueryHookResponse<CarivaServerResp<Array<PlatformTenantItem>, OffsetPagination> | undefined> {
	const query = createQuery(() => {
		const meta = platform.getTenants(params);

		return {
			queryKey: meta.keys(),
			meta,
			select: (resp: CarivaServerResp<Array<PlatformTenantItem>, OffsetPagination>) => resp
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
