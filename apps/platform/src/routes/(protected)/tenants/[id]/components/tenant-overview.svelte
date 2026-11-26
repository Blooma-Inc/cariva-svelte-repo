<script lang="ts">
	import { Item, ItemHeader, ItemTitle, ItemContent } from '@cariva/ui/components/ui/item/index.js';
	import { formatDate } from '$lib/utils/date';
	import { ccyFormatter } from '$lib/utils/numbers';
	import { toTitleCase } from '$lib/utils/strings';
	import DetailField from './detail-field.svelte';
	let { tenant, loading = false }: { tenant?: PlatformTenantItem; loading?: boolean } = $props();
	const hospitalFields = $derived([
		['Organisation name', tenant?.name],
		['Type', tenant ? toTitleCase(tenant.hospital_type) : null],
		['Main branch address', tenant?.main_branch?.address],
		['City', tenant?.main_branch?.city],
		['State', tenant?.main_branch?.state],
		['Country', tenant?.main_branch?.country],
		['Registration number', tenant?.registration_number],
		['Date established', tenant ? formatDate(tenant.date_established) : null],
		['Email', tenant?.email],
		['Website', tenant?.website_url],
		['Onboarded', tenant?.onboarded_at ? formatDate(tenant.onboarded_at) : 'Not onboarded']
	]);
	const subscription = $derived(tenant?.latest_subscription);
	const plan = $derived(subscription?.subscription_plan);
</script>

<div class="flex min-w-0 flex-col gap-4" aria-busy={loading}>
	<Item variant="outline">
		<ItemHeader class="border-b pb-3"><ItemTitle>Hospital Details</ItemTitle></ItemHeader>
		<ItemContent class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each hospitalFields as [label, value] (label)}
				<DetailField label={label ?? ''} {value} {loading} />
			{/each}
		</ItemContent>
	</Item>
	<Item variant="outline">
		<ItemHeader class="border-b pb-3"><ItemTitle>Current Subscription</ItemTitle></ItemHeader>
		<ItemContent class="gap-4">
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<DetailField label="Plan" value={plan?.plan} {loading} />
				<div class="flex flex-col gap-1">
					<DetailField
						label="Status"
						value={subscription ? toTitleCase(subscription.status) : undefined}
						{loading}
					/>
				</div>
				<DetailField
					label="Expires"
					value={subscription?.expires_at ? formatDate(subscription.expires_at) : 'Not specified'}
					{loading}
				/>
			</div>
			<div class="grid grid-cols-1 gap-4 rounded-lg bg-primary/5 p-4 sm:grid-cols-2">
				<div class="flex flex-col gap-3">
					<DetailField label="Branch limit" value={plan?.max_branches} {loading} />
					<DetailField label="User limit" value={plan?.max_users} {loading} />
				</div>
				<div class="flex flex-col gap-3">
					<DetailField
						label="Plan duration"
						value={plan ? `${plan.duration_days} days` : undefined}
						{loading}
					/>
					<DetailField
						label="Started"
						value={subscription?.starts_at ? formatDate(subscription.starts_at) : 'Not started'}
						{loading}
					/>
					<DetailField
						label="Plan amount"
						value={plan ? ccyFormatter(Number(plan.amount)) : undefined}
						{loading}
					/>
				</div>
			</div>
		</ItemContent>
	</Item>
</div>
