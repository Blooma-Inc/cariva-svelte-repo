<script lang="ts">
	import { Heading } from '@cariva/ui/components/ui/typography/index.js';
	import SecuritySettings from './components/security-settings.svelte';
	import UserProfile from './components/user-profile.svelte';
	import MySchedule from './components/my-schedule.svelte';
	import { stores } from '$lib/store/index.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';
</script>

<div class="flex w-full min-w-0 flex-col gap-4">
	<div>
		<Heading>Profile Settings</Heading>
	</div>
	<div class="auto-grid">
		<UserProfile />
		<SecuritySettings />
	</div>
	{#if stores.PermissionStore.can(PERMISSIONS.PRACTITIONER_AVAILABILITY_READ)}<MySchedule />{/if}
</div>
