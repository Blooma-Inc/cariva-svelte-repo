<script lang="ts">
	import { Paragraph, Heading } from '@cariva/ui/components/ui/typography/index.js';
	import { stores } from '$lib/store/index.svelte';

	let { AuthStore } = stores;
</script>

<section class="flex w-full flex-col gap-4">
	<div class="grid flex-1 text-start">
		<Heading level="h3" class="truncate">Hello, {AuthStore.user.first_name}</Heading>
		<Paragraph muted class="truncate">Here is your desk for today.</Paragraph>
	</div>
</section>
