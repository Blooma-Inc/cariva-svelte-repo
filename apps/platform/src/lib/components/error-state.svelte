<script lang="ts" module>
	export interface RolesErrorStateProps {
		title: string;
		description: string;
		onretry?: () => void;
		compact?: boolean;
		bordered?: boolean;
	}
</script>

<script lang="ts">
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	let {
		title,
		description,
		onretry,
		compact = false,
		bordered = true
	}: RolesErrorStateProps = $props();
</script>

<EmptyState
	kind="error"
	{title}
	{description}
	onAction={onretry}
	{compact}
	{bordered}
	class="col-span-full"
/>
