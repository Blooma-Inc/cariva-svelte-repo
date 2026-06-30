<script lang="ts">
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import type { IStatsCardProps } from './components/stats-card.svelte';
	import { Building2Icon, DatabaseIcon, UserPlusIcon, UsersIcon } from '@cariva/ui/icons';
	import StatsCard from './components/stats-card.svelte';

	const stats: Array<IStatsCardProps> = [
		{
			icon: Building2Icon,
			title: 'Tenants',
			description: 'Hospitals provisioned on the platform.',
			stat: 34
		},
		{
			icon: UsersIcon,
			title: 'Active users',
			description: 'Users who signed in within the last 30 days.',
			stat: 2893
		},
		{
			icon: UserPlusIcon,
			title: 'Registered Patients',
			description: 'Total patient records across all tenants.',
			stat: 12998
		},
		{
			icon: DatabaseIcon,
			title: 'Platform storage',
			description: 'Total storage consumed across the platform.',
			stat: '60%'
		}
	];
</script>

<div class="flex w-full flex-col gap-4">
	<div>
		<Heading>Platform Dashboard</Heading>
		<Paragraph size="sm" muted
			>Monitor operational activity, tenant growth, and system-wide alerts.</Paragraph
		>
	</div>

	<div class="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
		{#each stats as stat (stat.title)}
			<StatsCard {...stat} />
		{/each}
	</div>
</div>
