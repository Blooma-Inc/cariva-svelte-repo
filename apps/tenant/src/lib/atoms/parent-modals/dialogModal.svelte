<script lang="ts">
	import { Dialog } from '@cariva/ui/components/ui/dialog/index.js';
	import type { Snippet } from 'svelte';

	type DialogModalProps = {
		children: Snippet;
		isOpen: boolean;
		closeModal: () => void;
	};

	let { children, isOpen, closeModal }: DialogModalProps = $props();
</script>

<Dialog open={isOpen} onOpenChange={closeModal}>
	{@render children()}
</Dialog>
