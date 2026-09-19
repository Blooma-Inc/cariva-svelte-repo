<script lang="ts" module>
	import type { Snippet } from 'svelte';
	interface EmptyDataProps {
		children?: Snippet;
		title: string;
		description: string;
	}
</script>

<script lang="ts">
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';

	let { title, description, children }: EmptyDataProps = $props();
</script>

<div class="flex h-20 flex-col items-center justify-center gap-3 text-center">
	{@render children?.()}
	<div class="mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-1 text-center">
		<Heading level="h3">{title}</Heading>
		<Paragraph size="sm" muted>{description}</Paragraph>
	</div>
</div>
