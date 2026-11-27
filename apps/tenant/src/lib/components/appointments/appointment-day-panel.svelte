<script lang="ts">
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	import CalendarClock from '@lucide/svelte/icons/calendar-clock';
	import type { CalendarDate, DateValue } from '@internationalized/date';
	import { parseDate } from '@internationalized/date';
	import { Calendar } from '@cariva/ui/components/ui/calendar/index.js';
	import { Card, CardHeader, CardTitle, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { appointmentClock } from '$lib/utils/appointment-workspace';
	let {
		date,
		summary,
		loading,
		error,
		onDate,
		onretry,
		onView,
		timezone,
		isToday
	}: {
		date: CalendarDate;
		summary?: AppointmentDailySummary;
		loading: boolean;
		error: string;
		onDate: (date: CalendarDate) => void;
		onretry: () => void;
		onView: (uid: string) => void;
		timezone: string;
		isToday: boolean;
	} = $props();
</script>

<aside class="flex min-w-0 flex-col gap-4">
	<Card class="overflow-hidden">
		<CardContent class="px-3 pt-3"
			><Calendar
				type="single"
				value={date}
				onValueChange={(next: DateValue | undefined) => {
					if (next) onDate(parseDate(next.toString()));
				}}
				preventDeselect
				weekStartsOn={1}
				class="mx-auto w-full max-w-80 p-0"
				captionLayout="dropdown"
			/></CardContent
		>
		<CardHeader class="px-4 pb-0"
			><CardTitle class="text-sm">{isToday ? 'Today' : 'Day'} at a glance</CardTitle></CardHeader
		>
		<CardContent class="flex flex-col gap-3 px-4 pb-4" aria-busy={loading}>
			{#if loading}{#each [0, 1, 2, 3] as row (row)}<Skeleton class="h-5 w-full" />{/each}
			{:else if error}<EmptyState
					compact
					kind="error"
					title="Couldn’t load the daily summary"
					description={error}
					onAction={onretry}
					class="p-0"
				/>
			{:else if summary}<dl class="space-y-3 text-sm">
					{#each [{ label: 'Appointments', count: summary.total }, { label: 'Expected', count: summary.counts_by_status.booked }, { label: 'Arrived', count: summary.counts_by_status.arrived }, { label: 'Checked in', count: summary.counts_by_status['checked-in'] }] as item (item.label)}<div
							class="flex items-center justify-between gap-3"
						>
							<dt class="text-muted-foreground">{item.label}</dt>
							<dd class="font-semibold tabular-nums">{item.count ?? 0}</dd>
						</div>{/each}
				</dl>{/if}
		</CardContent>
	</Card>
	<Card
		><CardHeader class="px-4 pt-4 pb-0"
			><CardTitle class="text-sm">Next expected arrival</CardTitle></CardHeader
		><CardContent class="flex flex-col gap-2 px-4 pb-4">
			{#if loading}<Skeleton class="h-7 w-24" /><Skeleton
					class="h-5 w-full"
				/>{:else if error}<EmptyState
					compact
					kind="error"
					title="Next arrival unavailable"
					description="The next arrival could not be loaded."
					onAction={onretry}
					class="p-0"
				/>{:else if summary?.next_expected}<p class="text-xl font-semibold">
					{appointmentClock(summary.next_expected.starts_at, timezone)}
				</p>
				<Button
					type="button"
					variant="link"
					class="h-auto justify-start p-0 text-left whitespace-normal"
					onclick={() => onView(summary!.next_expected!.uid)}
					>{summary.next_expected.patient?.display_name ?? 'Patient details unavailable'}</Button
				>
				<p class="text-xs text-muted-foreground">
					{summary.next_expected.service?.name ?? 'Service unavailable'}
				</p>{:else}<EmptyState
					compact
					icon={CalendarClock}
					title="No upcoming arrivals"
					description="There are no upcoming booked arrivals for this date and these filters."
					class="p-0"
				/>{/if}
		</CardContent></Card
	>
</aside>
