<script lang="ts" module>
	/* eslint-disable no-unused-vars */
	/* eslint-disable @typescript-eslint/no-unused-vars */
	export interface PatientActionsProps {
		linkedTenantPatient: LinkedTenantPatientItem;
	}
</script>

<script lang="ts">
	import EyeIcon from '@lucide/svelte/icons/eye';
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import * as DropdownMenu from '@cariva/ui/components/ui/dropdown-menu/index.js';
	import { stores } from '$lib/store/index.svelte';

	let { linkedTenantPatient }: PatientActionsProps = $props();
	let { AppStore } = stores;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="secondary" size="icon">
				<EllipsisVerticalIcon class="size-3" />
				<span class="sr-only">Open patient actions</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Content align="end" class="w-fit">
		<DropdownMenu.Item>
			<EyeIcon class="size-3" />
			View Details
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
