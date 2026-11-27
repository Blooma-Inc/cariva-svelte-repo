<script lang="ts">
	import EmptyData from '$lib/components/empty-data.svelte';
	import { Card, CardHeader, CardTitle, CardContent } from '@cariva/ui/components/ui/card/index.js';
</script>

<Card>
	<CardHeader>
		<div class="flex items-center justify-between border-b border-neutral-200 pb-2">
			<CardTitle>Recent Actions</CardTitle>
		</div>
	</CardHeader>
	<CardContent class="flex flex-col gap-3">
		<EmptyData
			compact
			title="No Recent actions"
			description="The most recent actions of this user will appear here."
		/>
	</CardContent>
</Card>
