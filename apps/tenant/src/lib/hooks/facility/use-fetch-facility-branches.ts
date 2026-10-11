import { browser } from '$app/environment';
import { createInfiniteQuery } from '@tanstack/svelte-query';
import server from '$lib/requests';
import { tenant } from '$lib/hooks/tenant/fetch-key-factory';

export function useFetchFacilityBranches() {
	const query = createInfiniteQuery(() => {
		const meta = tenant.getTenantBranches({ limit: 100, offset: 0 });
		return {
			queryKey: [...meta.keys(), 'wards-workspace'],
			meta,
			enabled: browser,
			initialPageParam: 0,
			queryFn: async ({ signal, pageParam }) => {
				const { data } = await server.get<CarivaServerResp<TenantBranchItem[], OffsetPagination>>(
					meta.path,
					{ signal, params: { ...meta.params, offset: pageParam } }
				);
				return data;
			},
			getNextPageParam: (lastPage, _pages, lastOffset) =>
				lastPage.data.length && lastOffset + lastPage.data.length < lastPage.meta.total
					? lastOffset + lastPage.data.length
					: undefined
		};
	});

	return {
		get data() {
			return query.data;
		},
		get status() {
			return query.status;
		},
		get error() {
			return query.error;
		},
		get isFetching() {
			return query.isFetching;
		},
		get isFetchingNextPage() {
			return query.isFetchingNextPage;
		},
		get hasNextPage() {
			return query.hasNextPage;
		},
		fetchNextPage: query.fetchNextPage,
		refetch: query.refetch
	};
}
