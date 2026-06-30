<script lang="ts">
	import NavUser from './nav-user.svelte';
	import { SidebarTrigger } from '@cariva/ui/components/ui/sidebar/index.js';
</script>

<header class="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
	<SidebarTrigger class="-ms-1" />
	<div class="flex w-full items-center justify-end">
		<div class="h-fit">
			<NavUser />
		</div>
	</div>
</header>
