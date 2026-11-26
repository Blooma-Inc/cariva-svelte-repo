<script lang="ts">
	import { Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	let {
		label,
		value,
		loading = false
	}: { label: string; value?: string | number | null; loading?: boolean } = $props();
</script>

<div class="flex min-w-0 flex-col gap-1">
	<Paragraph size="sm" muted>{label}</Paragraph>
	{#if loading}
		<Skeleton class="my-0.5 h-4 w-3/4" />
	{:else}
		<Paragraph size="sm" class="font-semibold break-words">{value ?? 'Not provided'}</Paragraph>
	{/if}
</div>
