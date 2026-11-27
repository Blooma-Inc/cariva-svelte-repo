<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import { DEFAULT_WEEK_DAYS } from '$lib/validators/branch-hours';
	import { formatTime } from '$lib/utils/date';
	let { hours, timezone }: { hours: BranchOperatingHours | null; timezone: string | null } =
		$props();
	const enabled = $derived(hours?.days.some((day) => day.is_enabled) ?? false);
</script>

<Card aria-label="Branch operating hours">
	<CardHeader class="px-4 pt-4 pb-0"
		><CardTitle class="text-sm">Branch operating hours</CardTitle></CardHeader
	>
	<CardContent class="flex flex-col gap-3 px-4 pb-4">
		{#if !hours || !enabled}
			<Badge variant="secondary" class="w-fit">No operating days enabled</Badge>
			<p role="alert" class="text-sm">
				The branch has no enabled operating days. Appointments cannot be booked until a branch
				administrator configures its operating hours.
			</p>
		{:else}
			<p class="text-sm text-muted-foreground">Timezone: {timezone || 'Not configured'}</p>
			<dl class="flex flex-col gap-2">
				{#each DEFAULT_WEEK_DAYS as weekday (weekday.value)}
					{@const day = hours.days.find((item) => item.week_day === weekday.value)}
					<div class="flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm">
						<dt class="font-medium">{weekday.label}</dt>
						<dd>
							{#if !day?.is_enabled}Closed{:else if day.all_day}All day{:else if day.open_time && day.close_time}{formatTime(
									day.open_time
								)} – {formatTime(day.close_time)}{#if day.close_time < day.open_time}
									(next day){/if}{:else}Hours not configured{/if}
						</dd>
					</div>
				{/each}
			</dl>
		{/if}
	</CardContent>
</Card>
