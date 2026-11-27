<script lang="ts">
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	let { message, retry }: { message: string; retry: () => unknown } = $props();
</script>

<EmptyState
	compact
	bordered
	kind="error"
	title="Couldn’t load this section"
	description={message}
	onAction={() => {
		void retry();
	}}
/>
