import { createQuery } from '@tanstack/svelte-query';
import { permissions } from './fetch-key-factory';

export function useFetchPermissionsCatalog(): QueryHookResponse<Array<string> | undefined> {
	const meta = permissions.getPermissionsCatalog();

	const query = createQuery(() => ({
		queryKey: meta.keys(),
		meta,
		select: (resp: CarivaServerResp<Array<string>>) => resp.data
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
