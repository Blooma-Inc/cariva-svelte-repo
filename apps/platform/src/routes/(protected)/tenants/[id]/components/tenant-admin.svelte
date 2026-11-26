<script lang="ts">
	import { useFetchTenantAdmin } from '$lib/hooks/tenant/use-fetch-tenant-admin.svelte';
	import { Item, ItemHeader, ItemTitle, ItemContent } from '@cariva/ui/components/ui/item/index.js';
	import { Avatar, AvatarFallback, AvatarImage } from '@cariva/ui/components/ui/avatar/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { getInitials } from '$lib/utils/strings';
	import { formatDateTime } from '$lib/utils/date';
	import DetailField from './detail-field.svelte';
	import SectionError from './section-error.svelte';
	let { tenantUid }: { tenantUid: string } = $props();
	const query = useFetchTenantAdmin(() => tenantUid);
	const admin = $derived(query.data);
	const name = $derived(
		admin
			? [admin.designation, admin.first_name, admin.middle_name, admin.last_name]
					.filter(Boolean)
					.join(' ')
			: ''
	);
</script>

<Item
	variant="outline"
	class="h-full flex-col items-stretch bg-primary/5"
	aria-busy={query.isLoading}
>
	<ItemHeader class="basis-auto border-b pb-3"><ItemTitle>Tenant Admin</ItemTitle></ItemHeader>
	<ItemContent class="flex-none gap-4">
		{#if query.status === 'error'}
			<SectionError message="Couldn't load the tenant administrator." retry={query.refetch} />
		{:else}
			<div class="flex items-center gap-3">
				{#if query.isLoading}<Skeleton class="size-14 shrink-0 rounded-xl" />{:else}
					<Avatar class="size-14 rounded-xl">
						<AvatarImage src={admin?.profile_photo_url ?? ''} alt={name} />
						<AvatarFallback class="rounded-xl">{getInitials(name)}</AvatarFallback>
					</Avatar>
				{/if}
				<div class="min-w-0 flex-1">
					<DetailField
						label="Name"
						value={name || 'No administrator assigned'}
						loading={query.isLoading}
					/>
				</div>
			</div>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<DetailField label="Email" value={admin?.email} loading={query.isLoading} />
				<DetailField label="Phone" value={admin?.phone} loading={query.isLoading} />
				<DetailField
					label="Last login"
					value={admin?.last_login_at ? formatDateTime(admin.last_login_at) : 'Never logged in'}
					loading={query.isLoading}
				/>
				<div class="flex flex-col gap-1">
					<DetailField
						label="Account status"
						value={admin?.is_active ? 'Active' : 'Inactive'}
						loading={query.isLoading}
					/>
				</div>
			</div>
		{/if}
	</ItemContent>
</Item>
