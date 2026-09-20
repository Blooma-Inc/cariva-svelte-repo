import { createQuery } from '@tanstack/svelte-query';
import { role } from './fetch-key-factory';

export function useFetchRolePermissionMatrix(
	enabled = true
): QueryHookResponse<Array<PermissionItem> | undefined> {
	const meta = role.getRolePermissionMatrix();

	const query = createQuery(() => ({
		queryKey: meta.keys(),
		meta,
		enabled,
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
