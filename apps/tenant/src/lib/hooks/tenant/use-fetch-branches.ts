import { createQuery } from '@tanstack/svelte-query';
import { tenant } from './fetch-key-factory';

export function useFetchTenantBranches(
	params: CarivaBaseQueryParams,
	enabled = true
): QueryHookResponse<CarivaServerResp<Array<TenantBranchItem>, OffsetPagination> | undefined> {
	const meta = tenant.getTenantBranches(params);

	const query = createQuery(() => ({
		queryKey: meta.keys(),
		meta,
		enabled,
		select: (resp: CarivaServerResp<Array<TenantBranchItem>, OffsetPagination>) => resp
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
