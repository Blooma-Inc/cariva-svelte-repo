<script lang="ts">
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import AppSidebar from '$lib/components/sidebar/app-sidebar.svelte';
	import Header from '$lib/components/sidebar/header.svelte';
	import { Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { SidebarProvider, SidebarInset } from '@cariva/ui/components/ui/sidebar/index.js';
	import { stores } from '$lib/store/index.svelte';
	import ROUTES, { getRoute } from '$lib/configs/routes.svelte.js';
	import { page } from '$app/state';
	import { useFetchMyPermissions } from '$lib/hooks/permissions/use-fetch-my-permissions';
	import AccessDenied from '$lib/components/access-denied.svelte';
	import CarivaLogo from '$lib/assets/favicon.svg';

	let { children, data } = $props();
	let bootstrapping = $state(true);
	const { AuthStore, PermissionStore } = stores;
	const permissionsQuery = useFetchMyPermissions(
		() => AuthStore.user.uid ?? '',
		() => !bootstrapping && !!AuthStore.accessToken && !!AuthStore.user.uid
	);
	const requiredPermission = $derived(getRoute(page.route.id)?.requiredPermission);
	const hasAccess = $derived(
		permissionsQuery.status === 'success' &&
			(!requiredPermission || !!permissionsQuery.data?.includes(requiredPermission))
	);

	$effect(() => {
		PermissionStore.setPermissions(permissionsQuery.data ?? []);
	});

	onMount(async () => {
		if (!AuthStore.accessToken) {
			if (!data.hasValidSession) {
				await goto(ROUTES.LOGIN.resolve());
				return;
			}
			try {
				await AuthStore.bootstrap();
			} catch {
				goto(ROUTES.LOGIN.resolve());
				return;
			}
		}
		bootstrapping = false;
	});
</script>

{#if bootstrapping || permissionsQuery.status === 'pending'}
	<div class="flex h-screen flex-col items-center justify-center">
		<img src={CarivaLogo} alt="cariva logo" class="h-14 w-14" />
		<Paragraph size="sm" muted>Loading workspace...</Paragraph>
	</div>
{:else if permissionsQuery.status === 'error'}
	<div class="flex min-h-screen items-center justify-center p-6">
		<EmptyState
			kind="error"
			title="Couldn’t load workspace permissions"
			description="We couldn’t retrieve your access permissions. Please try again."
			onAction={() => {
				void permissionsQuery.refetch();
			}}
		/>
	</div>
{:else}
	<SidebarProvider>
		<AppSidebar />
		<SidebarInset>
			<Header />
			<div class="flex min-w-0 flex-1 flex-col gap-4 bg-primary/5 p-4 py-3">
				{#if hasAccess}
					{@render children()}
				{:else}
					<AccessDenied />
				{/if}
			</div>
		</SidebarInset>
	</SidebarProvider>
{/if}
