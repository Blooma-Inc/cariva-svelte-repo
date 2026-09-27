<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AppSidebar from '$lib/components/sidebar/app-sidebar.svelte';
	import Header from '$lib/components/sidebar/header.svelte';
	import { Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { SidebarProvider, SidebarInset } from '@cariva/ui/components/ui/sidebar/index.js';
	import { stores } from '$lib/store/index.svelte';
	import ROUTES, { getRoute } from '$lib/configs/routes.svelte.js';
	import CarivaLogo from '$lib/assets/favicon.svg';
	import { useFetchMyPermissions } from '$lib/hooks/permissions/use-fetch-my-permissions.js';
	import AccessDenied from '$lib/components/access-denied.svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { useFetchCurrentUser } from '$lib/hooks/auth/use-fetch-current-user.js';

	let { children, data } = $props();
	const { PermissionStore, AuthStore } = stores;
	let bootstrapping = $state(true);

	onMount(async () => {
		if (!AuthStore.accessToken && data.hasValidSession) {
			try {
				await AuthStore.bootstrap();
			} catch {
				goto(ROUTES.LOGIN.resolve());
				return;
			}
		}
		bootstrapping = false;
	});

	const permissionsQuery = useFetchMyPermissions();
	const currentUserQuery = useFetchCurrentUser();

	function checkAccess(routeId: string | null) {
		if (!routeId) return true;
		const currentRoute = getRoute(routeId);
		if (!currentRoute?.requiredPermission) return true;
		return PermissionStore.can(currentRoute.requiredPermission);
	}

	let hasAccess = $derived.by(() => {
		if (permissionsQuery.status === 'success' && permissionsQuery.data) {
			PermissionStore.permissions = new SvelteSet(permissionsQuery.data);
			return checkAccess(page.route.id);
		}
		return true;
	});

	$effect(() => {
		if (permissionsQuery.status === 'success' && permissionsQuery.data !== undefined) {
			PermissionStore.permissions = new SvelteSet(permissionsQuery.data);
		}
	});

	$effect(() => {
		if (currentUserQuery.status === 'success' && currentUserQuery.data !== undefined) {
			AuthStore.user = {
				...currentUserQuery.data
			};
		}
	});
</script>

{#if bootstrapping}
	<div class="flex h-screen flex-col items-center justify-center">
		<img src={CarivaLogo} alt="cariva logo" class="h-14 w-14" />
		<Paragraph size="sm" muted>Authenticating user...</Paragraph>
	</div>
{:else if permissionsQuery.status === 'pending'}
	<div class="flex h-screen flex-col items-center justify-center">
		<img src={CarivaLogo} alt="cariva logo" class="h-14 w-14" />
		<Paragraph size="sm" muted>Loading workspace...</Paragraph>
	</div>
{:else if permissionsQuery.status === 'error'}
	<div class="flex h-screen flex-col items-center justify-center">
		<Paragraph size="sm" muted>Couldn't load your permissions. Try refreshing.</Paragraph>
	</div>
{:else if permissionsQuery.status === 'success' && permissionsQuery.data}
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
