<script lang="ts">
	import DialogModal from '$lib/atoms/modals/dialogModal.svelte';
	import { AppModals } from '$lib/store/app/modalTypes';
	import { stores } from '$lib/store/index.svelte';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { DialogContent, DialogHeader } from '@cariva/ui/components/ui/dialog/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import DoorOpenIcon from '@lucide/svelte/icons/door-open';

	const { AppStore } = stores;

	const handleClose = () => {
		AppStore.toggleModals({ name: AppModals.DONE, open: false });
	};
</script>

<DialogModal isOpen={AppStore.isOpen.DONE} closeModal={handleClose}>
	<DialogContent>
		<DialogHeader>
			<div class="my-14 flex w-full flex-col items-center justify-center gap-8 text-center">
				<DoorOpenIcon className="h-5 w-5" />
				<Heading class="text-center">{AppStore.doneModal.text ?? 'Done!'}</Heading>
				<Paragraph>{AppStore.doneModal.subText}</Paragraph>
				<Button onclick={handleClose}>
					{AppStore.doneModal.ctaText ?? 'Got it'}
				</Button>
			</div>
		</DialogHeader>
	</DialogContent>
</DialogModal>
