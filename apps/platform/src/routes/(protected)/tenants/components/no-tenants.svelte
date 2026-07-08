<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Card, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { PlusIcon } from '@cariva/ui/icons';
	import ROUTES from '$lib/configs/routes.svelte';
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

			<Button size="lg" onclick={() => goto(resolve(ROUTES.NEW_TENANT.path))}>
				<PlusIcon class="size-3" />
				Provision New Tenant
			</Button>
		</div>
	</CardContent>
</Card>
