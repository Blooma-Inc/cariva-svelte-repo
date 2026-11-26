<script lang="ts">
	import DialogModal from '$lib/atoms/parent-modals/dialogModal.svelte';
	import {
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription
	} from '@cariva/ui/components/ui/dialog/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { useFetchHealthcareService } from '$lib/hooks/healthcare-services/use-fetch-healthcare-services';
	import { healthcareServices } from '$lib/hooks/healthcare-services/fetch-key-factory';
	import { parseError } from '$lib/utils/errorHandler';
	import { formatDate } from '$lib/utils/date';
	import ServiceForm from './healthcare-service-form.svelte';
	const { AppStore, PermissionStore, HealthcareServiceStore: serviceStore } = stores;
	const context = $state.snapshot(AppStore.healthcareServiceModal);
	const tenantUid = AppStore.currentTenant.uid ?? '';
	const queryClient = useQueryClient();
	const query = useFetchHealthcareService(() => context.service_uid);
	const canRead = $derived(PermissionStore.can(PERMISSIONS.HEALTHCARE_SERVICES_READ));
	const canUpdate = $derived(
		canRead && PermissionStore.can(PERMISSIONS.HEALTHCARE_SERVICES_UPDATE)
	);
	serviceStore.error = '';
	const title = $derived(
		context.mode === 'view'
			? 'Service details'
			: context.mode === 'status'
				? query.data?.is_active
					? 'Deactivate service'
					: 'Activate service'
				: context.service_uid
					? 'Edit service'
					: 'Add service'
	);
	function close() {
		if (!serviceStore.loading)
			AppStore.toggleModals({ name: AppModals.HEALTHCARE_SERVICE_MODAL, open: false });
	}
	function success() {
		void queryClient.invalidateQueries({ queryKey: healthcareServices.all(tenantUid) });
		AppStore.toggleModals({ name: AppModals.HEALTHCARE_SERVICE_MODAL, open: false });
	}
	async function changeStatus() {
		if (!canUpdate || !query.data) return;
		await serviceStore.save(query.data.uid, { is_active: !query.data.is_active }, success);
	}
</script>

<DialogModal isOpen={AppStore.isOpen.HEALTHCARE_SERVICE_MODAL} closeModal={close}>
	<DialogContent
		class="max-h-[90svh] overflow-y-auto"
		onEscapeKeydown={(event) => {
			if (serviceStore.loading) event.preventDefault();
		}}
		onInteractOutside={(event) => event.preventDefault()}
	>
		<DialogHeader
			><DialogTitle>{title}</DialogTitle><DialogDescription
				>Tenant healthcare service catalog</DialogDescription
			></DialogHeader
		>
		{#if !canRead}<p role="alert">You do not have permission to view healthcare services.</p>
		{:else if context.service_uid && (query.isPending || query.isFetching)}
			<div class="flex flex-col gap-4" aria-label="Loading service details" aria-busy="true">
				{#if context.mode === 'view'}
					{#each ['name', 'description', 'status', 'created', 'updated'] as field (field)}
						<div class="flex flex-col gap-1">
							<Skeleton class="h-4 w-24" /><Skeleton
								class={field === 'description'
									? 'h-12 w-full'
									: field === 'status'
										? 'h-6 w-16 rounded-full'
										: 'h-5 w-40'}
							/>
						</div>
					{/each}
				{:else if context.mode === 'status'}
					<Skeleton class="h-16 w-full" /><Skeleton class="h-10 w-full" />
				{:else}
					<Skeleton class="h-12 w-full" /><Skeleton class="h-24 w-full" /><Skeleton
						class="h-10 w-full"
					/>
				{/if}
			</div>
		{:else if context.service_uid && query.isError}
			<p role="alert">{parseError(query.error)}</p>
			<Button onclick={() => query.refetch()}>Retry</Button>
		{:else if context.mode === 'form'}
			<ServiceForm service={query.data} onSuccess={success} />
		{:else if query.data}
			{#if context.mode === 'status'}
				<p>
					{query.data.is_active
						? `Deactivate ${query.data.name}? It will no longer be available for new appointment bookings. Existing branch configurations are preserved.`
						: `Activate ${query.data.name}? Branch availability settings still determine where and when it can be booked.`}
				</p>
				{#if serviceStore.error}<p role="alert" class="text-destructive">
						{serviceStore.error}
					</p>{/if}
				{#if !canUpdate}<p role="alert">
						You do not have permission to change service status.
					</p>{/if}
				<Button
					onclick={changeStatus}
					disabled={!canUpdate || serviceStore.loading}
					isLoading={serviceStore.loading}
					>{query.data.is_active ? 'Deactivate service' : 'Activate service'}</Button
				>
			{:else}
				<dl class="flex flex-col gap-4">
					<div>
						<dt class="text-sm text-muted-foreground">Name</dt>
						<dd class="font-medium">{query.data.name}</dd>
					</div>
					<div>
						<dt class="text-sm text-muted-foreground">Description</dt>
						<dd class="whitespace-pre-wrap">{query.data.description || 'No description'}</dd>
					</div>
					<div>
						<dt class="text-sm text-muted-foreground">Status</dt>
						<dd><Badge>{query.data.is_active ? 'Active' : 'Inactive'}</Badge></dd>
					</div>
					<div>
						<dt class="text-sm text-muted-foreground">Created</dt>
						<dd>{formatDate(query.data.created_at)}</dd>
					</div>
					<div>
						<dt class="text-sm text-muted-foreground">Last updated</dt>
						<dd>{formatDate(query.data.updated_at)}</dd>
					</div>
				</dl>
			{/if}
		{/if}
	</DialogContent>
</DialogModal>
