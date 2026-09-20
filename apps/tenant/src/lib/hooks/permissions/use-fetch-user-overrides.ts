import { createQuery } from '@tanstack/svelte-query';
import { permissions } from './fetch-key-factory';

export function useFetchUserPermissionsOverride(
	userUid: () => string
): QueryHookResponse<Array<UserPermissionOverrideItem> | undefined> {
	const meta = permissions.getUserPermissionsOverride(userUid());

	const query = createQuery(() => ({
		queryKey: meta.keys(),
		meta,
		enabled: Boolean(userUid),
		select: (resp: CarivaServerResp<Array<UserPermissionOverrideItem>>) => resp.data
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
