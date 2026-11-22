<script lang="ts">
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Card, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { stores } from '$lib/store/index.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { AppModals } from '$lib/store/app/modal-types';

	const { AppStore, PermissionStore } = stores;
</script>

<Card>
	<CardContent>
		<div class="flex h-40 flex-col items-center justify-center gap-3 text-center">
			<div
				class="mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-1 text-center"
			>
				<Heading level="h3">No Tenant yet</Heading>
				<Paragraph size="sm" muted
					>You haven't provisioned any hospitals on the platform. Click "Provision New Tenant" to
					onboard your first hospital.</Paragraph
				>
			</div>

			<Button
				disabled={!PermissionStore.can(PERMISSIONS.TENANTS_CREATE)}
				size="lg"
				onclick={() =>
					AppStore.toggleModals({ open: true, name: AppModals.TENANT_FORM_MODAL, tenant_uid: '' })}
			>
				<PlusIcon class="size-3" />
				Provision New Tenant
			</Button>
		</div>
	</CardContent>
</Card>
