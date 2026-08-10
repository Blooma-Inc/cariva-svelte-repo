import { createQuery } from '@tanstack/svelte-query';
import { user } from './fetch-key-factory';

export function useFetchUserProfile(
	enabled = true
): QueryHookResponse<UserProfileItem | undefined> {
	const meta = user.getUserProfile();

	const query = createQuery(() => ({
		queryKey: meta.keys(),
		meta,
		enabled,
		select: (resp: CarivaServerResp<UserProfileItem>) => resp.data
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
