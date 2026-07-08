<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Tabs, TabsList, TabsContent, TabsTrigger } from '@cariva/ui/components/ui/tabs/index.js';
	import General from './components/general/index.svelte';
	import Security from './components/security/index.svelte';
	import Subscriptions from './components/subscriptions/index.svelte';
	import Email from './components/email/index.svelte';
	import Integrations from './components/integrations/index.svelte';
	import Advanced from './components/advanced/index.svelte';
	import { useScrollActiveTab } from '$lib/hooks/app/useScrollIntoView.svelte';

	const tabs = [
		{ tab: 'General', value: 'general', Content: General },
		{ tab: 'Security', value: 'security', Content: Security },
		{ tab: 'Subscriptions', value: 'subscriptions', Content: Subscriptions },
		{ tab: 'Email', value: 'email', Content: Email },
		{ tab: 'Integrations', value: 'integrations', Content: Integrations },
		{ tab: 'Advanced', value: 'advanced', Content: Advanced }
	];

	let tabValue = $state(page.url.searchParams.get('tab') ?? 'general');

	let refs = $state<Record<string, HTMLElement | null>>(
		Object.fromEntries(tabs.map(({ value }) => [value, null]))
	);

	useScrollActiveTab<string>({
		activeTab: () => tabValue,
		fallback: 'general',
		refs
	});

	function handleTabChange(value: string) {
		tabValue = value;
		const url = new URL(page.url);
		url.searchParams.set('tab', value);
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(url, { replaceState: true, keepFocus: true, noScroll: true });
	}
</script>

<div class="flex w-full flex-col gap-4">
	<div>
		<Heading>System settings</Heading>
		<Paragraph size="sm" muted>Platform-wide configuration and security policies</Paragraph>
	</div>

	<Tabs value={tabValue} onValueChange={handleTabChange} class="flex w-full flex-col space-y-4">
		<TabsList
			class="scrollbar-hide sticky top-20 left-0 z-20 flex w-full items-center justify-start gap-1 overflow-x-auto backdrop-blur lg:w-fit"
		>
			{#each tabs as { tab, value } (value)}
				<TabsTrigger bind:ref={refs[value]} {value}>{tab}</TabsTrigger>
			{/each}
		</TabsList>

		{#each tabs as { Content, value } (value)}
			<TabsContent {value}>
				<Content />
			</TabsContent>
		{/each}
	</Tabs>
</div>
