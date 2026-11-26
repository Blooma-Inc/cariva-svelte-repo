<script lang="ts">
	import { untrack } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { DataTableSearch } from '@cariva/ui/components/data-table/index.js';
	import { SelectField } from '@cariva/ui/components/form-inputs/select-field/index.js';
	import { CheckField } from '@cariva/ui/components/form-inputs/check-field/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { stores } from '$lib/store/index.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { canAccessBranchServices } from '$lib/utils/branch-service-access';
	import {
		branchServiceDefaults,
		branchServiceChanges,
		branchServiceFormSchema,
		branchServicePayload
	} from '$lib/validators/service-availability';
	import { useFetchHealthcareServices } from '$lib/hooks/healthcare-services/use-fetch-healthcare-services';
	import { useDebounce } from '$lib/hooks/app/use-debounce.svelte';
	import AvailabilityFields from '$lib/components/scheduling/availability-fields.svelte';
	import { parseError } from '$lib/utils/errorHandler';

	let {
		service,
		onSuccess,
		branchUid,
		timezone,
		branchIsActive
	}: {
		service?: BranchHealthcareServiceItem;
		branchUid: string;
		timezone: string;
		branchIsActive: boolean;
		onSuccess: () => void;
	} = $props();
	const { BranchHealthcareServiceStore: serviceStore, PermissionStore } = stores;
	const canWrite = $derived(
		canAccessBranchServices(stores, branchUid) &&
			canAccessBranchServices(
				stores,
				branchUid,
				service
					? PERMISSIONS.BRANCH_HEALTHCARE_SERVICES_UPDATE
					: PERMISSIONS.BRANCH_HEALTHCARE_SERVICES_CREATE
			) &&
			(Boolean(service) ||
				(branchIsActive && PermissionStore.can(PERMISSIONS.HEALTHCARE_SERVICES_READ)))
	);
	const initial = untrack(() => branchServiceDefaults(service, timezone));
	const form = superForm(initial, {
		SPA: true,
		dataType: 'json',
		resetForm: false,
		validators: zod4Client(branchServiceFormSchema(untrack(() => timezone))),
		onUpdated: async ({ form: updated }) => {
			if (!updated.valid || !canWrite) return;
			const payload = branchServicePayload(updated.data, timezone);
			const changes = service
				? branchServiceChanges(branchServicePayload(initial, timezone), payload)
				: payload;
			if (!Object.keys(changes).length) return;
			await serviceStore.save(
				branchUid,
				service?.healthcare_service_uid ?? updated.data.service_uid,
				!service,
				changes,
				onSuccess
			);
		}
	});
	const { form: data, enhance, reset } = form;
	const changed = $derived(JSON.stringify($data) !== JSON.stringify(initial));
	let search = $state('');
	const debounced = useDebounce(() => search.trim());
	const params = $state<HealthcareServiceQueryParams>({ limit: 10, offset: 0, is_active: true });
	const catalog = useFetchHealthcareServices(params, () => !service && canWrite);
	$effect(() => {
		params.q = debounced.value || undefined;
		params.offset = 0;
	});
</script>

<form use:enhance class="flex flex-col gap-4">
	<fieldset disabled={serviceStore.loading || !canWrite} class="flex min-w-0 flex-col gap-4">
		{#if !service}
			<DataTableSearch
				aria-label="Search catalogue"
				placeholder="Search catalogue"
				value={search}
				oninput={(event) => {
					search = event.currentTarget.value;
					$data.service_uid = '';
				}}
			/>
			{#if catalog.isPending}<Skeleton class="h-12 w-full" />
			{:else if catalog.isError}<p role="alert">{parseError(catalog.error)}</p>
				<Button type="button" variant="outline" onclick={() => catalog.refetch()}
					>Retry catalogue</Button
				>
			{:else}
				<FormField {form} name="service_uid"
					><SelectField
						type="single"
						label="Service"
						placeholder="Select a catalogue service"
						bind:value={$data.service_uid}
						selectables={(catalog.data?.data ?? []).map((item) => ({
							value: item.uid,
							label: item.name,
							enable: item.is_active
						}))}
					/></FormField
				>
				{#if !catalog.data?.data.length}<Paragraph size="sm" muted
						>No active services match this search.</Paragraph
					>{/if}
				<div class="flex items-center justify-between gap-2">
					<Button
						type="button"
						size="sm"
						variant="outline"
						disabled={params.offset === 0 || catalog.isFetching}
						onclick={() => {
							params.offset = Math.max(0, params.offset - params.limit);
							$data.service_uid = '';
						}}>Previous</Button
					>
					<Paragraph size="sm" muted
						>Page {catalog.data?.meta.page ?? 1} of {catalog.data?.meta.total_pages ?? 1}</Paragraph
					>
					<Button
						type="button"
						size="sm"
						variant="outline"
						disabled={catalog.isFetching ||
							params.offset + params.limit >= (catalog.data?.meta.total ?? 0)}
						onclick={() => {
							params.offset += params.limit;
							$data.service_uid = '';
						}}>Next</Button
					>
				</div>
				<Paragraph size="sm" muted
					>Choose an active tenant service. A service can only be assigned once to this branch.</Paragraph
				>
			{/if}
		{/if}
		<FormField {form} name="is_active"
			><CheckField
				label="Active at this branch"
				disabled={(!branchIsActive || (service && !service.catalog_is_active)) && !$data.is_active}
				bind:checked={$data.is_active}
			/></FormField
		>
		<AvailabilityFields {form} {timezone} />
	</fieldset>
	{#if !canWrite}<p role="alert">
			You do not have permission to configure services for this branch, or the branch is inactive.
		</p>{/if}
	{#if serviceStore.error}<p role="alert" class="text-sm text-destructive">
			{serviceStore.error}
		</p>{/if}
	<div class="flex justify-end gap-2">
		<Button
			type="button"
			variant="outline"
			disabled={serviceStore.loading || !changed}
			onclick={() => {
				reset({ data: structuredClone(initial) });
				serviceStore.error = '';
			}}>Reset changes</Button
		>
		<Button
			type="submit"
			isLoading={serviceStore.loading}
			disabled={!canWrite ||
				serviceStore.loading ||
				(Boolean(service) && !changed) ||
				(!service && (!$data.service_uid || catalog.isFetching))}
			>{service ? 'Save configuration' : 'Assign service'}</Button
		>
	</div>
</form>
