import { createQuery } from '@tanstack/svelte-query';
import { branch } from './fetch-key-factory';

export function useFetchBranchByUid(
	branch_uid: string
): QueryHookResponse<BranchItemWithAdmin | undefined> {
	const meta = branch.getBranchByUid(branch_uid);

	const query = createQuery(() => ({
		queryKey: meta.keys(),
		meta,
		select: (resp: CarivaServerResp<BranchItemWithAdmin>) => resp.data
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
