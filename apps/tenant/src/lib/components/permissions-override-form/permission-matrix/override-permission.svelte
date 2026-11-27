<script lang="ts" module>
	interface OverridePermissionProps {
		override: UserPermissionOverrideItem;
	}
</script>

<script lang="ts">
	import { ROLES } from '$lib/constants/api';

	import { delRemoveOverrideUserPermission } from '$lib/requests/permissions';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import CircleXIcon from '@lucide/svelte/icons/circle-x';
	import LoaderCircleIcon from '@lucide/svelte/icons/circle';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';

	let { override }: OverridePermissionProps = $props();
	const queryClient = useQueryClient();

	const mutateQuery = createMutation(() => ({
		mutationFn: (uid: string) => delRemoveOverrideUserPermission(uid),
		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: (query) => query.queryKey[0] === ROLES.ALL
			});
		}
	}));
</script>

<Button
	size="xs"
	variant={override.is_granted ? 'default' : 'destructive'}
	disabled={mutateQuery.isPending}
>
	{override.permission.code}
	{#if mutateQuery.isPending}
		<LoaderCircleIcon class="size-3 animate-spin" />
	{:else}
		<button
			class="cursor-pointer transition-all duration-150 hover:scale-125"
			onclick={() => mutateQuery.mutate(override.uid)}
		>
			<CircleXIcon class="size-3" />
		</button>
	{/if}
</Button>
