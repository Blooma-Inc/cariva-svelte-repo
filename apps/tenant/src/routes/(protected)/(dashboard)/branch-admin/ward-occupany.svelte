<script lang="ts">
	import { Card, CardContent, CardHeader } from '@cariva/ui/components/ui/card/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
</script>

<Card>
	<CardHeader>
		<div class="flex items-center justify-between border-b border-neutral-100 pb-2">
			<Heading level="h3">Ward Occupancy</Heading>
			<Button size="sm" variant="link">View all Audit Log</Button>
		</div>
	</CardHeader>

	<CardContent>
		<div class="flex h-20 flex-col items-center justify-center gap-3 text-center">
			<div
				class="mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-1 text-center"
			>
				<Paragraph size="sm" muted>No ward occupancy data</Paragraph>
			</div>
		</div>
	</CardContent>
</Card>
