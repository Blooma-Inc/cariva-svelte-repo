<script lang="ts">
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import NewPatientForm from './register/components/new-patient-form.svelte';
	import RecentRegistration from './components/recent-registration.svelte';
	import { stores } from '$lib/store/index.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { cn } from '@cariva/ui/utils';

	const { PermissionStore } = stores;
	const canRegister = $derived(PermissionStore.can(PERMISSIONS.PATIENT_REGISTER));
</script>

<div class="flex w-full min-w-0 flex-col gap-4">
	<div>
		<Heading>Patient</Heading>
		<Paragraph size="sm" muted>
			Manage registered Patients, and their details access across the platform.
		</Paragraph>
	</div>

	<div class={cn('grid grid-cols-1', canRegister ? 'gap-3 md:grid-cols-[.7fr_.3fr]' : '')}>
		<RecentRegistration />

		{#if canRegister}
			<div class="flex flex-col gap-3">
				<NewPatientForm />
			</div>
		{/if}
	</div>
</div>
