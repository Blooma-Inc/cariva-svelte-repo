<script lang="ts">
	import { goto } from '$app/navigation';
	import { useFetchTenant } from '$lib/hooks/tenant/use-fetch-Tenant';
	import { useFetchTenantStats } from '$lib/hooks/tenant/use-fetch-tenant-stats';
	import { Paragraph, Heading } from '@cariva/ui/components/ui/typography/index.js';
	import type { IStatsCardProps } from './components/tenant-stats-card.svelte';
	import Building2Icon from '@lucide/svelte/icons/building-2';
	import UserPlusIcon from '@lucide/svelte/icons/user-plus';
	import UsersIcon from '@lucide/svelte/icons/users';
	import TenantStatsCard from './components/tenant-stats-card.svelte';
	import { stores } from '$lib/store/index.svelte';
	import TenantStatsCardSkeleton from './components/tenant-stats-card-skeleton.svelte';
	import { useFetchTenantBranches } from '$lib/hooks/tenant/use-fetch-branches';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import TenantBranchCard from './components/tenant-branch-card.svelte';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ROUTES from '$lib/configs/routes.svelte';
	import { AppModals } from '$lib/store/app/modal-types';

	const stats: Array<IStatsCardProps> = [
		{
			icon: Building2Icon,
			title: 'Branches',
			description: 'Active branches.',
			stat: 34,
			tag: 'branches_count'
		},
		{
			icon: UsersIcon,
			title: 'Staff',
			description: 'Active staff',
			stat: 2893,
			tag: 'staff_count'
		},
		{
			icon: UserPlusIcon,
			title: 'Patients',
			description: 'Active patients',
			stat: 12998,
			tag: 'patients_count'
		}
	];

	let { AuthStore, AppStore } = stores;

	const params = $state({
		limit: 10,
		offset: 0
	});

	const tenantQuery = useFetchTenant();
	const tenantStatsQuery = useFetchTenantStats();
	const tenantBranchesQuery = useFetchTenantBranches(params);
</script>

<section class="flex w-full flex-col gap-4">
	<div class="grid flex-1 text-start text-sm leading-tight">
		<Heading level="h3" class="truncate"
			>Hello, {AuthStore.user?.designation} {AuthStore.user.last_name}</Heading
		>
		{#if tenantQuery.status === 'success'}
			<Paragraph class="truncate text-neutral-600"
				>Here is what is happening at {tenantQuery.data?.name}.</Paragraph
			>
		{/if}
	</div>

	<div class="auto-grid">
		{#if tenantStatsQuery.status === 'pending'}
			{#each stats as stat (stat.title)}
				<TenantStatsCardSkeleton />
			{/each}
		{/if}

		{#if tenantStatsQuery.status === 'success' && tenantStatsQuery.data}
			{#each stats as stat (stat.title)}
				<TenantStatsCard {...stat} stat={tenantStatsQuery.data[stat.tag]} />
			{/each}
		{/if}
	</div>

	<div class="flex w-full flex-col gap-2">
		<div class="flex items-center justify-between">
			<Heading level="h3">Your branches</Heading>
			<Button size="xs" variant="outline" onclick={() => goto(ROUTES.BRANCHES.resolve())}
				>View all <ArrowRightIcon /></Button
			>
		</div>

		<div class="auto-grid [--auto-grid-min:300px]">
			{#if tenantBranchesQuery.status === 'pending'}
				<div>Loading...</div>
			{/if}

			{#if tenantBranchesQuery.status === 'success' && tenantBranchesQuery.data}
				{#if tenantBranchesQuery.data.data.length}
					{#each tenantBranchesQuery.data.data as branch (branch.uid)}
						<TenantBranchCard {...branch} />
					{/each}
				{:else}
					<div>This tenant has no branch.</div>
				{/if}
			{/if}
		</div>
	</div>

	<div class="flex w-full flex-col gap-2">
		<div class="flex items-center justify-between">
			<Heading level="h3">Quick Actions</Heading>
		</div>

		<div class="flex flex-wrap items-center justify-start gap-2">
			<Button
				onclick={() => {
					AppStore.toggleModals({ open: true, name: AppModals.BRANCH_FORM_MODAL, branch_uid: '' });
				}}
			>
				<PlusIcon class="size-3" /> Add New Branch
			</Button>
			<Button
				variant="info"
				onclick={() => {
					AppStore.toggleModals({ open: true, name: AppModals.STAFF_FORM_MODAL, user_uid: '' });
				}}
			>
				<PlusIcon class="size-3" /> Add New Staff
			</Button>
			<Button variant="outline" onclick={() => {}}>View Patients</Button>
			<Button variant="outline" onclick={() => {}}>View Audit Logs</Button>
		</div>
	</div>
</section>
