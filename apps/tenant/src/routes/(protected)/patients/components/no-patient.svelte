<script lang="ts">
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	import UsersRound from '@lucide/svelte/icons/users-round';
</script>

<EmptyState
	title="No patients yet"
	description="Patient records will appear here once patients are registered."
	icon={UsersRound}
/>
