<script lang="ts">
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { SidebarTrigger } from '@cariva/ui/components/ui/sidebar/index.js';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { stores } from '$lib/store/index.svelte';
	import type { Role } from '$lib/configs/roles';
	import { snakeCaseToSentenceCase } from '$lib/utils/strings';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';

	let { AuthStore } = stores;
	const role = $derived.by(() => {
		if (AuthStore.user.user_roles && AuthStore.active_role !== null) {
			return AuthStore.user.user_roles.at(AuthStore.active_role)?.role.name as Role;
		}
		return '';
	});
</script>

<header class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
	<SidebarTrigger class="-ms-1" />

	<div class="flex w-full items-center justify-end">
		<div class="h-fit">
			<Button variant="ghost"
				><Badge class="text-[10px]">{snakeCaseToSentenceCase(role)}</Badge>
				<ChevronRightIcon class="size-3" /></Button
			>
		</div>
	</div>
</header>
