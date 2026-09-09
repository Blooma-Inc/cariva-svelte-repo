<script lang="ts" module>
	interface BranchOverviewProps {
		branch: BranchDetailedItem;
		admin: UserItem | null;
	}
</script>

<script lang="ts">
	import { getInitials, obfuscatePhoneNo } from '$lib/utils/strings';
	import { Avatar, AvatarFallback } from '@cariva/ui/components/ui/avatar/index.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader
	} from '@cariva/ui/components/ui/card/index.js';
	import { Item, ItemContent, ItemHeader, ItemTitle } from '@cariva/ui/components/ui/item/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import CalendarPlusIcon from '@lucide/svelte/icons/calendar-plus';
	import UserAvatar from '$lib/components/user-avatar.svelte';
	import { formatRelativeTime, formatTime } from '$lib/utils/date';
	import { DEFAULT_WEEK_DAYS } from '../modals/branch-operating-hours.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { stores } from '$lib/store/index.svelte';

	let { branch, admin }: BranchOverviewProps = $props();
	let { AppStore } = stores;
</script>

<section class="flex flex-col gap-3">
	<Card class="relative overflow-hidden bg-primary text-white!">
		<div
			class="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-green-500 blur-3xl"
		></div>
		<div
			class="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-warning blur-3xl"
		></div>

		<div class="relative z-10">
			<CardHeader>
				<div class="flex items-start justify-between">
					<div class="flex items-center justify-start gap-2">
						<Avatar class="size-20 rounded-lg">
							<AvatarFallback class="rounded-lg  text-4xl"
								>{getInitials(branch.name)}</AvatarFallback
							>
						</Avatar>

						<div>
							<div class="flex items-center gap-2">
								<Heading>{branch.name}</Heading>
								<Button size="icon-sm" variant="secondary">
									<PencilIcon class="size-3" />
								</Button>
							</div>
							<div class="[&>p]:text-neutral-200">
								<CardDescription>{branch.address}</CardDescription>
								<CardDescription>{branch.city} {branch.state}, {branch.country}</CardDescription>
							</div>
						</div>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<div class="flex flex-col gap-1">
					<div class="[&>p]:text-white!">
						<CardDescription>Phone: {branch.phone ?? 'N/A'}</CardDescription>
						<CardDescription>Email: {branch.email ?? 'N/A'}</CardDescription>
					</div>
				</div>
			</CardContent>

			<CardFooter>
				<div class="w-full justify-end"></div>
			</CardFooter>
		</div>
	</Card>

	<div class="auto-grid items-start">
		{#if admin}
			<Item class="border border-neutral-200">
				<ItemHeader class="border-b pb-2">
					<ItemTitle class="text-neutral-600">Branch Admin</ItemTitle>
				</ItemHeader>

				<ItemContent class="flex flex-col gap-3">
					<UserAvatar
						photoUrl={admin.profile_photo_url}
						firstName={admin.first_name}
						lastName={admin.last_name}
						email={admin.email}
					/>

					<div class="auto-grid">
						<div class="flex flex-col gap-1">
							<Paragraph size="sm" muted>Phone Number</Paragraph>
							<Paragraph>{admin.phone ? obfuscatePhoneNo(admin.phone) : 'N/A'}</Paragraph>
						</div>
						<div class="flex flex-col gap-1">
							<Paragraph size="sm" muted>Last seen:</Paragraph>
							<Paragraph size="sm">{formatRelativeTime(admin.last_login_at)}</Paragraph>
						</div>
					</div>
				</ItemContent>
			</Item>
		{/if}

		<Item class="border border-neutral-200">
			<ItemHeader class="border-b pb-2">
				<ItemTitle class="text-neutral-600">Operating Hours</ItemTitle>

				<Button
					size="icon-sm"
					onclick={() => {
						AppStore.toggleModals({
							open: true,
							name: AppModals.BRANCH_OPERATING_HOURS_FROM,
							branch_uid: branch.uid,
							working_hours: JSON.stringify(branch.operating_hours)
						});
					}}
				>
					<PencilIcon class="size-3" />
				</Button>
			</ItemHeader>

			{#if branch.operating_hours}
				<ItemContent class="flex flex-col gap-2">
					{#each branch.operating_hours.days as day, index (index)}
						<div class="flex items-center justify-start gap-2">
							<Paragraph size="sm" muted class="font-medium!">
								{DEFAULT_WEEK_DAYS.find((item) => item.value === day.week_day)?.label}:
							</Paragraph>

							{#if day.is_enabled}
								<Paragraph size="sm" class="font-medium">
									{day.open_time && formatTime(day.open_time)} – {day.close_time &&
										formatTime(day.close_time)}
								</Paragraph>
							{:else}
								<Paragraph size="sm" class="font-medium text-destructive!">Closed</Paragraph>
							{/if}
						</div>
					{/each}

					<div
						class="flex items-center justify-start gap-2 border-t border-neutral-200 pt-2 font-semibold!"
					>
						<Paragraph size="sm" class="text-destructive/70">Emergency Services:</Paragraph>

						{#if branch.operating_hours.is_emergency_services}
							<span class="text-sm text-destructive">24/7</span>
						{:else}
							<span class="text-sm text-neutral-400">Not available</span>
						{/if}
					</div>
				</ItemContent>
			{:else}
				<ItemContent>
					<div class="mx-auto flex w-full max-w-fit flex-col items-center justify-center gap-2">
						<div class="flex flex-col items-center justify-center">
							<Heading level="h3">No Operating Hours</Heading>
							<Paragraph size="sm" muted>To add operating hours click the button below.</Paragraph>
						</div>

						<Button>
							<CalendarPlusIcon class="size-3" />
							Add hours
						</Button>
					</div>
				</ItemContent>
			{/if}
		</Item>
	</div>
</section>
