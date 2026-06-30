<script lang="ts">
	import AppSidebar from '$lib/components/sidebar/app-sidebar.svelte';
	import Header from '$lib/components/sidebar/header.svelte';
	import { SidebarProvider, SidebarInset } from '@cariva/ui/components/ui/sidebar/index.js';
	let { children } = $props();
</script>

<SidebarProvider>
	<AppSidebar />
	<SidebarInset>
		<Header />
		<div class="flex flex-1 flex-col gap-4 bg-primary/5 p-4 py-3">
			{@render children()}
		</div>
	</SidebarInset>
</SidebarProvider>
