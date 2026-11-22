<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ROUTES from '$lib/configs/routes.svelte';
	import { stores } from '$lib/store/index.svelte';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';

	let { data } = $props();
	const { AuthStore } = stores;
	let isSuccess = $state<boolean>();

	onMount(() => {
		void AuthStore.verifyEmail(data.token).then((success) => {
			isSuccess = success;
		});
	});
</script>

<div class="flex flex-col items-center gap-3 text-center">
	{#if isSuccess === undefined}
		<Heading level="h2">Verifying email...</Heading>
	{:else if isSuccess}
		<Heading level="h2">Verification successful</Heading>
		<Paragraph muted>Your email has been verified. You can now sign in.</Paragraph>
	{:else}
		<Heading level="h2">Verification failed</Heading>
		<Paragraph muted>{AuthStore.errors.isVerifyingEmail}</Paragraph>
		<Paragraph muted>You can request a new verification link at login.</Paragraph>
	{/if}
	{#if isSuccess !== undefined}
		<Button onclick={() => goto(ROUTES.LOGIN.resolve())}>Go to login</Button>
	{/if}
</div>
