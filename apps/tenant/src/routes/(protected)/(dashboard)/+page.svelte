<script lang="ts">
	import type { Component } from 'svelte';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import FallbackDashboard from './components/fallback-dashboard.svelte';
	import TenantAdminDashboard from './tenant-admin/index.svelte';
	import BranchAdminDashboard from './branch-admin/index.svelte';
	import ReceptionistDashboard from './receptionist/index.svelte';
	import { useFetchCurrentUser } from '$lib/hooks/auth/use-fetch-current-user';
	import { ROLES, type Role } from '$lib/configs/roles';
	import { parseError } from '$lib/utils/errorHandler';
	import ErrorState from '$lib/components/error-state.svelte';

	const query = useFetchCurrentUser();
	const dashboardMap: Partial<Record<Role, Component>> = {
		[ROLES.TENANT_ADMIN]: TenantAdminDashboard,
		[ROLES.BRANCH_ADMIN]: BranchAdminDashboard,
		[ROLES.RECEPTIONIST]: ReceptionistDashboard
	};
	const role = $derived(query.data?.user_roles[0]?.role.code as Role | undefined);
	const ActiveDashboard = $derived((role && dashboardMap[role]) || FallbackDashboard);
</script>

{#if query.status === 'pending'}
	<div role="status" aria-label="Loading dashboard"><Skeleton class="h-56 w-full" /></div>
{:else if query.status === 'error'}
	<ErrorState
		title="Failed to load your dashboard"
		description={parseError(query.error)}
		onretry={query.refetch}
	/>
{:else}
	<ActiveDashboard />
{/if}
