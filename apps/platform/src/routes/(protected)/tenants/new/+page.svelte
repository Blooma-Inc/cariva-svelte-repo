<script lang="ts">
	import CarivaHospitalForm from '$lib/assets/icons/form.png';
	import {
		Breadcrumb,
		BreadcrumbList,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbSeparator,
		BreadcrumbPage
	} from '@cariva/ui/components/ui/breadcrumb/index.js';
	import {
		Item,
		ItemContent,
		ItemDescription,
		ItemMedia,
		ItemTitle
	} from '@cariva/ui/components/ui/item/index.js';
	import { CircleCheckIcon, SlashIcon } from '@cariva/ui/icons';
</script>

<section class="flex w-full flex-col gap-4">
	<div>
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="/tenants">Tenants</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator>
					<SlashIcon />
				</BreadcrumbSeparator>
				<BreadcrumbItem>
					<BreadcrumbPage>New</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	</div>

	<Item class="bg-info/20 p-2">
		<ItemMedia class="h-36 w-28 border p-1">
			<img src={CarivaHospitalForm} alt="form" class="h-full w-full object-cover" />
		</ItemMedia>
		<ItemContent class="gap-2">
			<ItemTitle
				>You're about to onboard a new hospital onto the Cariva platform. This will create:</ItemTitle
			>

			<ItemContent class="gap-1">
				<div class="flex items-center justify-start gap-2">
					<CircleCheckIcon class="size-3 text-info" />
					<ItemDescription>A tenant account for the hospital</ItemDescription>
				</div>
				<div class="flex items-center justify-start gap-2">
					<CircleCheckIcon class="size-3 text-info" />
					<ItemDescription>Their first branch location</ItemDescription>
				</div>
				<div class="flex items-center justify-start gap-2">
					<CircleCheckIcon class="size-3 text-info" />
					<ItemDescription>A Tenant Admin user account</ItemDescription>
				</div>
			</ItemContent>

			<ItemTitle class="text-warning"
				>All information can be edited later except the Tenant Code.</ItemTitle
			>
		</ItemContent>
	</Item>
</section>
