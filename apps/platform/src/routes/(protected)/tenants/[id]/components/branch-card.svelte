<script lang="ts">
	import {
		Card,
		CardHeader,
		CardTitle,
		CardContent,
		CardFooter
	} from '@cariva/ui/components/ui/card/index.js';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import UsersIcon from '@lucide/svelte/icons/users';
	import { formatDate } from '$lib/utils/date';
	import { stores } from '$lib/store/index.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import DetailField from './detail-field.svelte';

	let { branch, loading = false }: { branch?: PlatformTenantBranchItem; loading?: boolean } =
		$props();
	let expanded = $state(false);
	const canRead = $derived(stores.PermissionStore.can(PERMISSIONS.TENANTS_READ));
	const location = $derived(branch ? [branch.city, branch.state].filter(Boolean).join(', ') : '');
</script>

<Card class="min-w-0 border bg-background/50" aria-busy={loading}>
	<CardHeader>
		<CardTitle
			>{#if loading}<Skeleton class="h-5 w-3/4" />{:else}{branch?.name}{/if}</CardTitle
		>
	</CardHeader>
	<CardContent class="flex flex-col gap-4">
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
			<div class="flex min-w-0 flex-col gap-2">
				<div class="flex flex-wrap items-center gap-1">
					<Paragraph size="sm">Status:</Paragraph>
					{#if loading}<Skeleton class="h-5 w-16 rounded-xl" />{:else}<Badge
							variant={branch?.is_active === true ? 'default' : 'secondary'}
							>{branch?.is_active === null
								? 'Not specified'
								: branch?.is_active
									? 'Active'
									: 'Inactive'}</Badge
						>{/if}
				</div>
				<div class="flex flex-wrap items-center gap-1">
					<Paragraph size="sm">Timezone:</Paragraph>
					{#if loading}<Skeleton class="h-4 w-24" />{:else}<Paragraph
							size="sm"
							class="font-semibold break-words">{branch?.timezone ?? 'Not specified'}</Paragraph
						>{/if}
				</div>
			</div>
			<div class="flex min-w-0 flex-col gap-2">
				<div class="flex flex-wrap items-center gap-1">
					<Paragraph size="sm">Type:</Paragraph>
					{#if loading}<Skeleton class="h-4 w-16" />{:else}<Paragraph
							size="sm"
							class="font-semibold">{branch?.is_main ? 'Main' : 'Additional'}</Paragraph
						>{/if}
				</div>
				<div class="flex flex-wrap items-center gap-1">
					<Paragraph size="sm">Location:</Paragraph>
					{#if loading}<Skeleton class="h-4 w-32" />{:else}<Paragraph
							size="sm"
							class="font-semibold break-words">{location || 'Not specified'}</Paragraph
						>{/if}
				</div>
			</div>
		</div>
		<div class="flex flex-wrap gap-2">
			{#if loading}
				<Skeleton class="h-7 w-48 rounded-md" /><Skeleton class="h-7 w-20 rounded-md" />
			{:else if branch}
				<Badge variant="secondary" class="gap-1 rounded-md py-1"
					><ClockIcon class="size-3" />Last updated: {formatDate(branch.updated_at)}</Badge
				>
				<Badge variant="secondary" class="gap-1 rounded-md py-1"
					><UsersIcon class="size-3" />{branch.user_count}
					{branch.user_count === 1 ? 'user' : 'users'}</Badge
				>
			{/if}
		</div>
	</CardContent>
	<CardFooter class="mx-4 border-t px-0 pt-3">
		{#if loading}<Skeleton class="h-9 w-28 rounded-xl" />{:else if branch && canRead}
			<Button
				variant="secondary"
				aria-expanded={expanded}
				aria-controls={`branch-details-${branch.uid}`}
				onclick={() => {
					if (canRead) expanded = !expanded;
				}}>{expanded ? 'Hide details' : 'View details'}</Button
			>
		{/if}
	</CardFooter>
	{#if expanded && branch && canRead}
		<CardContent
			id={`branch-details-${branch.uid}`}
			class="grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2"
		>
			<DetailField label="Address" value={branch.address} />
			<DetailField label="Country" value={branch.country} />
			<DetailField
				label="Branch administrator"
				value={branch.admin
					? [
							branch.admin.designation,
							branch.admin.first_name,
							branch.admin.middle_name,
							branch.admin.last_name
						]
							.filter(Boolean)
							.join(' ')
					: 'Not assigned'}
			/>
			<DetailField label="Administrator email" value={branch.admin?.email} />
		</CardContent>
	{/if}
</Card>
