<script lang="ts">
	import DialogModal from '$lib/atoms/parent-modals/dialogModal.svelte';
	import {
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription
	} from '@cariva/ui/components/ui/dialog/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { canAccessBranchServices } from '$lib/utils/branch-service-access';
	import { branchHealthcareServices } from '$lib/hooks/branch-healthcare-services/fetch-key-factory';
	import { useFetchBranchHealthcareService } from '$lib/hooks/branch-healthcare-services/use-fetch-branch-healthcare-services';
	import { parseError } from '$lib/utils/errorHandler';
	import AvailabilitySummary from '$lib/components/scheduling/availability-summary.svelte';
	import ServiceForm from './branch-healthcare-service-form.svelte';

	const { AppStore, BranchHealthcareServiceStore: serviceStore } = stores;
	const context = $state.snapshot(AppStore.branchHealthcareServiceModal);
	const tenantUid = AppStore.currentTenant.uid ?? '';
	const queryClient = useQueryClient();
	const query = useFetchBranchHealthcareService(
		() => context.branch_uid,
		() => context.service_uid
	);
	const canRead = $derived(canAccessBranchServices(stores, context.branch_uid));
	const canUpdate = $derived(
		canRead &&
			canAccessBranchServices(
				stores,
				context.branch_uid,
				PERMISSIONS.BRANCH_HEALTHCARE_SERVICES_UPDATE
			)
	);
	const blockedActivation = $derived(
		query.data &&
			!query.data.is_active &&
			(!query.data.catalog_is_active || !query.data.branch_is_active)
	);
	const title = $derived(
		context.mode === 'view'
			? 'Branch service details'
			: context.mode === 'status'
				? query.data?.is_active
					? 'Deactivate branch service'
					: 'Activate branch service'
				: context.service_uid
					? 'Configure branch service'
					: 'Assign service'
	);
	serviceStore.error = '';
	function close() {
		if (!serviceStore.loading)
			AppStore.toggleModals({ name: AppModals.BRANCH_HEALTHCARE_SERVICE_MODAL, open: false });
	}
	function success() {
		void queryClient.invalidateQueries({
			queryKey: branchHealthcareServices.all(tenantUid, context.branch_uid)
		});
		AppStore.toggleModals({ name: AppModals.BRANCH_HEALTHCARE_SERVICE_MODAL, open: false });
	}
	async function changeStatus() {
		if (!canUpdate || !query.data || blockedActivation) return;
		await serviceStore.save(
			context.branch_uid,
			context.service_uid,
			false,
			{ is_active: !query.data.is_active },
			success
		);
	}
</script>

<DialogModal isOpen={AppStore.isOpen.BRANCH_HEALTHCARE_SERVICE_MODAL} closeModal={close}>
	<DialogContent
		class="max-h-[90svh] overflow-y-auto sm:max-w-2xl"
		onInteractOutside={(event) => event.preventDefault()}
		onEscapeKeydown={(event) => {
			if (serviceStore.loading) event.preventDefault();
		}}
	>
		<DialogHeader
			><DialogTitle>{title}</DialogTitle><DialogDescription>{context.branch_name}</DialogDescription
			></DialogHeader
		>
		{#if !canRead}<p role="alert">You do not have permission to view services for this branch.</p>
		{:else if context.service_uid && (query.isPending || query.isFetching)}
			<div aria-label="Loading branch service" aria-busy="true" class="flex flex-col gap-4">
				<Skeleton class="h-6 w-48" />
				{#if context.mode === 'status'}
					<Skeleton class="h-16 w-full" /><Skeleton class="h-9 w-40" />
				{:else if context.mode === 'form'}
					<Skeleton class="h-5 w-40" />
					<div class="flex flex-col gap-3 rounded-xl border p-3">
						<Skeleton class="h-6 w-32" /><Skeleton class="h-4 w-full" /><Skeleton
							class="h-5 w-48"
						/>
						<div class="flex flex-col gap-3 rounded-lg border p-3">
							<Skeleton class="h-4 w-24" /><Skeleton class="h-12 w-full" /><Skeleton
								class="h-5 w-24"
							/>
							<div class="grid grid-cols-2 gap-3">
								<Skeleton class="h-12 w-full" /><Skeleton class="h-12 w-full" />
							</div>
						</div>
					</div>
					<div class="flex justify-end gap-2">
						<Skeleton class="h-9 w-28" /><Skeleton class="h-9 w-40" />
					</div>
				{:else}
					<Skeleton class="h-6 w-20 rounded-full" /><Skeleton class="h-4 w-40" /><Skeleton
						class="h-24 w-full"
					/><Skeleton class="h-24 w-full" />
				{/if}
			</div>
		{:else if context.service_uid && query.isError}
			<p role="alert">{parseError(query.error)}</p>
			<Button variant="outline" onclick={() => query.refetch()}>Retry</Button>
		{:else if context.mode === 'form'}
			{#if query.data}<p class="font-medium">{query.data.name}</p>{/if}
			<ServiceForm
				service={query.data}
				branchUid={context.branch_uid}
				timezone={query.data?.timezone ?? context.timezone}
				branchIsActive={query.data?.branch_is_active ?? context.branch_is_active}
				onSuccess={success}
			/>
		{:else if query.data}
			<p class="font-medium">{query.data.name}</p>
			{#if context.mode === 'status'}
				<p>
					{query.data.is_active
						? 'Deactivate this service at this branch? Saved hours and exceptions will be preserved.'
						: 'Activate this service at this branch? Configured service hours, branch hours, and practitioner schedules still determine booking availability.'}
				</p>
				{#if blockedActivation}<p role="alert">
						Activate the branch and catalogue service before enabling this offering.
					</p>{/if}
				{#if serviceStore.error}<p role="alert" class="text-destructive">
						{serviceStore.error}
					</p>{/if}
				<Button
					disabled={!canUpdate || serviceStore.loading || Boolean(blockedActivation)}
					isLoading={serviceStore.loading}
					onclick={changeStatus}
					>{query.data.is_active ? 'Deactivate service' : 'Activate service'}</Button
				>
			{:else}
				<div class="flex flex-wrap gap-2">
					<Badge variant={query.data.is_active ? 'default' : 'secondary'}
						>{query.data.is_active ? 'Active at branch' : 'Inactive at branch'}</Badge
					>
					{#if !query.data.catalog_is_active}<Badge variant="secondary">Catalogue inactive</Badge
						>{/if}
					{#if !query.data.branch_is_active}<Badge variant="secondary">Branch inactive</Badge>{/if}
				</div>
				<AvailabilitySummary
					availability={query.data.availability}
					timezone={query.data.timezone}
				/>
			{/if}
		{/if}
	</DialogContent>
</DialogModal>
