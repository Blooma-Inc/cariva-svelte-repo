<script lang="ts">
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { Card, CardContent, CardHeader, CardTitle } from '@cariva/ui/components/ui/card/index.js';
	import { useFetchSubscriptions } from '$lib/hooks/subscriptions/use-fetch-subscriptions';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import PlanItem from './plan-item.svelte';

	const { AppStore } = stores;
	const query = useFetchSubscriptions();
</script>

<Card>
	<CardHeader class="border-b">
		<div class="flex w-full items-center justify-between">
			<CardTitle>Available Plans</CardTitle>
			<Button
				size="sm"
				onclick={() =>
					AppStore.toggleModals({ open: true, name: AppModals.PLANS_FORM_MODAL, plan_uid: '' })}
			>
				<PlusIcon class="size-3" />
				New plan
			</Button>
		</div>
	</CardHeader>

	<CardContent>
		{#if query.status === 'pending'}
			<p>Fetching available plans</p>
		{/if}

		{#if query.status === 'success' && query.data}
			{#if query.data.data.length === 0}
				<div class="flex h-40 flex-col items-center justify-center gap-3 text-center">
					<div
						class="mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-1 text-center"
					>
						<Heading level="h3">No Plans yet</Heading>
						<Paragraph size="sm" muted
							>You haven't added any subscription plans on the platform. Click "Add New Plan" to
							create your first plan.</Paragraph
						>
					</div>

					{#if query.data.data.length > 0}
						<Button
							size="lg"
							onclick={() =>
								AppStore.toggleModals({
									open: true,
									name: AppModals.PLANS_FORM_MODAL,
									plan_uid: ''
								})}
						>
							<PlusIcon class="size-3" />
							Add subscription plan
						</Button>
					{/if}
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_1fr_1fr]">
					{#each query.data.data as plan (plan.uid)}
						<PlanItem {...plan} />
					{/each}
				</div>
			{/if}
		{/if}
	</CardContent>
</Card>
