<script lang="ts">
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	import { untrack } from 'svelte';
	import { useQueryClient } from '@tanstack/svelte-query';
	import SheetModal from '$lib/atoms/parent-modals/sheetModal.svelte';
	import {
		SheetContent,
		SheetHeader,
		SheetTitle,
		SheetDescription
	} from '@cariva/ui/components/ui/sheet/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { useAppointmentDetail } from '$lib/hooks/appointments/use-appointment-workspace';
	import { useAppointmentBookingContext } from '$lib/hooks/appointments/use-appointment-booking';
	import { appointments } from '$lib/hooks/appointments/fetch-key-factory';
	import { canReadAppointments } from '$lib/utils/appointment-booking';
	import {
		canPerformAppointment,
		appointmentActionLabels,
		appointmentClock,
		appointmentDateLabel
	} from '$lib/utils/appointment-workspace';
	import { isTimezone } from '$lib/validators/branch-hours';
	import { parseError } from '$lib/utils/errorHandler';
	import Status from './appointment-status.svelte';
	import ActionForm from './appointment-action-form.svelte';
	import Reschedule from './reschedule-appointment.svelte';
	const { AppStore, AppointmentStore } = stores;
	const context = untrack(() => $state.snapshot(AppStore.appointmentDetailsModal));
	const tenant = untrack(() => AppStore.currentTenant.uid ?? '');
	const client = useQueryClient();
	const detail = useAppointmentDetail(
		() => context.branch_uid,
		() => context.appointment_uid
	);
	const booking = useAppointmentBookingContext(() => context.branch_uid);
	const record = $derived(detail.data?.data);
	const timezone = $derived(booking.data?.branch.timezone ?? '');
	const allowed = $derived(canReadAppointments(stores, context.branch_uid));
	let action = $state<AppointmentAction | null>(null);
	AppointmentStore.actionError = '';
	AppointmentStore.actionConflict = false;
	function close() {
		if (!AppointmentStore.actionLoading)
			AppStore.toggleModals({ name: AppModals.APPOINTMENT_DETAILS_MODAL, open: false });
	}
	function format(value: string) {
		return isTimezone(timezone)
			? `${appointmentDateLabel(value, timezone)} · ${appointmentClock(value, timezone)}`
			: value;
	}
	async function submit(payload: object) {
		if (!record || !action) return;
		const success = await AppointmentStore.perform(context.branch_uid, record, action, payload);
		if (success) action = null;
		if (success || AppointmentStore.actionConflict)
			await client.invalidateQueries({ queryKey: appointments.all(tenant, context.branch_uid) });
	}
	const permitted = $derived(
		record
			? record.allowed_actions.filter((item) =>
					canPerformAppointment(stores, context.branch_uid, record, item)
				)
			: []
	);
	$effect(() => {
		if (action && record && !permitted.includes(action) && !AppointmentStore.actionLoading)
			action = null;
	});
</script>

<SheetModal isOpen={AppStore.isOpen.APPOINTMENT_DETAILS_MODAL} closeModal={close}>
	<SheetContent
		class="gap-5 overflow-hidden p-4 data-[side=right]:h-dvh data-[side=right]:w-full sm:p-6 data-[side=right]:sm:max-w-xl"
		onInteractOutside={(event) => {
			if (AppointmentStore.actionLoading) event.preventDefault();
		}}
		onEscapeKeydown={(event) => {
			if (AppointmentStore.actionLoading) event.preventDefault();
		}}
	>
		<SheetHeader class="shrink-0 p-0 pr-6"
			><SheetTitle>Appointment details</SheetTitle><SheetDescription
				>{booking.data?.branch.name ?? 'Branch appointment'}</SheetDescription
			></SheetHeader
		>
		{#if !allowed}<p role="alert">Your branch session or appointment access changed.</p>
		{:else if detail.isPending}<div
				class="flex flex-col gap-4"
				aria-label="Loading appointment"
				aria-busy="true"
			>
				<Skeleton class="h-8 w-2/3" /><Skeleton class="h-5 w-32" /><Skeleton class="h-56 w-full" />
			</div>
		{:else if detail.isError}<EmptyState
				compact
				kind="error"
				title="Couldn’t load appointment details"
				description={parseError(detail.error)}
				onAction={() => {
					void detail.refetch();
				}}
			/>
		{:else if record}
			{#if AppointmentStore.actionError}<p role="alert" class="shrink-0 text-sm text-destructive">
					{AppointmentStore.actionError}
				</p>{/if}
			{#if action === 'reschedule' && isTimezone(timezone)}<Reschedule
					{record}
					{timezone}
					onSubmit={submit}
					onCancel={() => (action = null)}
				/>
			{:else if action && action !== 'reschedule'}{#key action}<ActionForm
						{action}
						onSubmit={submit}
						onCancel={() => (action = null)}
					/>{/key}
			{:else}
				<div class="min-h-0 flex-1 space-y-5 overflow-y-auto">
					<div class="space-y-2">
						<h3 class="text-xl font-semibold">
							{record.patient?.display_name ?? 'Patient details unavailable'}
						</h3>
						<p class="text-sm text-muted-foreground">
							{record.patient?.patient_no ?? 'Patient number unavailable'}
						</p>
						<Status status={record.status} />
					</div>
					<dl class="space-y-4 rounded-xl border p-4 text-sm">
						{#each [{ label: 'Service', value: record.service?.name ?? 'Service unavailable' }, { label: 'Practitioner', value: record.practitioner?.display_name ?? 'Practitioner unavailable' }, { label: 'Starts', value: format(record.starts_at) }, { label: 'Ends', value: format(record.ends_at) }, { label: 'Timezone', value: timezone || 'Branch timezone unavailable' }, { label: 'Reason for visit', value: record.reason_for_visit || 'No reason recorded' }, { label: 'Scheduled by', value: record.created_by?.display_name ?? 'Staff details unavailable' }] as item (item.label)}<div
							>
								<dt class="text-muted-foreground">{item.label}</dt>
								<dd class="mt-1 break-words whitespace-pre-wrap">{item.value}</dd>
							</div>{/each}
					</dl>
					{#each [{ label: 'Arrived', value: record.arrived_at }, { label: 'Checked in', value: record.checked_in_at }, { label: 'Rescheduled', value: record.rescheduled_at }, { label: 'Cancelled', value: record.cancelled_at }, { label: 'No-show recorded', value: record.no_show_at }] as item (item.label)}{#if item.value}<p
								class="text-sm"
							>
								{item.label}: {format(item.value)}
							</p>{/if}{/each}
					{#if record.cancellation_reason}<p class="text-sm whitespace-pre-wrap">
							Cancellation reason: {record.cancellation_reason}
						</p>{/if}{#if record.no_show_reason}<p class="text-sm whitespace-pre-wrap">
							No-show reason: {record.no_show_reason}
						</p>{/if}
					{#if booking.isError}<EmptyState
							compact
							kind="error"
							title="Couldn’t load branch details"
							description={parseError(booking.error)}
							onAction={() => {
								void booking.refetch();
							}}
						/>{/if}
				</div>
				<div class="flex shrink-0 flex-wrap justify-end gap-2">
					{#each permitted as item (item)}<Button
							type="button"
							variant={item === 'arrive'
								? 'default'
								: item === 'reschedule'
									? 'secondary'
									: item === 'cancel' || item === 'mark_no_show'
										? 'destructive'
										: 'outline'}
							disabled={AppointmentStore.actionLoading ||
								detail.isFetching ||
								(item === 'reschedule' && !isTimezone(timezone))}
							onclick={() => {
								AppointmentStore.actionError = '';
								action = item;
							}}>{appointmentActionLabels[item]}</Button
						>{/each}<Button type="button" variant="outline" onclick={close}>Close</Button>
				</div>
			{/if}
		{/if}
	</SheetContent>
</SheetModal>
