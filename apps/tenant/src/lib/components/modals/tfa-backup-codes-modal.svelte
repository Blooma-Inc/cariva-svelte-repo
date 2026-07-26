<script lang="ts">
	import DialogModal from '$lib/atoms/parent-modals/dialogModal.svelte';
	import { stores } from '$lib/store/index.svelte';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Card, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { DialogContent, DialogFooter } from '@cariva/ui/components/ui/dialog/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import DownloadIcon from '@lucide/svelte/icons/download';

	const { AppStore } = stores;

	const handleClose = () => {
		AppStore.toggleModals({});
	};

	const codeArr = $derived.by(() => {
		return AppStore.tfaModal.codes.split(' ');
	});

	const handleCodeDownload = () => {
		const content = AppStore.tfaModal.codes;

		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = 'backup-codes.txt';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

		URL.revokeObjectURL(url);
	};
</script>

<DialogModal isOpen={AppStore.isOpen.TFA_BACKUP_CODES} closeModal={handleClose}>
	<DialogContent
		showCloseButton={false}
		onEscapeKeydown={(e) => e.preventDefault()}
		onInteractOutside={(e) => e.preventDefault()}
	>
		<div class="flex flex-col items-center justify-center gap-3 rounded-xl">
			<div class="text-center">
				<Heading level="h2" class="text-primary!">Set-up successful</Heading>
				<Paragraph class="text-neutral-500!">Save your backup codes</Paragraph>
			</div>

			<Paragraph size="sm" class="text-center text-neutral-500!">
				Store these recovery codes somewhere safe. Each code can only be used once.
			</Paragraph>

			<Card class="mx-auto w-full max-w-3/4 border-none! bg-neutral-50!">
				<CardContent class="w-full py-4">
					<div class="grid w-full grid-cols-2 gap-3">
						{#each codeArr as code, index (index)}
							<div class="flex items-center justify-center gap-2 text-center">
								<Heading level="h2" class="text-center font-light! text-neutral-700!">
									{code}
								</Heading>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>

			<Badge variant="warning"
				>You will not be able to view these codes again after completing setup.</Badge
			>

			<DialogFooter class="pt-3">
				<Button size="lg" variant="info" onclick={handleCodeDownload}>
					<DownloadIcon class="size-3" /> Download
				</Button>
				<Button size="lg" onclick={handleClose}>
					<CircleCheckIcon class="size-3" /> Done
				</Button>
			</DialogFooter>
		</div>
	</DialogContent>
</DialogModal>
