<script lang="ts">
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Card, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { stores } from '$lib/store/index.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';

	const { PermissionStore } = stores;
</script>

<Card>
	<CardContent>
		<div class="flex h-40 flex-col items-center justify-center gap-3 text-center">
			<div
				class="mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-1 text-center"
			>
				<Heading level="h3">No Patient yet</Heading>
				<Paragraph size="sm" muted
					>You haven't added any patient to your hospital on the platform. Click "Register Patient"
					to add your first patient.</Paragraph
				>
			</div>

			{#if PermissionStore.can(PERMISSIONS.PATIENT_REGISTER)}
				<Button size="lg">
					<PlusIcon class="size-3" />
					Register patient
				</Button>
			{/if}
		</div>
	</CardContent>
</Card>
