import { browser } from '$app/environment';
import { createInfiniteQuery } from '@tanstack/svelte-query';
import server from '$lib/requests';
import { facility } from './fetch-key-factory';

export function useFetchFacilityBeds(branch_uid: () => string, ward_uid: () => string) {
	const query = createInfiniteQuery(() => {
		const meta = facility.getBeds(branch_uid(), { ward_uid: ward_uid(), limit: 100, offset: 0 });
		return {
			queryKey: meta.keys(),
			meta,
			enabled: browser && Boolean(branch_uid()) && Boolean(ward_uid()),
			initialPageParam: 0,
			queryFn: async ({ signal, pageParam }) => {
				const { data } = await server.get<CarivaServerResp<BedItem[], OffsetPagination>>(
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
