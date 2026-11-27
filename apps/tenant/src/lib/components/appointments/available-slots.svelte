<script lang="ts">
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	import CalendarClock from '@lucide/svelte/icons/calendar-clock';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { appointmentPeriod, appointmentTime } from '$lib/utils/appointment-booking';
	let {
		slots,
		timezone,
		selected,
		enabled,
		loading,
		error,
		onSelect,
		onretry
	}: {
		slots: AppointmentInterval[];
		timezone: string;
		selected: AppointmentInterval | null;
		enabled: boolean;
		loading: boolean;
		error: string;
		onSelect: (slot: AppointmentInterval) => void;
		onretry: () => void;
	} = $props();
</script>

<section
	class="flex flex-col gap-3 rounded-xl border p-3"
	aria-label="Available times"
	aria-busy={loading}
>
	<h3 class="font-medium">Available times</h3>
	{#if !enabled}<p class="text-sm text-muted-foreground">
			Choose a service, practitioner, date, and duration to see available times.
		</p>
	{:else if loading}<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
			{#each Array.from({ length: 9 }, (_, index) => index) as index (index)}<Skeleton
					class="h-10 w-full"
				/>{/each}
		</div>
	{:else if error}<EmptyState
			compact
			kind="error"
			title="Couldn’t load available times"
			description={error}
			onAction={onretry}
			class="p-0"
		/>
	{:else if !slots.length}<EmptyState
			compact
			icon={CalendarClock}
			title="No available times"
			description="No available times for this date and duration. Try another date or practitioner."
			class="p-0"
		/>
	{:else}{#each ['Morning', 'Afternoon', 'Evening'] as period (period)}
			{@const group = slots.filter(
				(slot) => appointmentPeriod(slot.starts_at, timezone) === period
			)}
			{#if group.length}<h4 class="text-sm text-muted-foreground">{period}</h4>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
					{#each group as slot (slot.starts_at)}<Button
							type="button"
							variant={selected?.starts_at === slot.starts_at ? 'default' : 'outline'}
							class="h-auto py-2 text-xs"
							aria-pressed={selected?.starts_at === slot.starts_at}
							onclick={() => onSelect(slot)}>{appointmentTime(slot.starts_at, timezone)}</Button
						>{/each}
				</div>{/if}
		{/each}{/if}
</section>
