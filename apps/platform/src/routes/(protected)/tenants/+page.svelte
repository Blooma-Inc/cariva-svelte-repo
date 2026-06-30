<script lang="ts">
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import NoTenants from './components/no-tenants.svelte';
</script>

<div class="flex w-full flex-col gap-4">
	<div>
		<Heading>Tenants</Heading>
		<Paragraph size="sm" muted
			>Manage hospitals, subscriptions, and operational access across the platform.</Paragraph
		>
	</div>

	<NoTenants />
</div>
