<script lang="ts">
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Card, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { PERMISSIONS } from '$lib/configs/permissions';

	const { AppStore, PermissionStore } = stores;
</script>

<Card>
	<CardContent>
		<div class="flex h-40 flex-col items-center justify-center gap-3 text-center">
			<div
				class="mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-1 text-center"
			>
				<Heading level="h3">No Staff yet</Heading>
				<Paragraph size="sm" muted
					>You haven't added any staff to your hospital on the platform. Click "Add New Staff" to
					add your first staff.</Paragraph
				>
			</div>

			{#if PermissionStore.can(PERMISSIONS.STAFF_CREATE)}
				<Button
					size="lg"
					onclick={() =>
						AppStore.toggleModals({ open: true, name: AppModals.STAFF_FORM_MODAL, user_uid: '' })}
				>
					<PlusIcon class="size-3" />
					Add New Staff
				</Button>
			{/if}
		</div>
	</CardContent>
</Card>
