import { browser } from '$app/environment';
import { createQuery } from '@tanstack/svelte-query';
import { facility } from './fetch-key-factory';

export function useFetchFacilityBeds(
	branch_uid: () => string,
	params: () => BedQueryParams,
	enabled: () => boolean
): QueryHookResponse<CarivaServerResp<BedItem[], OffsetPagination> | undefined> {
	const query = createQuery(() => {
		const meta = facility.getBeds(branch_uid(), params());
		return {
			queryKey: meta.keys(),
			meta,
			enabled: browser && enabled() && Boolean(branch_uid()),
			select: (resp: CarivaServerResp<BedItem[], OffsetPagination>) => resp
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
