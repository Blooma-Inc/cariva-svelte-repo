import { createQuery } from '@tanstack/svelte-query';
import { subscription } from './FetchKeyFactory';

export function createFetchSubscriptions(
	enabled: boolean = true
): QueryHookResponse<CarivaServerResp<Array<SubscriptionItem>> | undefined> {
	const meta = subscription.getAllSubscriptions();

	const query = createQuery(() => ({
		queryKey: meta.keys(),
		meta,
		enabled,
		select: (resp: CarivaServerResp<Array<SubscriptionItem>>) => resp
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
