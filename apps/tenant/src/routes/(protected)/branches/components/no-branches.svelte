<script lang="ts">
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Card, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';

	const { AppStore } = stores;
</script>

<Card>
	<CardContent>
		<div class="flex h-40 flex-col items-center justify-center gap-3 text-center">
			<div
				class="mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-1 text-center"
			>
				<Heading level="h3">No Brances yet</Heading>
				<Paragraph size="sm" muted
					>You haven't created any branch for your hospital on the platform. Click "Create New
					Branch" to create your first branch.</Paragraph
				>
			</div>

			<Button
				size="lg"
				onclick={() =>
					AppStore.toggleModals({ open: true, name: AppModals.BRANCH_FORM_MODAL, branch_uid: '' })}
			>
				<PlusIcon class="size-3" />
				Create New Branch
			</Button>
		</div>
	</CardContent>
</Card>
