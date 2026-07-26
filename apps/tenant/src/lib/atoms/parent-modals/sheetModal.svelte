<script lang="ts">
	import { Sheet } from '@cariva/ui/components/ui/sheet/index.js';
	import type { Snippet } from 'svelte';

	type DialogModalProps = {
		children: Snippet;
		isOpen: boolean;
		closeModal: () => void;
	};

	let { children, isOpen, closeModal }: DialogModalProps = $props();
</script>

<Sheet open={isOpen} onOpenChange={closeModal}>
	{@render children()}
</Sheet>
