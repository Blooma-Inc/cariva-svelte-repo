<script lang="ts">
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	let { message, retry }: { message: string; retry: () => unknown } = $props();
</script>

<div role="alert" class="flex flex-col items-start gap-3 rounded-lg border p-4">
	<Paragraph size="sm">{message}</Paragraph>
	<Button variant="secondary" onclick={() => retry()}>Try again</Button>
</div>
