<script lang="ts">
	import BookingBranchHours from './booking-branch-hours.svelte';
	import BookingServiceSchedule from './booking-service-schedule.svelte';
	import BookingPractitionerSchedule from './booking-practitioner-schedule.svelte';
	import AvailableSlots from './available-slots.svelte';
	import BookingPatient from './booking-patient.svelte';
	import { untrack } from 'svelte';
	import { parseDate, today, type CalendarDate } from '@internationalized/date';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { useQueryClient } from '@tanstack/svelte-query';
	import SheetModal from '$lib/atoms/parent-modals/sheetModal.svelte';
	import {
		SheetContent,
		SheetHeader,
		SheetTitle,
		SheetDescription
	} from '@cariva/ui/components/ui/sheet/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { FormField, FormControl } from '@cariva/ui/components/ui/form/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/input-field/index.js';
	import { SelectField } from '@cariva/ui/components/form-inputs/select-field/index.js';
	import { TextareaField } from '@cariva/ui/components/form-inputs/textarea-field/index.js';
	import { DateField } from '@cariva/ui/components/date-fields/index.js';
	import { Card, CardHeader, CardTitle, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { appointmentFormSchema } from '$lib/validators/appointments';
	import { isTimezone } from '$lib/validators/branch-hours';
	import {
		appointmentBranch,
		appointmentDay,
		appointmentSlots,
		appointmentTime,
		bookingPractitioners,
		canBookAppointments
	} from '$lib/utils/appointment-booking';
	import {
		useAppointmentAvailability,
		useAppointmentBookingContext,
		useBookingOptions
	} from '$lib/hooks/appointments/use-appointment-booking';
	import { appointments } from '$lib/hooks/appointments/fetch-key-factory';
	import { parseError } from '$lib/utils/errorHandler';

	const { AppStore, AppointmentStore } = stores;
	const context = untrack(() => appointmentBranch(stores));
	const preset = untrack(() => $state.snapshot(AppStore.appointmentModal.patient));
	const branchUid = context?.branch_uid ?? '';
	const tenantUid = untrack(() => AppStore.currentTenant.uid ?? '');
	const client = useQueryClient();
	let step = $state(1);
	let selected = $state<(AppointmentInterval & { scope: string }) | null>(null);
	let patientLoading = $state(false);
	let patientLabel = $state(preset?.label ?? '');
	const initialDate = untrack(() =>
		context && isTimezone(context.timezone) ? today(context.timezone) : undefined
	);
	let dateValue = $state<CalendarDate | undefined>(initialDate);
	let dateIncomplete = $state(false);
	const allowed = $derived(canBookAppointments(stores, branchUid));
	AppointmentStore.error = '';
	AppointmentStore.slotConflict = false;
	const form = superForm(
		{
			branch_healthcare_service_uid: '',
			practitioner_uid: '',
			date: initialDate?.toString() ?? '',
			duration: 30,
			patient_uid: preset?.uid ?? '',
			patient_search: '',
			reason_for_visit: ''
		},
		{
			SPA: true,
			dataType: 'json',
			resetForm: false,
			validators: zod4Client(appointmentFormSchema),
			onSubmit: ({ cancel }) => {
				if (step === 1) {
					cancel();
					continueBooking();
				}
			},
			onUpdated: async ({ form: updated }) => {
				if (!updated.valid || step !== 2 || !allowed || AppointmentStore.loading) return;
				if (!validSelection || !selected) {
					AppointmentStore.error = 'Choose an available time before booking.';
					step = 1;
					return;
				}
				const result = await AppointmentStore.create(branchUid, {
					patient_uid: updated.data.patient_uid,
					practitioner_uid: updated.data.practitioner_uid,
					branch_healthcare_service_uid: updated.data.branch_healthcare_service_uid,
					starts_at: selected.starts_at,
					ends_at: selected.ends_at,
					reason_for_visit: updated.data.reason_for_visit || null
				});
				if (result) {
					void client.invalidateQueries({ queryKey: appointments.all(tenantUid, branchUid) });
					AppStore.toggleModals({ name: AppModals.APPOINTMENT_FORM_MODAL, open: false });
				} else if (AppointmentStore.slotConflict) {
					selected = null;
					step = 1;
					await availability.refetch();
				}
			}
		}
	);
	const { form: data, errors, enhance } = form;
	const bookingContext = useAppointmentBookingContext(() => branchUid);
	const branchReady = $derived(
		bookingContext.isSuccess &&
			!bookingContext.isFetching &&
			bookingContext.data.branch.is_active &&
			!!bookingContext.data.branch.operating_hours?.days.some((day) => day.is_enabled)
	);
	const servicesQuery = useBookingOptions(() => branchUid, 'services');
	const practitionersQuery = useBookingOptions(() => branchUid, 'practitioners');
	const services = $derived(
		(servicesQuery.data ?? []).filter((item) => item.is_effectively_active)
	);
	const service = $derived(
		services.find((item) => item.uid === $data.branch_healthcare_service_uid)
	);
	const timezone = $derived(
		bookingContext.data ? (bookingContext.data.branch.timezone ?? '') : (context?.timezone ?? '')
	);
	const practitioners = $derived(
		bookingPractitioners(practitionersQuery.data ?? [], service?.uid ?? '')
	);
	const practitioner = $derived(
		practitioners.find((item) => item.practitioner_uid === $data.practitioner_uid)
	);
	const day = $derived(
		isTimezone(timezone) && !dateIncomplete ? appointmentDay($data.date, timezone) : null
	);
	const params = $derived<AppointmentAvailabilityParams | null>(
		branchReady &&
			service &&
			practitioner &&
			day &&
			Number.isInteger($data.duration) &&
			$data.duration >= 5 &&
			$data.duration <= 480
			? {
					...day,
					practitioner_uid: practitioner.practitioner_uid,
					branch_healthcare_service_uid: service.uid,
					...($data.patient_uid ? { patient_uid: $data.patient_uid } : {})
				}
			: null
	);
	const scope = $derived(
		JSON.stringify([
			branchUid,
			$data.branch_healthcare_service_uid,
			$data.practitioner_uid,
			$data.date,
			$data.duration,
			dateIncomplete,
			timezone
		])
	);
	const availability = useAppointmentAvailability(
		() => branchUid,
		() => params
	);
	const slots = $derived(
		day && availability.data
			? appointmentSlots(availability.data.intervals, day, $data.duration)
			: []
	);
	const validSelection = $derived(
		allowed &&
			selected?.scope === scope &&
			!!params &&
			availability.isSuccess &&
			!availability.isFetching &&
			slots.some(
				(item) => item.starts_at === selected?.starts_at && item.ends_at === selected?.ends_at
			)
	);
	$effect(() => {
		$data.date = dateValue?.toString() ?? '';
	});
	$effect(() => {
		if (selected && selected.scope !== scope) selected = null;
	});
	function continueBooking() {
		if (!validSelection) return;
		AppointmentStore.error = '';
		step = 2;
	}
	function close() {
		if (!AppointmentStore.loading)
			AppStore.toggleModals({ name: AppModals.APPOINTMENT_FORM_MODAL, open: false });
	}
</script>

<SheetModal isOpen={AppStore.isOpen.APPOINTMENT_FORM_MODAL} closeModal={close}>
	<SheetContent
		class="gap-5 overflow-hidden p-4 data-[side=right]:h-dvh data-[side=right]:w-full sm:p-6 data-[side=right]:sm:max-w-2xl"
		onInteractOutside={(event) => event.preventDefault()}
		onEscapeKeydown={(event) => {
			if (AppointmentStore.loading) event.preventDefault();
		}}
	>
		<SheetHeader class="shrink-0 p-0 pr-6">
			<SheetTitle>Book appointment</SheetTitle>
			<SheetDescription
				>{bookingContext.data?.branch.name ?? context?.branch_name ?? 'Branch appointment booking'} ·
				Step {step} of 2 — {step === 1
					? 'Find a time'
					: 'Patient and confirmation'}</SheetDescription
			>
		</SheetHeader>
		{#if !allowed}
			<p role="alert">
				Booking requires an active branch session and permission to create appointments, read
				availability, branch services, practitioner schedules, and patients.
			</p>
		{:else}
			<form use:enhance class="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
				<div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
					<fieldset disabled={AppointmentStore.loading} class="flex min-w-0 flex-col gap-4">
						{#if step === 1}
							{#if bookingContext.isPending || bookingContext.isFetching}
								<Card aria-label="Loading branch operating hours" aria-busy="true"
									><CardHeader class="px-4 pt-4 pb-0"
										><CardTitle class="text-sm">Branch operating hours</CardTitle></CardHeader
									><CardContent class="flex flex-col gap-3 px-4 pb-4"
										><Skeleton class="h-4 w-40" /><Skeleton class="h-28 w-full" /></CardContent
									></Card
								>
							{:else if bookingContext.isError}
								<Card
									><CardHeader class="px-4 pt-4 pb-0"
										><CardTitle class="text-sm">Branch operating hours</CardTitle></CardHeader
									><CardContent class="flex flex-col gap-3 px-4 pb-4"
										><p role="alert" class="text-sm">
											Could not load branch booking details: {parseError(bookingContext.error)}
										</p>
										<Button type="button" variant="outline" onclick={() => bookingContext.refetch()}
											>Retry branch details</Button
										></CardContent
									></Card
								>
							{:else if bookingContext.data}
								{#if !bookingContext.data.branch.is_active}<p
										role="alert"
										class="text-sm text-destructive"
									>
										This branch is inactive. Appointments cannot be booked.
									</p>{/if}
								{#if !isTimezone(timezone)}<p role="alert" class="text-sm text-destructive">
										The branch needs a valid timezone before appointments can be booked.
									</p>{/if}
								<BookingBranchHours
									hours={bookingContext.data.branch.operating_hours}
									timezone={bookingContext.data.branch.timezone}
								/>
							{/if}
							{#if servicesQuery.isPending}<Skeleton
									class="h-16 w-full"
									aria-label="Loading services"
								/>
							{:else if servicesQuery.isError}<p role="alert">{parseError(servicesQuery.error)}</p>
								<Button type="button" variant="outline" onclick={() => servicesQuery.refetch()}
									>Retry services</Button
								>
							{:else if !services.length}<p>No active services are available in this branch.</p>
							{:else}<FormField {form} name="branch_healthcare_service_uid"
									><SelectField
										type="single"
										label="Service"
										placeholder="Select a service"
										selectables={services.map((item) => ({
											value: item.uid,
											label: item.name,
											enable: true
										}))}
										bind:value={$data.branch_healthcare_service_uid}
									/></FormField
								>{/if}
							{#if service}
								<BookingServiceSchedule {branchUid} serviceUid={service.healthcare_service_uid} />
								{#if practitionersQuery.isPending}<Skeleton
										class="h-16 w-full"
										aria-label="Loading practitioners"
									/>
								{:else if practitionersQuery.isError}<p role="alert">
										{parseError(practitionersQuery.error)}
									</p>
									<Button
										type="button"
										variant="outline"
										onclick={() => practitionersQuery.refetch()}>Retry practitioners</Button
									>
								{:else if !practitioners.length}<p>
										No practitioners have an active schedule for this service.
									</p>
								{:else}<FormField {form} name="practitioner_uid"
										><SelectField
											type="single"
											label="Practitioner"
											placeholder="Select a practitioner"
											selectables={practitioners.map((item) => ({
												value: item.practitioner_uid,
												label: item.practitioner_name,
												enable: true
											}))}
											bind:value={$data.practitioner_uid}
										/></FormField
									>{/if}
								{#if practitioner}
									{#key `${branchUid}:${service.uid}:${practitioner.practitioner_uid}:${practitioner.assignment_uid}`}
										<BookingPractitionerSchedule
											{branchUid}
											serviceUid={service.uid}
											practitionerUid={practitioner.practitioner_uid}
											assignmentUid={practitioner.assignment_uid}
											{timezone}
										/>
									{/key}
								{/if}
								{#if isTimezone(timezone)}
									<p class="text-sm text-muted-foreground">All times use {timezone}.</p>
									<div class="grid items-start gap-3 sm:grid-cols-2">
										<FormField {form} name="date"
											><FormControl
												>{#snippet children({ props })}<DateField
														{...props}
														label="Appointment date"
														value={dateValue}
														onValueChange={(next) => {
															dateValue = next ? parseDate(next.toString()) : undefined;
														}}
														onEditStateChange={(state) => {
															dateIncomplete = state.incomplete;
														}}
														minValue={today(timezone)}
														error={$errors.date?.join(' ')}
													/>{/snippet}</FormControl
											></FormField
										>
										<FormField {form} name="duration"
											><InputField
												type="number"
												label="Duration (minutes)"
												min={5}
												max={480}
												step={1}
												bind:value={$data.duration}
											/></FormField
										>
									</div>
								{:else}<p role="alert">
										This branch needs a valid timezone before appointments can be booked.
									</p>{/if}
							{/if}

							<AvailableSlots
								{slots}
								{timezone}
								selected={selected?.scope === scope ? selected : null}
								enabled={!!params}
								loading={availability.isPending || availability.isFetching}
								error={availability.isError ? parseError(availability.error) : ''}
								onretry={() => {
									void availability.refetch();
								}}
								onSelect={(slot) => {
									selected = { ...slot, scope };
									AppointmentStore.error = '';
								}}
							/>
						{:else}
							<div class="flex flex-col gap-1 rounded-xl border p-4">
								<h3 class="font-medium">Appointment summary</h3>
								<p>{service?.name} · {practitioner?.practitioner_name}</p>
								<p>
									{$data.date} · {selected ? appointmentTime(selected.starts_at, timezone) : ''} – {selected
										? appointmentTime(selected.ends_at, timezone)
										: ''}
								</p>
								<p class="text-sm text-muted-foreground">{$data.duration} minutes · {timezone}</p>
							</div>
							<BookingPatient
								{form}
								{branchUid}
								bind:label={patientLabel}
								bind:loading={patientLoading}
							/>
							<FormField {form} name="reason_for_visit"
								><TextareaField
									label="Reason for visit (optional)"
									bind:value={$data.reason_for_visit}
									maxlength={2000}
								/></FormField
							>
							{#if availability.isFetching}<p role="status" class="text-sm text-muted-foreground">
									Checking availability for this patient…
								</p>{:else if availability.isError}<p role="alert">
									{parseError(availability.error)}
								</p>
								<Button type="button" variant="outline" onclick={() => availability.refetch()}
									>Retry availability</Button
								>{:else if !validSelection}<p role="alert">
									This time is no longer available. Go back to choose another time.
								</p>{/if}
						{/if}
					</fieldset>
				</div>
				{#if AppointmentStore.error}<p role="alert" class="shrink-0 text-sm text-destructive">
						{AppointmentStore.error}
					</p>{/if}
				<div class="flex shrink-0 justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						disabled={AppointmentStore.loading}
						onclick={() => {
							if (step === 2) step = 1;
							else close();
						}}>{step === 2 ? 'Back' : 'Cancel'}</Button
					>
					{#if step === 1}<Button type="button" disabled={!validSelection} onclick={continueBooking}
							>Continue</Button
						>{:else}<Button
							type="submit"
							isLoading={AppointmentStore.loading}
							disabled={AppointmentStore.loading ||
								!validSelection ||
								!$data.patient_uid ||
								patientLoading}>Book appointment</Button
						>{/if}
				</div>
			</form>
		{/if}
	</SheetContent>
</SheetModal>
