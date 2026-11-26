<script lang="ts">
	import { Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	let {
		availability,
		timezone
	}: { availability: ServiceAvailability | null; timezone: string | null } = $props();
	function date(value: string) {
		return new Intl.DateTimeFormat('en', {
			timeZone: timezone || 'UTC',
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(value));
	}
</script>

<div class="flex flex-col gap-3">
	<Paragraph size="sm" muted>Timezone: {timezone || 'Not configured'}</Paragraph>
	{#if availability === null}
		<Paragraph>Service hours are unconfigured. New bookings require service hours.</Paragraph>
	{:else}
		{#if !availability.available_time.length}<Paragraph
				>No available windows. New bookings are unavailable.</Paragraph
			>{/if}
		{#each availability.available_time as window, index (index)}
			<div class="rounded-lg border p-3">
				<p class="text-sm font-medium">
					{window.days_of_week.map((day) => day[0].toUpperCase() + day.slice(1)).join(', ')}
				</p>
				<p class="text-sm">
					{window.all_day
						? 'All day'
						: `${window.available_start_time} – ${window.available_end_time}`}
					{#if !window.all_day && window.available_start_time && window.available_end_time && window.available_end_time < window.available_start_time}
						(ends the next day){/if}
				</p>
			</div>
		{/each}
		{#if availability.not_available_time.length}<p class="text-sm font-medium">
				Unavailable periods
			</p>{/if}
		{#each availability.not_available_time as exception, index (index)}
			<div class="rounded-lg border p-3">
				<p class="text-sm font-medium">{exception.description || 'Unavailable'}</p>
				<p class="text-sm">{date(exception.during.start)} – {date(exception.during.end)}</p>
			</div>
		{/each}
	{/if}
	<Paragraph size="sm" muted
		>Active service settings do not guarantee a bookable time. Branch hours and practitioner
		schedules also apply.</Paragraph
	>
</div>
