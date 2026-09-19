<script lang="ts">
	import { Card, CardTitle, CardContent, CardHeader } from '@cariva/ui/components/ui/card/index.js';
	import { Calendar } from '@cariva/ui/components/ui/calendar/index.js';
	import { today, getLocalTimeZone } from '@internationalized/date';
	import { Heading } from '@cariva/ui/components/ui/typography/index.js';
	import EmptyData from '$lib/components/empty-data.svelte';
</script>

<Card>
	<CardHeader>
		<Heading level="h3" class="border-b border-neutral-100 pb-2">Appointments</Heading>
	</CardHeader>

	<CardContent>
		<div class="flex flex-col gap-3">
			<div class="border-b border-neutral-100">
				<Calendar value={today(getLocalTimeZone())} />
			</div>

			<div>
				<CardTitle>Today</CardTitle>
				<EmptyData title="" description="No Appointments today" />
			</div>
		</div>
	</CardContent>
</Card>
