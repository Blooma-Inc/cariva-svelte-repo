<script lang="ts">
	import { NETWORK_ERR } from '$lib/utils/network';
	import ServerCrashIcon from '@lucide/svelte/icons/server-crash';
	import WifiOffIcon from '@lucide/svelte/icons/wifi-off';
	import { useNetworkStatus } from '$lib/hooks/app/use-network-status.svelte';

	const networkStatus = useNetworkStatus();
	const hidePrompt = $derived(!networkStatus.isReady && networkStatus.isOnline);
</script>

{#if !hidePrompt}
	<div
		data-isServer={networkStatus.lastError === NETWORK_ERR}
		class="data-[isServer=true]:border-error data-[isServer=true]:bg-error w-full border-b bg-warning py-2 text-info-foreground data-[isServer=true]:text-white"
	>
		<div class="max-w-desktop mx-auto flex h-full w-11/12 items-center justify-between">
			<div class="mx-auto flex w-fit items-center justify-center gap-3">
				{#if networkStatus.lastError === NETWORK_ERR}
					<ServerCrashIcon class="size-10 md:size-6" />
				{:else}
					<WifiOffIcon class="size-10 md:size-6" />
				{/if}
				<p class="text-sm font-medium sm:w-[90%] md:w-full">
					{networkStatus.lastError ??
						'You are currently offline. Some features may be unavailable until your connection is restored'}
				</p>
			</div>
		</div>
	</div>
{/if}
