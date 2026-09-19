<!-- <script lang="ts" module>
	interface LoginAttemptsProps {
		email: string;
	}
</script> -->

<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import XIcon from '@lucide/svelte/icons/x';
	import EmptyData from '$lib/components/empty-data.svelte';

	// let { email }: LoginAttemptsProps = $props();
</script>

<Card>
	<CardHeader>
		<div class="flex items-center justify-between border-b border-neutral-200 pb-2">
			<CardTitle>Recent Login History</CardTitle>
			<Button size="xs" variant="outline">
				<XIcon class="size-3" />
				Force sessions logout
			</Button>
		</div>
	</CardHeader>
	<CardContent class="flex flex-col gap-3">
		<EmptyData
			title="No Recent logins"
			description="The most recent logins of this user will appear here."
		/>
	</CardContent>
</Card>
