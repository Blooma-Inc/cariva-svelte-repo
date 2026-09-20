<script lang="ts" module>
	interface PermissionsOverrideProps {
		userUid: string;
	}
</script>

<script lang="ts">
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { useFetchUserPermissionsOverride } from '$lib/hooks/permissions/use-fetch-user-overrides';
	import { useFetchStaff } from '$lib/hooks/staff/use-fetch-staff';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import PermissionMatrix from './permission-matrix/index.svelte';
	import { useFetchRolePermissions } from '$lib/hooks/roles/use-fetch-role-permissions';
	import ErrorState from '../error-state.svelte';
	import OverridePermission from './permission-matrix/override-permission.svelte';

	let { userUid }: PermissionsOverrideProps = $props();
	const userPermOverrideQuery = useFetchUserPermissionsOverride(() => userUid);
	const staffQuery = useFetchStaff(() => userUid);

	const rolePermissionsQuery = useFetchRolePermissions(
		() => staffQuery?.data?.user_roles[0].role_uid ?? ''
	);

	const showMatrix = $derived.by(() => {
		if (
			userPermOverrideQuery.status === 'success' &&
			userPermOverrideQuery.data &&
			staffQuery.status === 'success' &&
			staffQuery.data &&
			rolePermissionsQuery.status === 'success' &&
			rolePermissionsQuery.data
		) {
			return true;
		}
		return false;
	});
</script>

<section class="flex flex-col gap-4">
	{#if staffQuery.status === 'success' && staffQuery.data}
		<div>
			<Heading level="h3">{staffQuery.data.first_name} {staffQuery.data.last_name}</Heading>

			<div class="flex items-center justify-start gap-2">
				<Paragraph size="sm" muted>
					{staffQuery.data.branch_assignments[0].branch.name}
				</Paragraph>
				<Badge>{staffQuery.data.user_roles[0].role.name}</Badge>
			</div>
		</div>

		<div>
			{#if rolePermissionsQuery.status === 'pending'}
				loading...
			{/if}
			{#if rolePermissionsQuery.status === 'success' && rolePermissionsQuery.data}
				<div class="flex flex-col gap-2">
					<div class="flex items-center justify-between border-b pb-1">
						<Paragraph>Role defaults</Paragraph>
						<Paragraph size="sm" muted
							>Applies to every {staffQuery.data.user_roles[0].role.name}</Paragraph
						>
					</div>

					<div class="flex flex-wrap gap-1">
						{#each rolePermissionsQuery.data as permission (permission.code)}
							<Badge variant="secondary">{permission.code}</Badge>
						{/each}
					</div>
				</div>
			{/if}

			{#if rolePermissionsQuery.status === 'error'}
				<ErrorState
					title="Error"
					description="Unable to get all permissions for this role"
					onretry={rolePermissionsQuery.refetch}
				/>
			{/if}
		</div>
	{/if}

	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between border-b pb-1">
			<Paragraph>Active overrides</Paragraph>
			<Paragraph size="sm" muted>Across all scopes</Paragraph>
		</div>

		{#if userPermOverrideQuery.status === 'success' && userPermOverrideQuery.data}
			{#if userPermOverrideQuery.data.length}
				<div class="flex flex-wrap gap-1">
					{#each userPermOverrideQuery.data as override (override.uid)}
						<OverridePermission {override} />
					{/each}
				</div>
			{:else}
				<Paragraph size="sm" muted
					>No active overrides anywhere. This user runs on role defaults only.</Paragraph
				>
			{/if}
		{/if}
	</div>

	{#if showMatrix}
		<PermissionMatrix
			userUid={staffQuery?.data?.uid ?? ''}
			defaultPermissions={rolePermissionsQuery.data ?? []}
			overrides={userPermOverrideQuery?.data ?? []}
		/>
	{/if}
</section>
