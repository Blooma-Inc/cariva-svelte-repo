<script lang="ts" module>
	export interface RolesErrorStateProps {
		title: string;
		description: string;
		onretry?: () => void;
	}
</script>

<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '@cariva/ui/components/ui/card/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';

	const { title, description, onretry }: RolesErrorStateProps = $props();
</script>

<Card class="col-span-full w-full border-destructive/40 bg-destructive/5">
	<CardHeader>
		<div class="flex items-center gap-2 text-destructive">
			<CircleAlertIcon class="h-5 w-5" />
			<CardTitle>{title}</CardTitle>
		</div>
	</CardHeader>

	<CardContent class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<CardDescription class="text-muted-foreground">{description}</CardDescription>

		{#if onretry}
			<Button variant="outline" onclick={onretry}>
				<RefreshCwIcon class="h-4 w-4" />
				Retry
			</Button>
		{/if}
	</CardContent>
</Card>
