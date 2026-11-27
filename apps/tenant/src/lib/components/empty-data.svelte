<script lang="ts">
	import type { Snippet } from 'svelte';
	import { EmptyState, type EmptyStateProps } from '@cariva/ui/components/empty-state/index.js';
	let {
		title,
		description,
		children,
		icon,
		compact = false,
		kind = 'empty'
	}: {
		title: string;
		description: string;
		children?: Snippet;
		icon?: EmptyStateProps['icon'];
		compact?: boolean;
		kind?: EmptyStateProps['kind'];
	} = $props();
</script>

<EmptyState {title} {description} {icon} {compact} {kind} actions={children} />
