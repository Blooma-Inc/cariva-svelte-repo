<script lang="ts" module>
	import { browser } from '$app/env';
	import server from './index';

	export const staleTime = 1000 * 60 * 5; // 5 minutes
	export const refetchInterval = 1000 * 60 * 8; // 8 minutes
	export const gcTime = 1000 * 60 * 60; // 1 hour

	const call = {
		carivaServer: server
	};

	export type TRequestClient = keyof typeof call;
</script>

<script lang="ts">
	import {
		QueryClient,
		QueryClientProvider,
		type QueryFunction,
		type QueryKey
	} from '@tanstack/svelte-query';

	function getReqClient(client: TRequestClient = 'carivaServer') {
		return call[client] ?? client;
	}

	const queryFn: QueryFunction<unknown, QueryKey, number> = async ({ signal, pageParam, meta }) => {
		const server = getReqClient(meta?.requestServer as TRequestClient);

		const { data } = await server.get(meta?.path as string, {
			signal,
			params: { ...(meta?.params ?? {}), ...(pageParam ? { cursor: pageParam } : {}) }
		});

		return data;
	};

	const { children } = $props();
	const queryClient = $state(
		new QueryClient({
			defaultOptions: {
				queries: {
					enabled: browser,
					gcTime,
					staleTime,
					refetchInterval,
					retryOnMount: false,
					refetchOnWindowFocus: false,
					refetchOnReconnect: 'always',
					queryFn,
					retry: (failureCount) => failureCount < 2
				}
			}
		})
	);
</script>

<QueryClientProvider client={queryClient}>
	{@render children()}
</QueryClientProvider>
