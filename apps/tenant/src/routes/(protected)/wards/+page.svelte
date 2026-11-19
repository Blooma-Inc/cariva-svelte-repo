<script lang="ts">
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { useFetchCurrentUser } from '$lib/hooks/auth/use-fetch-current-user';
	import { stores } from '$lib/store/index.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { ROLES } from '$lib/configs/roles';
	import { parseError } from '$lib/utils/errorHandler';
	import AccessDenied from '$lib/components/access-denied.svelte';
	import EmptyData from '$lib/components/empty-data.svelte';
	import ErrorState from '$lib/components/error-state.svelte';
	import WardsAndBeds from '$lib/components/facility/wards-and-beds.svelte';
	import TenantWardsWorkspace from './components/tenant-wards-workspace.svelte';

	const { PermissionStore } = stores;
	const canRead = $derived(PermissionStore.canAll([PERMISSIONS.WARDS_READ, PERMISSIONS.BEDS_READ]));
	const query = useFetchCurrentUser();
	const isTenantAdmin = $derived(query.data?.user_roles[0]?.role.code === ROLES.TENANT_ADMIN);
	const assignment = $derived(query.data?.branch_assignments.find((item) => !item.revoked_at));
</script>

{#if !canRead}
	<AccessDenied resource="wards and beds" />
{:else if query.status === 'pending'}
	<div role="status" aria-label="Loading branch context"><Skeleton class="h-56 w-full" /></div>
{:else if query.status === 'error'}
	<ErrorState
		title="Failed to load your branch context"
		description={parseError(query.error)}
		onretry={query.refetch}
	/>
{:else if isTenantAdmin}
	<TenantWardsWorkspace />
{:else if assignment}
	<WardsAndBeds branchUid={assignment.branch_uid} branchName={assignment.branch.name} />
{:else}
	<EmptyData
		title="No branch assigned"
		description="Ask your administrator to assign you to a branch before managing wards and beds."
	/>
{/if}
