<script lang="ts">
	import { Card, CardContent, CardHeader } from '@cariva/ui/components/ui/card/index.js';
	import { Heading } from '@cariva/ui/components/ui/typography/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import EmptyData from '$lib/components/empty-data.svelte';
</script>

<Card>
	<CardHeader>
		<div class="flex items-center justify-between border-b border-neutral-100 pb-2">
			<Heading level="h3">Recent Activity</Heading>
			<Button size="sm" variant="link">View all Audit Log</Button>
		</div>
	</CardHeader>

	<CardContent>
		<EmptyData
			compact
			title="No recent activity"
			description="All recent activities will appear here."
		/>
	</CardContent>
</Card>
