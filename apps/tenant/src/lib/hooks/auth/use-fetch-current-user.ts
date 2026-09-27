import { createQuery } from '@tanstack/svelte-query';
import { auth } from './fetch-key-factory';

export function useFetchCurrentUser(
	enabled = true
): QueryHookResponse<CurrentUserItem | undefined> {
	const meta = auth.getCurrentUser();

	const query = createQuery(() => ({
		queryKey: meta.keys(),
		meta,
		enabled,
		select: (resp: CarivaServerResp<CurrentUserItem>) => resp.data
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
