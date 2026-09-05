import { createQuery } from '@tanstack/svelte-query';
import { role } from './fetch-key-factory';

export function useFetchRoles(
	enabled = true
): QueryHookResponse<CarivaServerResp<Array<TenantRoleItem>, null> | undefined> {
	const meta = role.getRoles();

	const query = createQuery(() => ({
		queryKey: meta.keys(),
		meta,
		enabled,
		select: (resp: CarivaServerResp<Array<TenantRoleItem>, null>) => resp
	}));

	// let data = query.data;

	// if (data) {
	// 	data.data = data.data.filter((role) => role.scope !== 'platform');
	// }

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
