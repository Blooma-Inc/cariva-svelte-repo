import { createQuery } from '@tanstack/svelte-query';
import { tfa } from './fetch-key-factory';

export function useFetchTFA(enabled = true): QueryHookResponse<TFASecurityItem | null | undefined> {
	const meta = tfa.get2FA();

	const query = createQuery(() => ({
		queryKey: meta.keys(),
		meta,
		enabled: enabled,
		select: (resp: CarivaServerResp<TFASecurityItem | null>) => resp.data
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
