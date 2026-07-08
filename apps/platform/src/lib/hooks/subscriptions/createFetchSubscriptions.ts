import { createQuery } from '@tanstack/svelte-query';
import { subscription } from './FetchKeyFactory';

export function createFetchSubscriptions(
	enabled = true
): QueryHookResponse<CarivaServerResp<Array<SubscriptionItem>> | undefined> {
	const meta = subscription.getAllSubscriptions();

	const { data, isLoading, error, status, refetch } = createQuery(() => ({
		queryKey: meta.keys(),
		meta,
		enabled,
		select: (resp: CarivaServerResp<Array<SubscriptionItem>>) => resp
	}));

	return { data, isLoading, error, status, refetch };
}
