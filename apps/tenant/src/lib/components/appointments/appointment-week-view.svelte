<script lang="ts">
	import { tick } from 'svelte';
	import { today, type CalendarDate } from '@internationalized/date';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import CalendarClock from '@lucide/svelte/icons/calendar-clock';
	import { cn } from '@cariva/ui/utils';
	import {
		appointmentWeek,
		appointmentDaySegments,
		appointmentCalendarTime
	} from '$lib/utils/appointment-calendar';
	import { appointmentStatuses } from '$lib/utils/appointment-workspace';
	import BookAppointment from './book-appointment.svelte';
	let {
		date,
		timezone,
		records,
		loading,
		error,
		filtered,
		onretry,
		onView,
		onDay,
		onClear
	}: {
		date: CalendarDate;
		timezone: string;
		records: AppointmentListItem[];
		loading: boolean;
		error: string;
		filtered: boolean;
		onretry: () => void;
		onView: (uid: string) => void;
		onDay: (date: CalendarDate) => void;
		onClear: () => void;
	} = $props();
	const week = $derived(appointmentWeek(date, timezone));
	const columns = $derived(
		week.days.map((day) => ({
			date: day,
			segments: appointmentDaySegments(records, day, timezone),
			clockChange:
				day.add({ days: 1 }).toDate(timezone).getTime() - day.toDate(timezone).getTime() !==
				86400000
		}))
	);
	let scroller = $state<HTMLDivElement>();
	let positionedWeek = $state('');
	$effect(() => {
		const key = week.start.toString();
		if (loading || error || !records.length) {
			positionedWeek = '';
			return;
		}
		if (positionedWeek === key || !scroller) return;
		const segments = columns.flatMap((column) => column.segments);
		const starting = segments.filter((segment) => !segment.continuesBefore);
		const first = Math.min(
			...(starting.length ? starting : segments).map((segment) => segment.start)
		);
		const top = Math.max(0, Math.floor(first / 60) - 1) * 72;
		let cancelled = false;
		void tick().then(() => {
			if (!cancelled && scroller) {
				scroller.scrollTop = top;
				positionedWeek = key;
			}
		});
		return () => {
			cancelled = true;
		};
	});
	const dayLabel = $derived(
		new Intl.DateTimeFormat('en-GB', { timeZone: timezone, dateStyle: 'full' })
	);
	function appointmentCalendarTone(status: AppointmentStatus) {
		if (status === 'cancelled' || status === 'noshow' || status === 'entered-in-error')
			return 'border-destructive bg-destructive/10';
		if (status === 'fulfilled') return 'border-success bg-success/10';
		if (status === 'arrived' || status === 'checked-in') return 'border-primary bg-primary/15';
		return 'border-info bg-info/10';
	}

	function label(record: AppointmentListItem) {
		return `${dayLabel.format(new Date(record.starts_at))}. ${record.patient?.display_name ?? 'Patient details unavailable'}. ${appointmentCalendarTime(record.starts_at, timezone, true)} – ${appointmentCalendarTime(record.ends_at, timezone, true)}. ${record.practitioner?.display_name ?? 'Practitioner unavailable'}. ${record.service?.name ?? 'Service unavailable'}. ${appointmentStatuses[record.status]}.`;
	}
</script>

<div
	class="overflow-hidden rounded-xl border bg-card text-card-foreground"
	aria-label="Weekly appointment calendar"
	aria-busy={loading}
>
	<div
		bind:this={scroller}
		class="max-h-[70vh] min-h-72 overflow-auto overscroll-contain"
		role="region"
		aria-label="Scrollable week calendar"
	>
		<div class="min-w-[1120px]">
			<div class="sticky top-0 z-20 grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b bg-card">
				<div
					class="flex items-center justify-center border-r px-1 text-[10px] text-muted-foreground"
				>
					Time
				</div>
				{#each week.days as day (day.toString())}<Button
						type="button"
						variant="ghost"
						class={cn(
							'h-auto flex-col gap-0 rounded-none border-r px-2 py-3 last:border-r-0',
							day.compare(today(timezone)) === 0 && 'bg-primary/10 text-primary'
						)}
						aria-label={`View appointments for ${new Intl.DateTimeFormat('en-GB', { timeZone: timezone, dateStyle: 'full' }).format(day.toDate(timezone))}`}
						onclick={() => onDay(day)}
						><span class="text-xs font-normal"
							>{new Intl.DateTimeFormat('en-GB', { timeZone: timezone, weekday: 'short' }).format(
								day.toDate(timezone)
							)}</span
						><span class="text-lg font-semibold">{day.day}</span></Button
					>{/each}
			</div>
			{#if loading}<div
					class="grid h-[576px] grid-cols-[64px_repeat(7,minmax(0,1fr))]"
					aria-label="Loading weekly appointments"
				>
					<div class="space-y-12 border-r p-2">
						{#each [0, 1, 2, 3, 4, 5, 6] as hour (hour)}<Skeleton class="h-4 w-10" />{/each}
					</div>
					{#each [0, 1, 2, 3, 4, 5, 6] as column (column)}<div
							class="space-y-12 border-r p-2 last:border-r-0"
						>
							<Skeleton class="mt-6 h-16 w-full" /><Skeleton class="h-24 w-full" /><Skeleton
								class="h-12 w-full"
							/>
						</div>{/each}
				</div>
			{:else if !error && records.length}<div class="grid grid-cols-[64px_repeat(7,minmax(0,1fr))]">
					<div class="relative border-r text-[10px] text-muted-foreground" style="height:1764px">
						{#each Array.from({ length: 24 }, (_, hour) => hour) as hour (hour)}<div
								class="absolute right-2"
								style:top={`${hour * 72 + 4}px`}
							>
								{hour === 0
									? '12 AM'
									: hour < 12
										? `${hour} AM`
										: hour === 12
											? '12 PM'
											: `${hour - 12} PM`}
							</div>{/each}
					</div>
					{#each columns as column (column.date.toString())}<div
							class="relative border-r last:border-r-0"
							role="group"
							aria-label={`Appointments for ${dayLabel.format(column.date.toDate(timezone))}`}
							style="height:1764px;background-image:repeating-linear-gradient(to bottom,var(--border) 0,var(--border) 1px,transparent 1px,transparent 72px)"
						>
							{#each column.segments as segment (segment.record.uid)}<Button
									type="button"
									variant="ghost"
									class={cn(
										'absolute block h-auto min-w-0 overflow-hidden rounded-md border-y-0 border-r-0 border-l-[3px] px-1 py-0.5 text-left font-normal whitespace-normal text-foreground shadow-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring',
										appointmentCalendarTone(segment.record.status)
									)}
									style={`top:${segment.start * 1.2}px;height:${Math.max(32, (segment.displayEnd - segment.start) * 1.2 - 2)}px;left:calc(${(segment.lane / segment.lanes) * 100}% + 2px);width:calc(${100 / segment.lanes}% - 4px)`}
									title={label(segment.record)}
									aria-label={label(segment.record)}
									onclick={() => onView(segment.record.uid)}
								>
									<span class="block truncate text-[12px] leading-[14px] font-semibold"
										>{segment.record.patient?.display_name ?? 'Patient unavailable'}</span
									>
									<span class="block truncate text-[11px] leading-[12px]"
										>{segment.continuesBefore ? '← ' : ''}{appointmentCalendarTime(
											segment.record.starts_at,
											timezone,
											column.clockChange
										)} – {appointmentCalendarTime(
											segment.record.ends_at,
											timezone,
											column.clockChange
										)}{segment.continuesAfter ? ' →' : ''}</span
									>
									{#if segment.displayEnd - segment.start >= 48}<span
											class="mt-1 block truncate text-[11px] leading-[12px]"
											>{segment.record.practitioner?.display_name ??
												'Practitioner unavailable'}</span
										>{/if}
									{#if segment.displayEnd - segment.start >= 70}<span
											class="mt-1 block truncate text-[11px] leading-[12px]"
											>{segment.record.service?.name ?? 'Service unavailable'}</span
										>{/if}
								</Button>{/each}
						</div>{/each}
				</div>{/if}
		</div>
		{#if !loading && error}<EmptyState
				kind="error"
				title="Couldn’t load this week’s appointments"
				description={error}
				onAction={onretry}
			/>
		{:else if !loading && !records.length}<EmptyState
				kind={filtered ? 'no-results' : 'empty'}
				title={filtered ? 'No matching appointments' : 'No appointments this week'}
				description={filtered
					? 'Try another search or clear your filters.'
					: 'Choose another week or book a patient visit.'}
				icon={filtered ? undefined : CalendarClock}
				>{#snippet actions()}{#if filtered}<Button
							type="button"
							variant="secondary"
							onclick={onClear}>Clear filters</Button
						>{:else}<BookAppointment />{/if}{/snippet}</EmptyState
			>{/if}
	</div>
</div>
{#if !loading && !error}<div
		class="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground"
	>
		<p>
			{records.length}
			{records.length === 1 ? 'appointment' : 'appointments'}
			{filtered ? 'matching the filters' : 'this week'}. Select an appointment to view details.
		</p>
		<div class="flex flex-wrap gap-3" aria-label="Appointment status colours">
			{#each [{ label: 'Booked', status: 'booked' }, { label: 'Arrived / checked in', status: 'arrived' }, { label: 'Encounter started', status: 'fulfilled' }, { label: 'Cancelled / no-show', status: 'cancelled' }] as item (item.status)}<span
					class="flex items-center gap-1.5"
					><span
						aria-hidden="true"
						class={cn(
							'size-2 rounded-full border-2',
							appointmentCalendarTone(item.status as AppointmentStatus)
						)}
					></span>{item.label}</span
				>{/each}
		</div>
	</div>{/if}
