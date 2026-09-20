import { createQuery } from '@tanstack/svelte-query';
import { role } from './fetch-key-factory';

export function useFetchRoles(
	enabled = true
): QueryHookResponse<CarivaServerResp<Array<RoleItem>, null> | undefined> {
	const meta = role.getRoles();

	const query = createQuery(() => ({
		queryKey: meta.keys(),
		meta,
		enabled,
		select: (resp: CarivaServerResp<Array<RoleItem>, null>) => resp
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
