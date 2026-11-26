<script lang="ts">
	import { useFetchTenantStats } from '$lib/hooks/tenant/use-fetch-tenant-details';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardContent,
		CardFooter
	} from '@cariva/ui/components/ui/card/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import BuildingIcon from '@lucide/svelte/icons/building-2';
	import UsersIcon from '@lucide/svelte/icons/users';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import SectionError from './section-error.svelte';
	let { tenantUid, showBranches }: { tenantUid: string; showBranches: () => void } = $props();
	const query = useFetchTenantStats(() => tenantUid);
	const cards = $derived([
		{
			label: 'Branches',
			used: query.data?.branches,
			max: query.data?.max_branches,
			Icon: BuildingIcon
		},
		{ label: 'Users', used: query.data?.users, max: query.data?.max_users, Icon: UsersIcon }
	]);
</script>

{#if query.isError}
	<SectionError message="Couldn't load tenant usage." retry={() => query.refetch()} />
{:else}
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-busy={query.isPending}>
		{#each cards as { label, used, max, Icon } (label)}
			<Card>
				<CardHeader
					><CardTitle class="flex items-center gap-2"><Icon class="size-5" />{label}</CardTitle
					></CardHeader
				>
				<CardContent class="flex flex-col gap-2">
					{#if query.isPending}
						<Skeleton class="h-9 w-36" /><Skeleton class="h-4 w-28" />
					{:else}
						<Paragraph class="text-3xl! font-semibold">{used ?? 0} / {max ?? 0}</Paragraph>
						<Paragraph size="sm" muted
							>{max && used !== undefined
								? `${Math.round((used / max) * 100)}% of plan limit used`
								: 'Usage percentage unavailable'}</Paragraph
						>
					{/if}
				</CardContent>
				{#if label === 'Branches'}<CardFooter
						><Button variant="link" class="px-0" onclick={showBranches}
							>View all branches<ArrowRightIcon class="size-4" /></Button
						></CardFooter
					>{/if}
			</Card>
		{/each}
	</div>
{/if}
