<script>
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import NewPatientForm from './components/new-patient-form.svelte';
	// import RegistrySearch from './components/registry-search.svelte';
	import RecentRegistration from '../components/recent-registration.svelte';
</script>

<section class="flex w-full min-w-0 flex-col gap-4">
	<div>
		<Heading>Register patient</Heading>
		<Paragraph size="sm" muted>Search the registry before creating a new record.</Paragraph>
	</div>

	<div class="grid grid-cols-1 gap-3 md:grid-cols-[.7fr_.3fr]">
		<RecentRegistration />
		<div class="flex flex-col gap-3">
			<!-- <RegistrySearch /> -->
			<NewPatientForm />
		</div>
	</div>
</section>
