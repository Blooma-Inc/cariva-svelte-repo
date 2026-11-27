<script lang="ts">
	import { untrack } from 'svelte';
	import SheetModal from '$lib/atoms/parent-modals/sheetModal.svelte';
	import {
		SheetContent,
		SheetHeader,
		SheetTitle,
		SheetDescription
	} from '@cariva/ui/components/ui/sheet/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import {
		canReadPractitionerSchedule,
		canWritePractitionerSchedule,
		canActivatePractitionerSchedule
	} from '$lib/utils/practitioner-availability-access';
	import {
		useFetchPractitionerSchedule,
		useFindPractitionerSchedule
	} from '$lib/hooks/practitioner-availability/use-fetch-practitioner-availability';
	import { practitionerAvailability } from '$lib/hooks/practitioner-availability/fetch-key-factory';
	import { isTimezone } from '$lib/validators/branch-hours';
	import { parseError } from '$lib/utils/errorHandler';
	import ContextPicker from './schedule-context-picker.svelte';
	import ScheduleForm from './practitioner-schedule-form.svelte';
	import AvailabilitySummary from './availability-summary.svelte';

	const { AppStore, PractitionerAvailabilityStore: serviceStore } = stores;
	const modal = $state.snapshot(AppStore.practitionerScheduleModal);
	const context = modal.context;
	if (!context) throw new Error('Schedule context is missing.');
	const tenantUid = AppStore.currentTenant.uid ?? '';
	const client = useQueryClient();
	let mode = $state(untrack(() => modal.mode));
	let offeringUid = $state<string | null>(null);
	const canRead = $derived(
		canReadPractitionerSchedule(stores, context.branch_uid, context.practitioner_uid)
	);
	const canCreate = $derived(
		canWritePractitionerSchedule(stores, context.branch_uid, context.practitioner_uid, true) &&
			context.assignment_is_active &&
			context.practitioner_is_active
	);
	const detail = useFetchPractitionerSchedule(context, modal.record_uid);
	const existing = useFindPractitionerSchedule(
		context,
		() => offeringUid,
		() => !modal.record_uid && canCreate
	);
	const query = $derived(modal.record_uid ? detail : existing);
	const record = $derived(query.data ?? undefined);
	const canUpdate = $derived(
		record &&
			canWritePractitionerSchedule(stores, context.branch_uid, context.practitioner_uid, false)
	);
	const canEdit = $derived(
		canUpdate && record?.assignment_is_active && record.assignment_uid === context.assignment_uid
	);
	const canToggle = $derived(
		canUpdate &&
			record &&
			(record.is_active ||
				(canActivatePractitionerSchedule(record) && isTimezone(record.timezone ?? '')))
	);
	serviceStore.error = '';
	function close() {
		if (!serviceStore.loading)
			AppStore.toggleModals({ name: AppModals.PRACTITIONER_SCHEDULE_MODAL, open: false });
	}
	function success() {
		void client.invalidateQueries({
			queryKey: practitionerAvailability.all(tenantUid, context!.branch_uid)
		});
		AppStore.toggleModals({ name: AppModals.PRACTITIONER_SCHEDULE_MODAL, open: false });
	}
	async function toggleStatus() {
		if (!record || !canToggle) return;
		await serviceStore.save(context!, { is_active: !record.is_active }, record, success);
	}
</script>

<SheetModal isOpen={AppStore.isOpen.PRACTITIONER_SCHEDULE_MODAL} closeModal={close}>
	<SheetContent
		class="gap-4 overflow-hidden p-4 data-[side=right]:h-dvh data-[side=right]:w-full sm:p-6 data-[side=right]:sm:max-w-2xl"
		onInteractOutside={(event) => event.preventDefault()}
		onEscapeKeydown={(event) => {
			if (serviceStore.loading) event.preventDefault();
		}}
	>
		<SheetHeader class="shrink-0 p-0 pr-6"
			><SheetTitle
				>{mode === 'view'
					? 'Practitioner schedule'
					: record
						? 'Edit schedule'
						: 'Set up schedule'}</SheetTitle
			><SheetDescription>{context.practitioner_name} · {context.branch_name}</SheetDescription
			></SheetHeader
		>
		<div class="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
			{#if !canRead || (!modal.record_uid && !canCreate)}<p role="alert">
					You do not have permission to manage this schedule, or an active practitioner and branch
					assignment are required.
				</p>
			{:else}
				{#if !modal.record_uid}<div class="shrink-0">
						<ContextPicker
							branchUid={context.branch_uid}
							bind:value={offeringUid}
							disabled={serviceStore.loading}
						/>
					</div>{/if}
				{#if !modal.record_uid && offeringUid === ''}<p class="text-sm text-muted-foreground">
						Select a branch service to continue.
					</p>
				{:else if query.isPending || query.isFetching}
					<div
						class="flex flex-col gap-4"
						aria-label="Loading practitioner schedule"
						aria-busy="true"
					>
						<Skeleton class="h-6 w-48" />
						{#if mode === 'view'}<Skeleton class="h-6 w-20 rounded-full" /><Skeleton
								class="h-24 w-full"
							/><Skeleton class="h-24 w-full" />
						{:else}
							<Skeleton class="h-5 w-36" />
							<div class="flex flex-col gap-3 rounded-xl border p-3">
								<Skeleton class="h-6 w-40" /><Skeleton class="h-4 w-full" /><Skeleton
									class="h-5 w-44"
								/><Skeleton class="h-12 w-full" />
								<div class="grid grid-cols-2 gap-3">
									<Skeleton class="h-12 w-full" /><Skeleton class="h-12 w-full" />
								</div>
							</div>
							<div class="flex shrink-0 justify-end gap-2">
								<Skeleton class="h-9 w-28" /><Skeleton class="h-9 w-36" />
							</div>
						{/if}
					</div>
				{:else if query.isError}<p role="alert">{parseError(query.error)}</p>
					<Button variant="outline" onclick={() => query.refetch()}>Retry schedule</Button>
				{:else if query.isSuccess}
					{#if record}
						<p class="shrink-0 font-medium">{record.service_name ?? 'General working hours'}</p>
						<div class="flex shrink-0 flex-wrap gap-2">
							<Badge variant={record.is_active ? 'default' : 'secondary'}
								>{record.is_active ? 'Active' : 'Inactive'}</Badge
							>{#if !record.assignment_is_active}<Badge variant="secondary"
									>Previous assignment</Badge
								>{/if}{#if !canActivatePractitionerSchedule(record)}<Badge variant="secondary"
									>Context inactive</Badge
								>{/if}
						</div>
					{/if}
					{#if mode === 'view' || (record && !canEdit)}
						{#if record}<div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
								<AvailabilitySummary
									availability={record.availability}
									timezone={record.timezone}
									kind="practitioner"
								/>
							</div>{/if}
						{#if serviceStore.error}<p role="alert" class="text-destructive">
								{serviceStore.error}
							</p>{/if}
						<div class="flex shrink-0 justify-end gap-2">
							{#if canToggle}<Button
									variant={record?.is_active ? 'destructive' : 'outline'}
									isLoading={serviceStore.loading}
									disabled={serviceStore.loading}
									onclick={toggleStatus}
									>{record?.is_active ? 'Deactivate' : 'Activate'} schedule</Button
								>{/if}{#if canEdit}<Button
									disabled={serviceStore.loading}
									onclick={() => {
										mode = 'form';
									}}>Edit schedule</Button
								>{/if}
						</div>
					{:else}
						{#if record && !modal.record_uid}<p class="text-sm text-muted-foreground">
								This schedule already exists for the current assignment. Saving will update it.
							</p>{/if}
						{#key `${record?.uid ?? 'new'}:${offeringUid ?? 'general'}`}
							<ScheduleForm {context} {record} {offeringUid} onSuccess={success} />
						{/key}
						{#if serviceStore.error && !modal.record_uid}<Button
								variant="outline"
								disabled={serviceStore.loading}
								onclick={() => existing.refetch()}>Refresh existing schedule</Button
							>{/if}
					{/if}
				{/if}
			{/if}
		</div>
	</SheetContent>
</SheetModal>
