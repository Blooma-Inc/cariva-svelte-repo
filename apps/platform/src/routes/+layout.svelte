<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ModalBank from '$lib/components/ModalBank.svelte';
	import TanstackQueryProvider from '$lib/requests/query.tanstack.svelte';
	import { Toaster } from 'svelte-sonner';
	import NoNetworkPrompt from '$lib/components/noNetworkPrompt.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<NoNetworkPrompt />
<Toaster position="top-right" />
<TanstackQueryProvider>
	{@render children()}
	<ModalBank />
</TanstackQueryProvider>
