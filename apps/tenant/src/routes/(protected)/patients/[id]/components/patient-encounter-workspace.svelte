<script lang="ts">
	import {
		Select,
		SelectTrigger,
		SelectContent,
		SelectItem
	} from '@cariva/ui/components/ui/select/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { useFetchCurrentUser } from '$lib/hooks/auth/use-fetch-current-user';
	import { useFetchTenantBranchPages } from '$lib/hooks/tenant/use-fetch-tenant-branch-pages';
	import { stores } from '$lib/store/index.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { parseError } from '$lib/utils/errorHandler';
	import AccessDenied from '$lib/components/access-denied.svelte';
	import EmptyData from '$lib/components/empty-data.svelte';
	import ErrorState from '$lib/components/error-state.svelte';
	import PatientEncounters from './patient-encounters.svelte';
	import CreateEncounter from './create-encounter.svelte';

	let { patientUid }: { patientUid: string } = $props();
	const { PermissionStore } = stores;
	const canRead = $derived(PermissionStore.can(PERMISSIONS.ENCOUNTERS_READ));
	const canCreate = $derived(PermissionStore.can(PERMISSIONS.ENCOUNTERS_CREATE));
	const context = useFetchCurrentUser();
	const assignment = $derived(context.data?.branch_assignments.find((item) => !item.revoked_at));
	const branchesQuery = useFetchTenantBranchPages(
		() =>
			(canRead || canCreate) &&
			context.status === 'success' &&
			!assignment &&
			PermissionStore.can(PERMISSIONS.BRANCHES_READ)
	);
	let selectedUid = $state('');
	const branches = $derived(branchesQuery.data?.pages.flatMap((result) => result.data) ?? []);
	const branch = $derived(
		assignment?.branch ?? branches.find((item) => item.uid === selectedUid) ?? branches[0]
	);
</script>

{#if !canRead && !canCreate}
	<AccessDenied resource="encounters" />
{:else if context.status === 'pending'}
	<div role="status" aria-label="Loading branch context"><Skeleton class="h-40 w-full" /></div>
{:else if context.status === 'error'}
	<ErrorState
		title="Failed to load branch context"
		description={parseError(context.error)}
		onretry={context.refetch}
	/>
{:else}
	<div class="flex min-w-0 flex-col gap-4">
		{#if !assignment && PermissionStore.can(PERMISSIONS.BRANCHES_READ)}
			{#if branchesQuery.status === 'pending'}
				<div role="status" aria-label="Loading branches">
					<Skeleton class="h-11 w-full max-w-sm" />
				</div>
			{:else if branchesQuery.status === 'error'}
				<ErrorState
					title="Failed to load branches"
					description={parseError(branchesQuery.error)}
					onretry={branchesQuery.refetch}
				/>
			{/if}
			{#if branch}
				<div class="flex flex-wrap items-end gap-3">
					<div class="flex w-full max-w-sm flex-col gap-2">
						<label for="encounter-branch" class="text-sm font-medium">Branch</label>
						<Select
							type="single"
							value={branch.uid}
							onValueChange={(value) => (selectedUid = value)}
						>
							<SelectTrigger id="encounter-branch" aria-label="Branch" floatingLabel={false}
								>{branch.name}</SelectTrigger
							>
							<SelectContent>
								{#each branches as item (item.uid)}<SelectItem value={item.uid} label={item.name}
										>{item.name}</SelectItem
									>{/each}
							</SelectContent>
						</Select>
					</div>
					{#if branchesQuery.hasNextPage}<Button
							variant="outline"
							disabled={branchesQuery.isFetching}
							onclick={() => branchesQuery.fetchNextPage()}>Load more branches</Button
						>{/if}
				</div>
			{:else if branchesQuery.status === 'success'}
				<EmptyData
					title="No branches yet"
					description="Encounters will appear once a branch is available."
				/>
			{/if}
		{/if}
		{#if branch}
			{#key `${patientUid}:${branch.uid}`}
				{#if canCreate}<div class="flex justify-end">
						<CreateEncounter {patientUid} branchUid={branch.uid} branchName={branch.name} />
					</div>{/if}
				{#if canRead}<PatientEncounters
						{patientUid}
						branchUid={branch.uid}
						branchName={branch.name}
					/>
				{:else}<AccessDenied resource="encounter history" />{/if}
			{/key}
		{:else if !PermissionStore.can(PERMISSIONS.BRANCHES_READ)}
			<EmptyData
				title="No branch assigned"
				description="Ask your administrator to assign you to a branch to view encounters."
			/>
		{/if}
	</div>
{/if}
