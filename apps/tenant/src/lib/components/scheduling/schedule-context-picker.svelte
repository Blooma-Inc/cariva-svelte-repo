<script lang="ts">
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	import { untrack } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { SelectField } from '@cariva/ui/components/form-inputs/select-field/index.js';
	import { DataTableSearch } from '@cariva/ui/components/data-table/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { stores } from '$lib/store/index.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { canAccessBranch } from '$lib/utils/branch-service-access';
	import { useFetchBranchHealthcareServices } from '$lib/hooks/branch-healthcare-services/use-fetch-branch-healthcare-services';
	import { useDebounce } from '$lib/hooks/app/use-debounce.svelte';
	import { parseError } from '$lib/utils/errorHandler';

	let {
		branchUid,
		value = $bindable<string | null>(null),
		disabled = false
	}: { branchUid: string; value?: string | null; disabled?: boolean } = $props();
	const filters = superForm(
		untrack(() => ({ kind: value === null ? 'general' : 'service', offering: value ?? '' })),
		{ SPA: true }
	);
	const { form: data } = filters;
	const canReadServices = $derived(
		canAccessBranch(stores, branchUid, PERMISSIONS.BRANCH_HEALTHCARE_SERVICES_READ)
	);
	let search = $state('');
	const debounced = useDebounce(() => search.trim());
	const params = $state<HealthcareServiceQueryParams>({ limit: 10, offset: 0, is_active: true });
	const query = useFetchBranchHealthcareServices(
		() => branchUid,
		params,
		() => $data.kind === 'service' && canReadServices
	);
	$effect(() => {
		params.q = debounced.value || undefined;
		params.offset = 0;
	});
	$effect(() => {
		value = $data.kind === 'general' ? null : canReadServices ? $data.offering : '';
	});
</script>

<div class="flex flex-col gap-3 rounded-xl border p-3">
	<FormField form={filters} name="kind"
		><SelectField
			type="single"
			label="Schedule applies to"
			placeholder="Select schedule type"
			bind:value={$data.kind}
			{disabled}
			selectables={[
				{ value: 'general', label: 'General working hours', enable: true },
				{ value: 'service', label: 'Specific service', enable: canReadServices }
			]}
		/></FormField
	>
	{#if $data.kind === 'service' && canReadServices}
		<DataTableSearch
			aria-label="Search branch services"
			placeholder="Search branch services"
			{disabled}
			value={search}
			oninput={(event) => {
				search = event.currentTarget.value;
				$data.offering = '';
			}}
		/>
		{#if query.isPending}<Skeleton class="h-12 w-full" />
		{:else if query.isError}<EmptyState
				compact
				kind="error"
				title="Couldn’t load services"
				description={parseError(query.error)}
				onAction={() => {
					void query.refetch();
				}}
				actionDisabled={disabled}
			/>
		{:else}
			<FormField form={filters} name="offering"
				><SelectField
					type="single"
					label="Branch service"
					placeholder="Select a service"
					{disabled}
					bind:value={$data.offering}
					selectables={(query.data?.data ?? []).map((item) => ({
						value: item.uid,
						label: item.name,
						enable: item.is_active && item.catalog_is_active
					}))}
				/></FormField
			>
			{#if !query.data?.data.length}<EmptyState
					compact
					kind={search ? 'no-results' : 'empty'}
					title={search ? 'No matching services' : 'No services available'}
					description="Choose another search or configure services for this branch."
				/>{/if}
			<div class="flex justify-between gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={disabled || query.isFetching || params.offset === 0}
					onclick={() => {
						params.offset = Math.max(0, params.offset - params.limit);
						$data.offering = '';
					}}>Previous</Button
				>
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={disabled ||
						query.isFetching ||
						params.offset + params.limit >= (query.data?.meta.total ?? 0)}
					onclick={() => {
						params.offset += params.limit;
						$data.offering = '';
					}}>Next</Button
				>
			</div>
		{/if}
	{/if}
	<p class="text-sm text-muted-foreground">
		General working hours are required for booking. A service-specific schedule narrows those hours.
		Each schedule is saved separately.
	</p>
</div>
