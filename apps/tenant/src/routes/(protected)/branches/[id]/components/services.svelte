<script lang="ts">
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	import Stethoscope from '@lucide/svelte/icons/stethoscope';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { DataTable, DataTableSearch } from '@cariva/ui/components/data-table/index.js';
	import { FilterChip } from '@cariva/ui/components/filter-chip/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import * as Table from '@cariva/ui/components/ui/table/index.js';
	import { stores } from '$lib/store/index.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { AppModals } from '$lib/store/app/modal-types';
	import { canAccessBranchServices } from '$lib/utils/branch-service-access';
	import { useFetchBranchHealthcareServices } from '$lib/hooks/branch-healthcare-services/use-fetch-branch-healthcare-services';
	import { useOffsetPagination } from '$lib/hooks/app/use-offset-pagination.svelte';
	import { useDebounce } from '$lib/hooks/app/use-debounce.svelte';
	import { parseError } from '$lib/utils/errorHandler';
	import { createBranchServiceColumns } from '../data/branch-service-columns';
	import AccessDenied from '$lib/components/access-denied.svelte';

	let { branch }: { branch: BranchDetailedItem } = $props();
	const { AppStore, PermissionStore } = stores;
	const canRead = $derived(canAccessBranchServices(stores, branch.uid));
	const canCreate = $derived(
		canRead &&
			canAccessBranchServices(stores, branch.uid, PERMISSIONS.BRANCH_HEALTHCARE_SERVICES_CREATE) &&
			PermissionStore.can(PERMISSIONS.HEALTHCARE_SERVICES_READ)
	);
	let search = $state('');
	let status = $state('all');
	const debounced = useDebounce(() => search.trim());
	const params = $state<HealthcareServiceQueryParams>({ limit: 10, offset: 0 });
	$effect(() => {
		if (branch.uid) {
			params.q = debounced.value || undefined;
			params.is_active = status === 'all' ? undefined : status === 'active';
			params.offset = 0;
		}
	});
	const query = useFetchBranchHealthcareServices(() => branch.uid, params);
	const pagination = useOffsetPagination(query, params);
	const columns = createBranchServiceColumns(serviceName, open);
	function open(mode: 'view' | 'form' | 'status', serviceUid = '') {
		if (
			!canRead ||
			(mode !== 'view' &&
				!(serviceUid
					? canAccessBranchServices(
							stores,
							branch.uid,
							PERMISSIONS.BRANCH_HEALTHCARE_SERVICES_UPDATE
						)
					: canCreate && branch.is_active))
		)
			return;
		AppStore.toggleModals({
			name: AppModals.BRANCH_HEALTHCARE_SERVICE_MODAL,
			open: true,
			mode,
			branch_uid: branch.uid,
			branch_name: branch.name,
			timezone: branch.timezone ?? '',
			branch_is_active: branch.is_active,
			service_uid: serviceUid
		});
	}
	$effect(() => {
		const total = query.data?.meta.total;
		if (query.isSuccess && total !== undefined && params.offset > 0 && params.offset >= total)
			params.offset = Math.max(0, Math.ceil(total / params.limit) - 1) * params.limit;
	});
</script>

{#snippet serviceName(service: BranchHealthcareServiceItem)}
	<div class="flex flex-col gap-1">
		<Button
			variant="link"
			class="h-auto w-fit p-0"
			onclick={() => open('view', service.healthcare_service_uid)}>{service.name}</Button
		>
		{#if !service.catalog_is_active}<span class="text-xs text-muted-foreground"
				>Catalogue inactive</span
			>{/if}
		{#if !service.branch_is_active}<span class="text-xs text-muted-foreground">Branch inactive</span
			>{/if}
	</div>
{/snippet}

<section class="flex min-w-0 flex-col gap-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<Heading level="h3">Services</Heading><Paragraph muted
				>Manage services offered at {branch.name}.</Paragraph
			>
		</div>
		{#if canCreate}<Button disabled={!branch.is_active} onclick={() => open('form')}
				>Assign service</Button
			>{/if}
	</div>
	{#if !canRead}<AccessDenied resource="services for this branch" />
	{:else}
		{#if !branch.is_active}<Paragraph muted
				>This branch is inactive. New assignments and activation are unavailable.</Paragraph
			>{/if}
		<div class="flex flex-wrap items-center gap-2">
			<DataTableSearch
				aria-label="Search branch services"
				placeholder="Search services"
				bind:value={search}
			/>
			<FilterChip
				label="Status"
				value={status === 'all' ? null : status}
				onValueChange={(value) => (status = typeof value === 'string' ? value : 'all')}
				options={[
					{ value: 'active', label: 'Active' },
					{ value: 'inactive', label: 'Inactive' }
				]}
			/>
		</div>
		<DataTable
			limit={params.limit}
			status={query.status}
			{columns}
			data={query.data?.data ?? []}
			getRowId={(service) => service.uid}
			showPagination={query.isSuccess}
			paginationProps={{
				meta: pagination.paginationMeta,
				isLoading: query.isFetching,
				onPageChange: pagination.handlePageChange,
				onPerPageChange: pagination.handlePerPageChange
			}}
			errorDataProps={{
				title: 'Failed to load branch services',
				errorDescription: query.error ? parseError(query.error) : '',
				onRetry: () => query.refetch()
			}}
		>
			{#snippet loadingDataNode()}
				<Table.Body
					>{#each Array.from({ length: params.limit }, (_, index) => index) as index (index)}<Table.Row
							><Table.Cell><Skeleton class="h-4 w-40" /></Table.Cell><Table.Cell
								><Skeleton class="h-6 w-16 rounded-full" /></Table.Cell
							><Table.Cell><Skeleton class="h-4 w-32" /></Table.Cell><Table.Cell
								><Skeleton class="h-4 w-28" /></Table.Cell
							><Table.Cell><Skeleton class="size-9 rounded-xl" /></Table.Cell></Table.Row
						>{/each}</Table.Body
				>
			{/snippet}
			{#snippet emptyDataNode()}
				<EmptyState
					kind={params.q || status !== 'all' ? 'no-results' : 'empty'}
					title={params.q || status !== 'all' ? 'No matching services' : 'No services configured'}
					description={params.q || status !== 'all'
						? 'Try another search or clear your filters.'
						: 'Assign a service from the tenant catalogue to get started.'}
					icon={params.q || status !== 'all' ? undefined : Stethoscope}
					actionLabel={params.q || status !== 'all' ? 'Clear filters' : 'Assign service'}
					onAction={params.q || status !== 'all'
						? () => {
								search = '';
								status = 'all';
							}
						: canCreate && branch.is_active
							? () => open('form')
							: undefined}
				/>
			{/snippet}
		</DataTable>
	{/if}
</section>
