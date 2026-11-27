<script lang="ts">
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	import CalendarClock from '@lucide/svelte/icons/calendar-clock';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '@cariva/ui/components/ui/tabs/index.js';
	import { appointmentWeek } from '$lib/utils/appointment-calendar';
	import WeekView from './appointment-week-view.svelte';
	import { today, type CalendarDate } from '@internationalized/date';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Card } from '@cariva/ui/components/ui/card/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { FilterChip } from '@cariva/ui/components/filter-chip/index.js';
	import { DataTablePagination, DataTableSearch } from '@cariva/ui/components/data-table/index.js';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { useAppointmentBookingContext } from '$lib/hooks/appointments/use-appointment-booking';
	import {
		useAppointmentList,
		useAppointmentWeek,
		useAppointmentSummary
	} from '$lib/hooks/appointments/use-appointment-workspace';
	import { appointments } from '$lib/hooks/appointments/fetch-key-factory';
	import { useDebounce } from '$lib/hooks/app/use-debounce.svelte';
	import { appointmentDay } from '$lib/utils/appointment-booking';
	import { appointmentStatuses } from '$lib/utils/appointment-workspace';
	import { isTimezone } from '$lib/validators/branch-hours';
	import { parseError } from '$lib/utils/errorHandler';
	import BookAppointment from './book-appointment.svelte';
	import DayPanel from './appointment-day-panel.svelte';
	import ListCard from './appointment-list-card.svelte';
	let { context }: { context: AppointmentBranchContext } = $props();
	const { AppStore, AppointmentStore } = stores;
	const client = useQueryClient();
	const booking = useAppointmentBookingContext(() => context.branch_uid);
	const timezone = $derived(booking.data?.branch.timezone ?? '');
	let date = $state<CalendarDate>();
	let mode = $state('list');
	let offset = $state(0);
	let limit = $state(10);
	const form = superForm(
		{ search: '', status: 'all' },
		{
			SPA: true,
			validators: zod4Client(z.object({ search: z.string(), status: z.string() })),
			onSubmit: ({ cancel }) => cancel()
		}
	);
	const { form: data, enhance } = form;
	const search = useDebounce(() => $data.search.trim());
	$effect(() => {
		if (!date && isTimezone(timezone)) date = today(timezone);
	});
	const day = $derived(
		date && isTimezone(timezone) ? appointmentDay(date.toString(), timezone) : null
	);
	const filterKey = $derived(JSON.stringify([date?.toString(), search.value, $data.status]));
	const week = $derived(date && isTimezone(timezone) ? appointmentWeek(date, timezone) : null);
	let previousKey = $state('');
	$effect(() => {
		if (previousKey !== filterKey) {
			previousKey = filterKey;
			offset = 0;
		}
	});
	const params = $derived<AppointmentListParams>({
		limit,
		offset,
		q: search.value || undefined,
		period_start: day?.starts_at,
		period_end: day?.ends_at,
		status: $data.status === 'all' ? undefined : ($data.status as AppointmentStatus)
	});
	const list = useAppointmentList(
		() => context.branch_uid,
		() => params,
		() => !!day && mode === 'list'
	);
	const weekly = useAppointmentWeek(
		() => context.branch_uid,
		() => ({
			period_start: week?.period_start ?? '',
			period_end: week?.period_end ?? '',
			q: search.value || undefined,
			status: $data.status === 'all' ? undefined : ($data.status as AppointmentStatus)
		}),
		() => !!week && mode === 'week'
	);
	const summary = useAppointmentSummary(
		() => context.branch_uid,
		() => ({ date: date?.toString() ?? '', q: search.value || undefined }),
		() => !!day && mode === 'list'
	);
	const result = $derived(list.data);
	const filtered = $derived(!!search.value || $data.status !== 'all');
	$effect(() => {
		if (result && !list.isFetching && offset >= result.meta.total && offset > 0)
			offset = Math.max(0, (Math.ceil(result.meta.total / limit) - 1) * limit);
	});
	function view(uid: string) {
		AppStore.toggleModals({
			name: AppModals.APPOINTMENT_DETAILS_MODAL,
			open: true,
			branch_uid: context.branch_uid,
			appointment_uid: uid
		});
	}
	async function perform(record: AppointmentListItem, action: AppointmentAction) {
		const success = await AppointmentStore.perform(context.branch_uid, record, action);
		if (success || AppointmentStore.actionConflict)
			await client.invalidateQueries({
				queryKey: appointments.all(AppStore.currentTenant.uid ?? '', context.branch_uid)
			});
	}
</script>

<div class="flex min-w-0 flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<Heading level="h3">Appointments</Heading><Paragraph muted
				>{booking.data?.branch.name ?? context.branch_name}</Paragraph
			>
		</div>
		<div class="flex items-center gap-2">
			<Button
				type="button"
				variant="outline"
				disabled={booking.isFetching ||
					list.isFetching ||
					weekly.isFetching ||
					summary.isFetching ||
					AppointmentStore.actionLoading}
				onclick={() => {
					void client.invalidateQueries({
						queryKey: appointments.all(AppStore.currentTenant.uid ?? '', context.branch_uid)
					});
				}}><RefreshCw class="size-3" />Refresh</Button
			><BookAppointment />
		</div>
	</div>
	{#if booking.isPending}<div class="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
			<Skeleton class="h-96 w-full" />
			<div class="space-y-4">
				<Skeleton class="h-16 w-full" />{#each [0, 1, 2] as row (row)}<Skeleton
						class="h-36 w-full"
					/>{/each}
			</div>
		</div>
	{:else if booking.isError}<EmptyState
			bordered
			kind="error"
			title="Couldn’t load branch details"
			description={parseError(booking.error)}
			onAction={() => {
				void booking.refetch();
			}}
		/>
	{:else if !isTimezone(timezone)}<Card class="p-6"
			><p role="alert">
				This branch needs a valid timezone before its daily appointments can be displayed.
			</p></Card
		>
	{:else if date}
		<div
			class={mode === 'list'
				? 'grid min-w-0 items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)]'
				: 'min-w-0'}
		>
			{#if mode === 'list'}<DayPanel
					{date}
					summary={summary.data?.data}
					loading={summary.isPending || summary.isFetching}
					error={summary.isError ? parseError(summary.error) : ''}
					onDate={(next) => (date = next)}
					onretry={() => {
						void summary.refetch();
					}}
					onView={view}
					{timezone}
					isToday={date.compare(today(timezone)) === 0}
				/>{/if}
			<section
				class="flex min-w-0 flex-col gap-4"
				aria-label={mode === 'week' ? 'Weekly appointment calendar' : 'Daily appointment worklist'}
			>
				<Tabs bind:value={mode} class="flex min-w-0 flex-col gap-4">
					<div class="flex flex-wrap items-center justify-between gap-3">
						<div>
							<h2 class="font-semibold">
								{mode === 'week'
									? 'Weekly appointments'
									: date.compare(today(timezone)) === 0
										? "Today's appointments"
										: 'Daily appointments'}
							</h2>
							<p class="text-sm text-muted-foreground">
								{mode === 'week' && week
									? `${new Intl.DateTimeFormat('en-GB', { timeZone: timezone, dateStyle: 'medium' }).format(week.start.toDate(timezone))} – ${new Intl.DateTimeFormat('en-GB', { timeZone: timezone, dateStyle: 'medium' }).format(week.start.add({ days: 6 }).toDate(timezone))}`
									: new Intl.DateTimeFormat('en-GB', {
											timeZone: timezone,
											dateStyle: 'full'
										}).format(date.toDate(timezone))}
							</p>
						</div>
						<div class="flex flex-wrap items-center gap-2">
							<TabsList aria-label="Appointment view"
								><TabsTrigger value="list">List</TabsTrigger><TabsTrigger value="week"
									>Week</TabsTrigger
								></TabsList
							>
							<Button
								variant="outline"
								size="icon"
								aria-label={mode === 'week' ? 'Previous week' : 'Previous day'}
								onclick={() => (date = date?.subtract({ days: mode === 'week' ? 7 : 1 }))}
								><ChevronLeft class="size-3" /></Button
							><Button variant="outline" onclick={() => (date = today(timezone))}>Today</Button
							><Button
								variant="outline"
								size="icon"
								aria-label={mode === 'week' ? 'Next week' : 'Next day'}
								onclick={() => (date = date?.add({ days: mode === 'week' ? 7 : 1 }))}
								><ChevronRight class="size-3" /></Button
							>
						</div>
					</div>
					<form use:enhance class="flex flex-wrap items-center gap-2">
						<FormField {form} name="search"
							><DataTableSearch
								aria-label="Search appointments"
								placeholder="Search appointments"
								type="search"
								bind:value={$data.search}
							/></FormField
						>
						<FilterChip
							label="Status"
							value={$data.status}
							defaultValue="all"
							options={[
								{ value: 'all', label: 'All statuses' },
								...Object.entries(appointmentStatuses).map(([value, label]) => ({
									value,
									label,
									count:
										mode === 'list'
											? summary.data?.data.counts_by_status[value as AppointmentStatus]
											: undefined
								}))
							]}
							onValueChange={(value) => {
								if (typeof value === 'string') $data.status = value;
							}}
						/>{#if filtered}<Button
								type="button"
								variant="secondary"
								onclick={() => {
									$data.search = '';
									$data.status = 'all';
								}}>Clear filters</Button
							>{/if}
					</form>
					<p class="text-xs text-muted-foreground">
						All times use {timezone}. {mode === 'list'
							? 'Summary counts follow the search and include every status.'
							: 'Monday–Sunday. Select a day heading to open its daily list.'}
					</p>
					{#if AppointmentStore.actionError}<p role="alert" class="text-sm text-destructive">
							{AppointmentStore.actionError}
						</p>{/if}
					<TabsContent value="list" class="mt-0 flex flex-col gap-4">
						<div class="flex flex-col gap-3" aria-busy={list.isPending || list.isFetching}>
							{#if list.isPending || list.isFetching}{#each [0, 1, 2] as row (row)}<Card
										class="gap-3 p-4"
										><Skeleton class="h-5 w-48" /><Skeleton class="h-4 w-28" /><Skeleton
											class="h-4 w-2/3"
										/><Skeleton class="h-8 w-24 self-end" /></Card
									>{/each}
							{:else if list.isError}<EmptyState
									bordered
									kind="error"
									title="Couldn’t load appointments"
									description={parseError(list.error)}
									onAction={() => {
										void list.refetch();
									}}
								/>
							{:else if !result?.data.length}<EmptyState
									bordered
									kind={filtered ? 'no-results' : 'empty'}
									title={filtered ? 'No matching appointments' : 'No appointments scheduled'}
									description={filtered
										? 'Try another search or clear your filters.'
										: 'There are no appointments for this date. Choose another date or book a patient visit.'}
									icon={filtered ? undefined : CalendarClock}
								>
									{#snippet actions()}{#if filtered}<Button
												type="button"
												variant="secondary"
												onclick={() => {
													$data.search = '';
													$data.status = 'all';
												}}>Clear filters</Button
											>{:else}<BookAppointment />{/if}{/snippet}
								</EmptyState>
							{:else}{#each result.data as record (record.uid)}<ListCard
										appointment={record}
										{timezone}
										onView={() => view(record.uid)}
										onAction={(action) => {
											void perform(record, action);
										}}
									/>{/each}{/if}
						</div>
						{#if result && result.meta.total > 0}<div class="overflow-x-auto">
								<DataTablePagination
									meta={{
										type: 'offset',
										total: result.meta.total,
										page: result.meta.page,
										perPage: result.meta.per_page,
										totalPages: result.meta.total_pages
									}}
									isLoading={list.isFetching}
									onPageChange={(page) => (offset = (page - 1) * limit)}
									onPerPageChange={(value) => {
										limit = value;
										offset = 0;
									}}
								/>
							</div>{/if}
					</TabsContent>
					<TabsContent value="week" class="mt-0 flex min-w-0 flex-col gap-3"
						><WeekView
							{date}
							{timezone}
							records={weekly.data ?? []}
							loading={weekly.isPending || weekly.isFetching}
							error={weekly.isError ? parseError(weekly.error) : ''}
							{filtered}
							onretry={() => {
								void weekly.refetch();
							}}
							onView={view}
							onDay={(next) => {
								date = next;
								mode = 'list';
							}}
							onClear={() => {
								$data.search = '';
								$data.status = 'all';
							}}
						/></TabsContent
					>
				</Tabs>
			</section>
		</div>
	{/if}
</div>
