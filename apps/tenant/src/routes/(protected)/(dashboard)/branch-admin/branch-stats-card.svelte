<script lang="ts" module>
	import { type LucideIcon } from '@lucide/svelte';

	export interface IBranchAdminDashboardStatsCardProps {
		icon: LucideIcon;
		title: string;
		stat: string | number;
		description: string;
		tag: keyof BranchDashboardStats;
		meta: {
			stat: number;
			statDescription: string;
			routeId: string;
			routeText: string;
		};
	}
</script>

<script lang="ts">
	import { Heading } from '@cariva/ui/components/ui/typography/index.js';
	import {
		Card,
		CardTitle,
		CardDescription,
		CardContent,
		CardFooter
	} from '@cariva/ui/components/ui/card/index.js';
	import { cn } from '@cariva/ui/utils';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { getRoute } from '$lib/configs/routes.svelte';

	const {
		icon: Icon,
		title,
		stat,
		description,
		tag,
		meta
	}: IBranchAdminDashboardStatsCardProps = $props();
	const value = $derived(typeof stat === 'string' ? stat : stat.toLocaleString('en-US'));
</script>

<Card class="flex flex-col ring-0">
	<CardContent class="">
		<div class="flex justify-start gap-2 border-b border-neutral-100 pb-3">
			<div
				class={cn(
					'h-fit rounded-lg p-3',
					tag === 'beds' && 'bg-primary/20 text-primary',
					tag === 'staff' && 'bg-sky-500/20 text-sky-500',
					tag === 'patients' && 'bg-amber-500/20 text-amber-500'
				)}
			>
				<Icon />
			</div>

			<div>
				<CardTitle>{title}</CardTitle>

				<div class="flex items-center gap-1">
					<Heading level="h1" class="font-light!">{value}</Heading>
					<CardDescription>{description}</CardDescription>
				</div>
			</div>
		</div>
	</CardContent>

	<CardFooter>
		<div class="flex w-full items-center justify-between gap-2">
			<div class="flex items-center justify-start gap-1">
				<div
					class={cn(
						'size-2 rounded-full',
						tag === 'beds' && 'bg-primary',
						tag === 'staff' && 'bg-sky-500',
						tag === 'patients' && 'bg-amber-500'
					)}
				></div>
				<CardDescription>{meta.stat} {meta.statDescription}</CardDescription>
			</div>

			<Button size="xs" variant="link" class="underline" href={getRoute(meta.routeId)?.resolve()}
				>{meta.routeText}</Button
			>
		</div>
	</CardFooter>
</Card>
