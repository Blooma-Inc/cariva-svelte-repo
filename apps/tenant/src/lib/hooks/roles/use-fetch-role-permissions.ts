import { createQuery } from '@tanstack/svelte-query';
import { role } from './fetch-key-factory';

export function useFetchRolePermissions(
	roleUid: () => string
): QueryHookResponse<Array<PermissionItem> | undefined> {
	const meta = role.getPermissions(roleUid());

	const query = createQuery(() => ({
		queryKey: meta.keys(),
		meta,
		enabled: Boolean(roleUid),
		select: (resp: CarivaServerResp<Array<PermissionItem>, null>) => resp.data
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
