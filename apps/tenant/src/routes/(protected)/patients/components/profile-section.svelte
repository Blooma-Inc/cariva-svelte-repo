<script lang="ts">
	import { Heading } from '@cariva/ui/components/ui/typography/index.js';
	let {
		title,
		items
	}: { title: string; items: Array<{ label: string; value: string | null | undefined }> } =
		$props();
</script>

<section class="rounded-xl bg-muted/40 p-4">
	<Heading level="h3" class="mb-4 text-base!">{title}</Heading>
	<dl class="grid gap-3 text-sm">
		{#each items as item (item.label)}
			<div class="grid grid-cols-[.9fr_1.1fr] gap-3">
				<dt class="text-muted-foreground">{item.label}</dt>
				<dd class="min-w-0 font-medium wrap-break-word">{item.value || 'Not recorded'}</dd>
			</div>
		{/each}
	</dl>
</section>
