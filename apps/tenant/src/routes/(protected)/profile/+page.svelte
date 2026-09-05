<script lang="ts">
	import { Heading } from '@cariva/ui/components/ui/typography/index.js';
	import SecuritySettings from './components/security-settings.svelte';
	import UserProfile from './components/user-profile.svelte';
</script>

<div class="flex w-full min-w-0 flex-col gap-4">
	<div>
		<Heading>Profile Settings</Heading>
	</div>
	<div class="auto-grid">
		<UserProfile />
		<SecuritySettings />
	</div>
</div>
