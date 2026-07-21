<script lang="ts">
	import DialogModal from '$lib/atoms/modals/dialogModal.svelte';
	import { stores } from '$lib/store/index.svelte';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { DialogContent } from '@cariva/ui/components/ui/dialog/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import CircleCheckBigIcon from '@lucide/svelte/icons/circle-check-big';

	const { AppStore } = stores;
</script>

<DialogModal isOpen={AppStore.isOpen.DYNAMIC} closeModal={AppStore.dynamicModal.btnFn}>
	<DialogContent showCloseButton={false}>
		<div class="mx-auto flex w-full flex-col space-y-6 p-4">
			<div class="flex flex-col items-center justify-center space-y-4">
				<div class="flex w-full items-center justify-center">
					<CircleCheckBigIcon size={60} class="text-green-800" />
				</div>
				<div class="flex flex-col items-center justify-center space-y-2 text-center">
					<Heading level="h2">{AppStore.dynamicModal.title}</Heading>
					{#if AppStore.dynamicModal.description}
						<Paragraph class="text-center text-neutral-500!">
							{AppStore.dynamicModal.description}
						</Paragraph>
					{/if}
				</div>
			</div>

			<Button class="w-full" size="lg" onclick={() => AppStore.dynamicModal.btnFn()}>
				{AppStore.dynamicModal.btnText}
			</Button>
		</div>
	</DialogContent>
</DialogModal>
