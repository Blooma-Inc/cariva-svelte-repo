<script lang="ts">
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import OctagonAlertIcon from '@lucide/svelte/icons/octagon-alert';
	import { goto } from '$app/navigation';
	import ROUTES from '$lib/configs/routes.svelte';

	interface Props {
		resource?: string;
		message?: string;
	}

	let { resource = 'this page', message }: Props = $props();
	const displayMessage = $derived(message ?? `You don't have permission to view ${resource}.`);
</script>

<section class="flex h-full w-full flex-col items-center justify-center gap-3 rounded-lg bg-white">
	<div class="rounded-full bg-red-200 p-3">
		<OctagonAlertIcon class="size-9 text-red-500" />
	</div>

	<div class="w-full text-center">
		<Heading class="text-red-500!">Access restricted</Heading>
		<Paragraph muted>{displayMessage}</Paragraph>
		<Paragraph muted>If you think this is a mistake, contact your tenant admin.</Paragraph>
	</div>

	<Button size="lg" onclick={() => goto(ROUTES.DASHBOARD.resolve())}>Go back home</Button>
</section>
