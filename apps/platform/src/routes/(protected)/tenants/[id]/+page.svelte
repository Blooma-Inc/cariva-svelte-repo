<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { stores } from '$lib/store/index.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import ROUTES from '$lib/configs/routes.svelte';
	import { useFetchTenantDetails } from '$lib/hooks/tenant/use-fetch-tenant-details';
	import { AppModals } from '$lib/store/app/modal-types';
	import { tenantLifecycleActions } from '$lib/utils/tenant-lifecycle';
	import { formatDate } from '$lib/utils/date';
	import { getInitials, toTitleCase } from '$lib/utils/strings';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import { Avatar, AvatarFallback } from '@cariva/ui/components/ui/avatar/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '@cariva/ui/components/ui/tabs/index.js';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import AccessDenied from '$lib/components/access-denied.svelte';
	import { tenantStatusBadge } from '../data/tenant-status-badge';
	import TenantOverview from './components/tenant-overview.svelte';
	import TenantStats from './components/tenant-stats.svelte';
	import TenantAdmin from './components/tenant-admin.svelte';
	import TenantBranches from './components/tenant-branches.svelte';
	import SectionError from './components/section-error.svelte';

	let { data } = $props();
	const { PermissionStore, AppStore } = stores;
	const canRead = $derived(PermissionStore.can(PERMISSIONS.TENANTS_READ));
	const canManage = $derived(canRead && PermissionStore.can(PERMISSIONS.TENANTS_MANAGE));
	const query = useFetchTenantDetails(() => data.tenant_uid);
	const tab = $derived(page.url.searchParams.get('tab') === 'branches' ? 'branches' : 'overview');
	const selectTab = (value: string) => {
		if (!canRead || (value !== 'overview' && value !== 'branches')) return;
		const url = new URL(page.url);
		url.searchParams.set('tab', value);
		void goto(
			resolve(`/(protected)/tenants/[id]?${url.searchParams.toString()}${url.hash}`, {
				id: data.tenant_uid
			}),
			{
				replaceState: true,
				keepFocus: true,
				noScroll: true
			}
		);
	};
	const tenant = $derived(query.data);
	const openAction = (action: TenantLifecycleAction) => {
		if (!canManage || !tenant || !tenantLifecycleActions(tenant.status).includes(action)) return;
		AppStore.toggleModals({
			name: AppModals.TENANT_LIFECYCLE_MODAL,
			open: true,
			tenant_uid: tenant.uid,
			tenant_name: tenant.name,
			status: tenant.status,
			action
		});
	};
</script>

{#if !canRead}
	<AccessDenied resource="tenant details" />
{:else}
	<section class="flex w-full min-w-0 flex-col gap-4">
		<div class="flex flex-col gap-1">
			<Button
				variant="ghost"
				class="w-fit px-0"
				onclick={() => {
					if (canRead) goto(ROUTES.TENANT.resolve());
				}}><ArrowLeftIcon class="size-4" />Tenant Details</Button
			>
		</div>
		<div
			class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
			aria-busy={query.isPending}
		>
			<div class="flex min-w-0 items-center gap-3">
				{#if query.isPending}
					<Skeleton class="size-16 shrink-0 rounded-xl" />
					<div class="flex flex-col gap-2">
						<div class="flex flex-wrap items-center gap-2">
							<Skeleton class="h-6 w-56" /><Skeleton class="h-5 w-16 rounded-xl" />
						</div>
						<Skeleton class="h-4 w-16" /><Skeleton class="h-4 w-44" />
					</div>
				{:else if tenant}
					<Avatar class="size-16 rounded-xl"
						><AvatarFallback class="rounded-xl text-xl">{getInitials(tenant.name)}</AvatarFallback
						></Avatar
					>
					<div class="flex min-w-0 flex-col gap-1">
						<div class="flex flex-wrap items-center gap-2">
							<Heading level="h2">{tenant.name}</Heading><Badge
								variant={tenantStatusBadge.get(tenant.status) as 'default'}
								>{toTitleCase(tenant.status)}</Badge
							>
						</div>
						<Paragraph size="sm" muted>{tenant.code}</Paragraph>
						<Paragraph size="sm" muted>Last updated: {formatDate(tenant.updated_at)}</Paragraph>
					</div>
				{/if}
			</div>
			{#if canManage && tenant}
				<div class="flex flex-wrap gap-2">
					{#each tenantLifecycleActions(tenant.status) as action (action)}
						<Button
							variant={action === 'activate' ? 'default' : 'destructive'}
							onclick={() => openAction(action)}>{toTitleCase(action)} tenant</Button
						>
					{/each}
				</div>
			{/if}
		</div>
		{#key data.tenant_uid}
			<TenantStats
				tenantUid={data.tenant_uid}
				showBranches={() => {
					selectTab('branches');
				}}
			/>
			<Tabs value={tab} onValueChange={selectTab} class="flex min-w-0 flex-col gap-4">
				<TabsList class="w-fit"
					><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="branches"
						>Branches</TabsTrigger
					></TabsList
				>
				<TabsContent value="overview">
					{#if tab === 'overview'}
						<div
							class="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]"
						>
							{#if query.isError}<SectionError
									message="Couldn't load the tenant's details and subscription."
									retry={() => query.refetch()}
								/>{:else}<TenantOverview {tenant} loading={query.isPending} />{/if}
							<TenantAdmin tenantUid={data.tenant_uid} />
						</div>
					{/if}
				</TabsContent>
				<TabsContent value="branches"
					>{#if tab === 'branches'}<TenantBranches tenantUid={data.tenant_uid} />{/if}</TabsContent
				>
			</Tabs>
		{/key}
	</section>
{/if}
