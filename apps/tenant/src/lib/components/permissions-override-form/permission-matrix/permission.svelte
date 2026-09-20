<script lang="ts">
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';

	let { text, isDefaultPerm }: { text: string; isDefaultPerm: boolean } = $props();
</script>

<div class="flex items-center justify-start gap-1">
	<p>
		{text}
	</p>
	{#if isDefaultPerm}
		<Badge class="rounded">Role default</Badge>
	{/if}
</div>
