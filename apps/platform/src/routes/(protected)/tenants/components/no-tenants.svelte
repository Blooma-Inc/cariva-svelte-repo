<script lang="ts">
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Card, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { PlusIcon } from '@cariva/ui/icons';
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

			<Button size="lg" onclick={() => window.location.assign('/tenants/new')}>
				<PlusIcon class="size-3" />
				Provision New Tenant
			</Button>
		</div>
	</CardContent>
</Card>
