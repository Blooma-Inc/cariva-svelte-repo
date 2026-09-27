import { createQuery } from '@tanstack/svelte-query';
import { patients } from './fetch-key-factory';

export function useFetchTenantPatients(
	params: PatientSearchParams,
	enabled: boolean = true
): QueryHookResponse<
	CarivaServerResp<Array<LinkedTenantPatientItem>, OffsetPagination> | undefined
> {
	const meta = patients.getTenantPatients(params);

	const query = createQuery(() => ({
		queryKey: meta.keys(),
		meta,
		enabled,
		select: (resp: CarivaServerResp<Array<LinkedTenantPatientItem>, OffsetPagination>) => resp
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
