<script lang="ts">
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modalTypes';

	const { AppStore } = stores;
</script>

<div class="mx-auto flex w-full max-w-xl flex-col gap-1 px-4">
	<Heading level="h1">Welcome to SvelteKit</Heading>
	<Paragraph size="sm" muted balance>
		Visit <a href="https://svelte.dev/docs/kit" class="text-primary underline"
			>svelte.dev/docs/kit</a
		> to read the documentation
	</Paragraph>

	<Button
		size="lg"
		onclick={() =>
			AppStore.toggleModals({
				open: true,
				name: AppModals.DYNAMIC,
				title: 'Verification successful',
				description: 'Your Phone Number has been verified. You can continue to your dashboard.',
				btnText: 'Got it.',
				btnFn: () => {
					AppStore.toggleModals({});
				}
			})}
	>
		Button</Button
	>
</div>
