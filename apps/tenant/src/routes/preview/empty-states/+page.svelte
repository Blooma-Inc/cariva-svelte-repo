<script lang="ts">
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import CalendarClock from '@lucide/svelte/icons/calendar-clock';
	let notice = $state('');
</script>

<svelte:head><title>Empty states · Cariva</title></svelte:head>
<main class="min-h-screen bg-background px-5 py-10 text-foreground sm:px-10">
	<div class="mx-auto flex max-w-7xl flex-col gap-8">
		<div>
			<Heading level="h1">Empty states</Heading><Paragraph muted
				>Consistent visuals for empty data, no matching results, and failed requests.</Paragraph
			>
		</div>
		<div class="grid gap-5 lg:grid-cols-3">
			<section class="flex flex-col gap-3">
				<h2 class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
					Empty day
				</h2>
				<EmptyState
					bordered
					class="flex-1"
					icon={CalendarClock}
					title="No appointments scheduled"
					description="There are no appointments for this date. Choose another date or book a patient visit."
					actionLabel="Book appointment"
					onAction={() => (notice = 'Book appointment action selected.')}
				/>
			</section>
			<section class="flex flex-col gap-3">
				<h2 class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
					No results
				</h2>
				<EmptyState
					bordered
					class="flex-1"
					kind="no-results"
					title="No matching appointments"
					description="Try another search or clear your filters."
					onAction={() => (notice = 'Clear filters action selected.')}
				/>
			</section>
			<section class="flex flex-col gap-3">
				<h2 class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
					Request error
				</h2>
				<EmptyState
					bordered
					class="flex-1"
					kind="error"
					title="Couldn’t load appointments"
					description="We couldn’t retrieve the appointments. Please try again."
					onAction={() => (notice = 'Retry action selected.')}
				/>
			</section>
		</div>
		<section class="flex flex-col gap-3">
			<h2 class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
				Compact section
			</h2>
			<EmptyState
				bordered
				compact
				icon={CalendarClock}
				title="No upcoming arrivals"
				description="There are no more booked arrivals for today."
			/>
		</section>
		<p role="status" class="text-sm text-muted-foreground">
			{notice || 'Preview actions are local demonstrations.'}
		</p>
	</div>
</main>
