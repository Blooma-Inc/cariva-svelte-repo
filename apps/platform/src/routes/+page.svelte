<script lang="ts">
	import { Heading, Paragraph } from '@cariva/ui/components/typography/index.js';
	import { Button } from '@cariva/ui/components/button/index.js';
	import NoNetworkPrompt from '$lib/components/noNetworkPrompt.svelte';
</script>

<NoNetworkPrompt />
<div class="mx-auto flex w-full max-w-xl flex-col gap-1 px-4">
	<Heading level="h1">Welcome to SvelteKit</Heading>
	<Paragraph size="sm" muted balance>
		Visit <a href="https://svelte.dev/docs/kit" class="text-primary underline"
			>svelte.dev/docs/kit</a
		> to read the documentation
	</Paragraph>

	<Button size="lg">Button</Button>
</div>
