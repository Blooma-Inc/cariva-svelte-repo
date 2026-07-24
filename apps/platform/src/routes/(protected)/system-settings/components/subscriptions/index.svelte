<script lang="ts">
	import { Heading } from '@cariva/ui/components/ui/typography/index.js';
	import Plans from './plans.svelte';
	import PaymentsConfigs from './payments-configs.svelte';
</script>

<div class="flex flex-col gap-4">
	<div>
		<Heading level="h3">Subscription</Heading>
	</div>
	<Plans />
	<PaymentsConfigs />
</div>
