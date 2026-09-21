<script lang="ts">
	import DialogModal from '$lib/atoms/parent-modals/dialogModal.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { stores } from '$lib/store/index.svelte';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import LockKeyHoleOpenIcon from '@lucide/svelte/icons/lock-keyhole-open';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import { DialogContent } from '@cariva/ui/components/ui/dialog/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';

	const { AppStore, StaffStore } = stores;

	const handleClose = () => {
		AppStore.toggleModals({ name: AppModals.RESET_USER_PASSWORD_MODAL, open: false });
	};

	const user = $derived(JSON.parse(AppStore.userModal.user_uid) as StaffItem);
</script>

<DialogModal isOpen={AppStore.isOpen.RESET_USER_PASSWORD_MODAL} closeModal={handleClose}>
	<DialogContent showCloseButton={false} onInteractOutside={(e) => e.preventDefault()}>
		<div class="flex flex-col items-center justify-center gap-3 text-center">
			<div class="flex flex-col items-center justify-center gap-1">
				<div class="rounded-full bg-warning/25 p-3">
					<div class="rounded-full bg-warning/30 p-2">
						<CircleAlertIcon class="text-warning" />
					</div>
				</div>
				<Heading level="h2" class="text-warning!">Reset User Password</Heading>
				<Paragraph size="sm" muted>You're about to reset the password for</Paragraph>
				<div
					class="flex w-fit items-center justify-start gap-2 rounded-xl border bg-neutral-50 p-2"
				>
					<Paragraph size="sm" muted>{user.email}</Paragraph>
					<Badge>{user.user_roles[0].role.name}</Badge>
				</div>
			</div>
			<Paragraph size="sm" muted>
				A temporary password will be generated and sent to their email. They'll be required to
				change it on next login.
			</Paragraph>
		</div>

		<div class="flex flex-col items-center justify-between gap-2 md:flex-row">
			<Button
				class="w-full md:w-1/2"
				size="lg"
				variant="secondary"
				disabled={StaffStore.loaders.isStaffLoading}
				onclick={handleClose}>Cancel</Button
			>
			<Button
				class="w-full md:w-1/2"
				size="lg"
				variant="info"
				disabled={StaffStore.loaders.isStaffLoading}
				isLoading={StaffStore.loaders.isStaffLoading}
				onclick={() => {
					StaffStore.resetStaffPassword(user.uid, handleClose);
				}}
			>
				<LockKeyHoleOpenIcon class="size-3" />
				Reset Password
			</Button>
		</div>
	</DialogContent>
</DialogModal>
