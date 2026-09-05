import { createQuery } from '@tanstack/svelte-query';
import { tenant } from './fetch-key-factory';

export function useFetchTenantUsers(
	params: StaffQueryParams,
	enabled = true
): QueryHookResponse<CarivaServerResp<Array<StaffItem>, OffsetPagination> | undefined> {
	const meta = tenant.getTenantUsers(params);

	const query = createQuery(() => ({
		queryKey: meta.keys(),
		meta,
		enabled,
		select: (resp: CarivaServerResp<Array<StaffItem>, OffsetPagination>) => resp
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
