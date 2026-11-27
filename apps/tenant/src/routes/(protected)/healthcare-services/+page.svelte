<script lang="ts">
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	import Stethoscope from '@lucide/svelte/icons/stethoscope';
	import { superForm } from 'sveltekit-superforms';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { FilterChip } from '@cariva/ui/components/filter-chip/index.js';
	import { DataTable, DataTableSearch } from '@cariva/ui/components/data-table/index.js';
	import { stores } from '$lib/store/index.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { AppModals } from '$lib/store/app/modal-types';
	import { useFetchHealthcareServices } from '$lib/hooks/healthcare-services/use-fetch-healthcare-services';
	import { useDebounce } from '$lib/hooks/app/use-debounce.svelte';
	import { parseError } from '$lib/utils/errorHandler';
	import { createServiceColumns } from './data/service-columns';
	import { useOffsetPagination } from '$lib/hooks/app/use-offset-pagination.svelte';

	const { PermissionStore, AppStore } = stores;
	const canRead = $derived(PermissionStore.can(PERMISSIONS.HEALTHCARE_SERVICES_READ));
	const canCreate = $derived(PermissionStore.can(PERMISSIONS.HEALTHCARE_SERVICES_CREATE));
	const canUpdate = $derived(PermissionStore.can(PERMISSIONS.HEALTHCARE_SERVICES_UPDATE));
	const filters = superForm({ search: '', status: 'all' }, { SPA: true });
	const { form: filterData } = filters;
	const status = $derived($filterData.status);
	const debounced = useDebounce(() => $filterData.search.trim());
	const params = $state<HealthcareServiceQueryParams>({ limit: 10, offset: 0 });
	$effect(() => {
		params.q = debounced.value || undefined;
		params.is_active = status === 'all' ? undefined : status === 'active';
		params.offset = 0;
	});
	const query = useFetchHealthcareServices(params);
	const { paginationMeta, handlePageChange, handlePerPageChange } = useOffsetPagination(
		query,
		params
	);
	function open(mode: 'view' | 'form' | 'status', uid = '') {
		if (
			!canRead ||
			(mode === 'form' && !(uid ? canUpdate : canCreate)) ||
			(mode === 'status' && !canUpdate)
		)
			return;
		AppStore.toggleModals({
			name: AppModals.HEALTHCARE_SERVICE_MODAL,
			open: true,
			mode,
			service_uid: uid
		});
	}
	const columns = createServiceColumns(open);
	$effect(() => {
		const total = query.data?.meta?.total;
		if (query.isSuccess && total !== undefined && params.offset > 0 && params.offset >= total)
			params.offset = Math.max(0, Math.ceil(total / params.limit) - 1) * params.limit;
	});
</script>

{#snippet EmptyService()}
	<EmptyState
		kind={params.q || status !== 'all' ? 'no-results' : 'empty'}
		title={params.q || status !== 'all' ? 'No matching services' : 'No healthcare services yet'}
		description={params.q || status !== 'all'
			? 'Try another search or clear your filters.'
			: 'Add your first service to start building your catalog.'}
		icon={params.q || status !== 'all' ? undefined : Stethoscope}
		actionLabel={params.q || status !== 'all' ? 'Clear filters' : 'Add service'}
		onAction={params.q || status !== 'all'
			? () => {
					$filterData.search = '';
					$filterData.status = 'all';
				}
			: canCreate
				? () => open('form')
				: undefined}
	/>
{/snippet}

<div class="flex min-w-0 flex-col gap-6">
	<div class="flex items-center justify-between gap-4">
		<div>
			<Heading level="h3">Healthcare Services</Heading><Paragraph muted
				>Manage the services available across your tenant.</Paragraph
			>
		</div>
		{#if canRead && canCreate}<Button onclick={() => open('form')}>Add service</Button>{/if}
	</div>
	{#if !canRead}
		<Paragraph>You do not have permission to view healthcare services.</Paragraph>
	{:else}
		<div class="flex flex-wrap items-center gap-2">
			<FormField form={filters} name="search"
				><DataTableSearch
					aria-label="Search services"
					placeholder="Search services"
					type="search"
					bind:value={$filterData.search}
				/></FormField
			>
			<FilterChip
				label="Status"
				value={status === 'all' ? null : status}
				onValueChange={(value) => {
					$filterData.status = typeof value === 'string' ? value : 'all';
				}}
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
				meta: paginationMeta,
				isLoading: query.isLoading,
				onPageChange: handlePageChange,
				onPerPageChange: handlePerPageChange
			}}
			errorDataProps={{
				title: 'Failed to load healthcare services',
				errorDescription: query.error ? parseError(query.error) : '',
				onRetry: () => query.refetch()
			}}
			emptyDataNode={EmptyService}
		/>
	{/if}
</div>
