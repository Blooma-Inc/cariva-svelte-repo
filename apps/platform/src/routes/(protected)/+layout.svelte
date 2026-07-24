<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import AppSidebar from '$lib/components/sidebar/app-sidebar.svelte';
	import Header from '$lib/components/sidebar/header.svelte';
	import { Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { SidebarProvider, SidebarInset } from '@cariva/ui/components/ui/sidebar/index.js';
	import { stores } from '$lib/store/index.svelte';
	import ROUTES from '$lib/configs/routes.svelte.js';
	import CarivaLogo from '$lib/assets/favicon.svg';

	let { children, data } = $props();
	let bootstrapping = $state(true);

	onMount(async () => {
		if (!stores.AuthStore.accessToken && data.hasValidSession) {
			try {
				await stores.AuthStore.bootstrap();
			} catch {
				goto(resolve(ROUTES.LOGIN.path));
				return;
			}
		}
		bootstrapping = false;
	});
</script>

{#if bootstrapping}
	<div class="flex h-screen flex-col items-center justify-center">
		<img src={CarivaLogo} alt="cariva logo" class="h-14 w-14" />
		<Paragraph size="sm" muted>Loading workspace...</Paragraph>
	</div>
{:else}
	<SidebarProvider>
		<AppSidebar />
		<SidebarInset>
			<Header />
			<div class="flex min-w-0 flex-1 flex-col gap-4 bg-primary/5 p-4 py-3">
				{@render children()}
			</div>
		</SidebarInset>
	</SidebarProvider>
{/if}
