<script lang="ts">
	import {
		Card,
		CardHeader,
		CardTitle,
		CardContent,
		CardFooter
	} from '@cariva/ui/components/ui/card/index.js';
	import { Heading } from '@cariva/ui/components/ui/typography/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import { stores } from '$lib/store/index.svelte';
	import { ccyFormatter } from '$lib/utils/numbers';
	import Building2Icon from '@lucide/svelte/icons/building-2';
	import CalendarDaysIcon from '@lucide/svelte/icons/calendar-days';
	import UsersIcon from '@lucide/svelte/icons/users';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { SUBSCRIPTION } from '$lib/constants/api';
	import { AppModals } from '$lib/store/app/modalTypes';

	let { AppStore } = stores;
	let { uid, plan, is_active, amount, max_branches, max_users, duration_days }: SubscriptionItem =
		$props();

	const isThisLoading = $derived(
		AppStore.isLoading.editSubPlan && AppStore.loadingSubPlanUid === uid
	);
	const queryClient = useQueryClient();
	const handleUpdate = () => {
		queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === SUBSCRIPTION.GET });
	};
</script>

<Card class="flex flex-col gap-0 overflow-hidden transition-shadow hover:shadow-md">
	<CardHeader class="flex flex-row items-center justify-between gap-2 border-b">
		<div class="flex items-center justify-start gap-2">
			<CardTitle class="text-base font-semibold">{plan}</CardTitle>
			<Badge variant={is_active ? 'default' : 'destructive'}>
				{is_active ? 'Active' : 'Inactive'}
			</Badge>
		</div>
	</CardHeader>

	<CardContent class="flex flex-col gap-3 py-3">
		<div class="grid grid-cols-3 gap-2 text-center">
			<div class="flex flex-col items-center gap-1">
				<Building2Icon class="size-3 text-muted-foreground" />
				<span class="text-xl font-medium">{max_branches}</span>
				<span class="text-xs text-muted-foreground">branch(es)</span>
			</div>
			<div class="flex flex-col items-center gap-1">
				<UsersIcon class="size-3 text-muted-foreground" />
				<span class="text-xl font-medium">{max_users}</span>
				<span class="text-xs text-muted-foreground">users</span>
			</div>
			<div class="flex flex-col items-center gap-1">
				<CalendarDaysIcon class="size-3 text-muted-foreground" />
				<span class="text-xl font-medium">{duration_days}</span>
				<span class="text-xs text-muted-foreground">days</span>
			</div>
		</div>

		<div class="flex items-baseline justify-start gap-2 border-t pt-3">
			<Heading class="text-primary!">
				{Number(amount) === 0 ? 'Free' : ccyFormatter(Number(amount))}
			</Heading>
		</div>
	</CardContent>

	<CardFooter class="flex items-center justify-end gap-2 border-t">
		{#if is_active}
			<Button
				size="sm"
				variant="secondary"
				disabled={isThisLoading}
				onclick={() => AppStore.updateSubPlan(uid, { is_active: 'false' }, handleUpdate)}
			>
				{isThisLoading ? 'Deactivating' : 'Deactivate'}
			</Button>
		{:else}
			<Button
				size="sm"
				disabled={isThisLoading}
				onclick={() => AppStore.updateSubPlan(uid, { is_active: 'true' }, handleUpdate)}
			>
				{isThisLoading ? 'Activating' : 'Activate'}
			</Button>
		{/if}

		<Button
			size="sm"
			variant="warning"
			disabled={isThisLoading}
			onclick={() =>
				AppStore.toggleModals({
					name: AppModals.PLANS_FORM_MODAL,
					open: true,
					plan_uid: JSON.stringify({
						uid,
						plan,
						is_active,
						amount,
						max_branches,
						max_users,
						duration_days
					})
				})}>Edit Limits</Button
		>
	</CardFooter>
</Card>
