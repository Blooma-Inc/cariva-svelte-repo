<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Tabs, TabsList, TabsContent, TabsTrigger } from '@cariva/ui/components/ui/tabs/index.js';
	import Overview from './components/overview.svelte';
	import Staff from './components/staff.svelte';
	import WardsAndBeds from '$lib/components/facility/wards-and-beds.svelte';
	import Settings from './components/settings.svelte';
	import { useFetchBranchByUid } from '$lib/hooks/branch/use-fetch-branch-by-uid.js';
	import { useScrollActiveTab } from '$lib/hooks/app/use-scroll-into-view.svelte.js';
	import { useFetchTenant } from '$lib/hooks/tenant/use-fetch-Tenant.js';

	let { data } = $props();
	const branch_uid = () => data.branch_uid;

	const tabs = [
		{ tab: 'Overview', value: 'overview', Content: Overview },
		{ tab: 'Wards & Beds', value: 'wards_and_beds', Content: WardsAndBeds },
		{ tab: 'Staff', value: 'staff', Content: Staff },
		{ tab: 'Settings', value: 'settings', Content: Settings }
	];
	let tabValue = $state(page.url.searchParams.get('tab') ?? 'overview');
	let refs = $state<Record<string, HTMLElement | null>>(
		Object.fromEntries(tabs.map(({ value }) => [value, null]))
	);
	useScrollActiveTab<string>({
		activeTab: () => tabValue,
		fallback: 'overview',
		refs
	});
	function handleTabChange(value: string) {
		tabValue = value;
		const url = new URL(page.url);
		url.searchParams.set('tab', value);
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(url, { replaceState: true, keepFocus: true, noScroll: true });
	}

	const tenantQuery = useFetchTenant();
	const branchQuery = useFetchBranchByUid(branch_uid());
</script>

<div class="flex w-full flex-col gap-4">
	{#if branchQuery.status === 'pending'}
		<div>Pending...</div>
	{/if}

	{#if branchQuery.status === 'success' && branchQuery.data}
		<div class="flex flex-col">
			<button class="flex w-fit items-center justify-start gap-2" onclick={() => history.back()}>
				<ArrowLeftIcon />
				<Heading level="h3">{branchQuery.data.branch.name}</Heading>
				<Badge>{branchQuery.data.branch.is_active ? 'Active' : 'Inactive'}</Badge>
			</button>
			{#if tenantQuery.status === 'success' && tenantQuery.data}
				<Paragraph>{tenantQuery.data.name}</Paragraph>
			{/if}
		</div>

		<Tabs value={tabValue} onValueChange={handleTabChange} class="flex w-full flex-col space-y-4">
			<TabsList
				class="scrollbar-hide sticky top-20 left-0 z-20 flex w-full items-center justify-start gap-1 overflow-x-auto backdrop-blur lg:w-fit"
			>
				{#each tabs as { tab, value } (value)}
					<TabsTrigger bind:ref={refs[value]} {value}>{tab}</TabsTrigger>
				{/each}
			</TabsList>

			<TabsContent value="overview">
				{#if tabValue === 'overview'}
					<Overview branch={branchQuery.data.branch} admin={branchQuery.data.admin} />
				{/if}
			</TabsContent>
			<TabsContent value="wards_and_beds">
				{#if tabValue === 'wards_and_beds'}
					<WardsAndBeds branchUid={branch_uid()} branchName={branchQuery.data.branch.name} />
				{/if}
			</TabsContent>
			<TabsContent value="staff">
				{#if tabValue === 'staff'}
					<Staff branchUid={branch_uid()} branchName={branchQuery.data.branch.name} />
				{/if}
			</TabsContent>
			<TabsContent value="settings">
				{#if tabValue === 'settings'}
					<Settings />
				{/if}
			</TabsContent>
		</Tabs>
	{/if}

	{#if branchQuery.status === 'error'}
		<div>Error...</div>
	{/if}
</div>
