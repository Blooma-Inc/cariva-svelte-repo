import { browser } from '$app/environment';
import { createQuery } from '@tanstack/svelte-query';
import { facility } from './fetch-key-factory';

export function useFetchFacilityOverview(
	branch_uid: () => string,
	enabled: () => boolean
): QueryHookResponse<FacilityOverview | undefined> {
	const query = createQuery(() => {
		const meta = facility.getOverview(branch_uid());
		return {
			queryKey: meta.keys(),
			meta,
			enabled: browser && enabled() && Boolean(branch_uid()),
			select: (resp: CarivaServerResp<FacilityOverview>) => resp.data
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
