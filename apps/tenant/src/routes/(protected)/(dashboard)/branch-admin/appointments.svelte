<script lang="ts">
	import { Card, CardTitle, CardContent, CardHeader } from '@cariva/ui/components/ui/card/index.js';
	import { Calendar } from '@cariva/ui/components/ui/calendar/index.js';
	import { today, getLocalTimeZone } from '@internationalized/date';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
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

				<div class="flex h-40 flex-col items-center justify-center gap-3 text-center">
					<div
						class="mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-1 text-center"
					>
						<Paragraph size="sm" muted>No Appointments today</Paragraph>
					</div>
				</div>
			</div>
		</div>
	</CardContent>
</Card>
