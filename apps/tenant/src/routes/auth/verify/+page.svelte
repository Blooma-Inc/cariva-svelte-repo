<script lang="ts">
	import { goto } from '$app/navigation';
	import ROUTES from '$lib/configs/routes.svelte';
	import { stores } from '$lib/store/index.svelte';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import BadgeCheckIcon from '@lucide/svelte/icons/badge-check';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';

	const { AuthStore } = stores;
	let { data } = $props();
	let isSuccess = $state<boolean>();

	async function handleVerification() {
		const cbFn = () => setTimeout(() => goto(ROUTES.DASHBOARD.resolve()), 2000);
		isSuccess = await AuthStore.verifyEmail(data.token, cbFn);
	}

	$effect(() => {
		handleVerification();
	});
</script>

<div class="flex flex-col items-center gap-3 text-center">
	{#if AuthStore.loaders.isVerifyingEmail}
		<LoaderCircleIcon class="size-20 animate-spin text-primary/80" />
		<Heading level="h2">Verifing</Heading>
	{:else if isSuccess}
		<BadgeCheckIcon class="size-20 text-primary/80" />
		<Heading level="h2">Verification Successful</Heading>
		<Paragraph muted>
			Your account has been Successfully verified. We will redirect you shortly.
		</Paragraph>
	{:else if isSuccess == false}
		<CircleAlertIcon class="size-20 text-destructive" />
		<Heading level="h2">Verification Failed</Heading>
		<Paragraph muted
			>Unfortunately we are unable to verify your account. You can request a new verification token
			at login.</Paragraph
		>
	{/if}
</div>
