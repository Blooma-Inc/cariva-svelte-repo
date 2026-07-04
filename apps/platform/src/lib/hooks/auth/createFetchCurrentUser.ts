import { createQuery } from '@tanstack/svelte-query';
import { auth } from './FetchKeyFactory';

export function createFetchCurrentUser(enabled = true): QueryHookResponse<UserItem | undefined> {
	const meta = auth.getCurrentUser();

	const { data, isLoading, error, status } = createQuery(() => ({
		queryKey: meta.keys(),
		meta,
		enabled,
		select: (resp: CarivaServerResp<UserItem>) => resp.data
	}));

	return { data, isLoading, error, status };
}
