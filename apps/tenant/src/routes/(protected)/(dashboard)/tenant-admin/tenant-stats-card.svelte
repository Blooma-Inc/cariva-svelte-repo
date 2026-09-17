<script lang="ts" module>
	import { type LucideIcon } from '@lucide/svelte';

	export interface IStatsCardProps {
		icon: LucideIcon;
		title: string;
		stat: string | number;
		description: string;
		tag: keyof TenantDashboardStats;
	}
</script>

<script lang="ts">
	import { Heading } from '@cariva/ui/components/ui/typography/index.js';
	import {
		Card,
		CardTitle,
		CardDescription,
		CardContent
	} from '@cariva/ui/components/ui/card/index.js';
	import { cn } from '@cariva/ui/utils';

	const { icon: Icon, title, stat, description, tag }: IStatsCardProps = $props();
	const value = $derived(typeof stat === 'string' ? stat : stat.toLocaleString('en-US'));
</script>

<Card class="flex flex-col gap-3 ring-0">
	<CardContent class="relative">
		<div
			class={cn(
				'absolute top-0 left-0 h-full w-1 rounded-r-lg',
				tag === 'branches_count' && 'bg-primary',
				tag === 'staff_count' && 'bg-sky-500',
				tag === 'patients_count' && 'bg-amber-500'
			)}
		></div>
		<CardTitle>{title}</CardTitle>
		<div class="flex items-center justify-between">
			<Heading level="h1" class="font-light!">{value}</Heading>
			<div
				class={cn(
					'rounded p-3',
					tag === 'branches_count' && 'bg-primary/20 text-primary',
					tag === 'staff_count' && 'bg-sky-500/20 text-sky-500',
					tag === 'patients_count' && 'bg-amber-500/20 text-amber-500'
				)}
			>
				<Icon />
			</div>
		</div>
		<CardDescription>{description}</CardDescription>
	</CardContent>
</Card>
