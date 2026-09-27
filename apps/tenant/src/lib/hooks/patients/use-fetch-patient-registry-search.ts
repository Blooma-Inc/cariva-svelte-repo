import { createQuery } from '@tanstack/svelte-query';
import { patients } from './fetch-key-factory';

export function useFetchPatientRegistrySearch(
	params: PatientRegistrySearchParams,
	enabled: boolean = true
): QueryHookResponse<Array<PatientSearchResultItem> | undefined> {
	const meta = patients.getRegistrySearch(params);

	const query = createQuery(() => ({
		queryKey: meta.keys(),
		meta,
		enabled,
		select: (resp: CarivaServerResp<Array<PatientSearchResultItem>, null>) => resp.data
	}));

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
