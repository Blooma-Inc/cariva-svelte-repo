<script>
	import { Card, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import PenIcon from '@lucide/svelte/icons/pen';
	import { Item, ItemContent, ItemHeader, ItemTitle } from '@cariva/ui/components/ui/item/index.js';
	import { Avatar, AvatarFallback, AvatarImage } from '@cariva/ui/components/ui/avatar/index.js';
	import { getInitials, obfuscatePhoneNo } from '$lib/utils/strings';
	import capitalize from 'lodash/capitalize';
	import { useFetchUserProfile } from '$lib/hooks/user/use-fetch-profile';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { formatDate } from '$lib/utils/date';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';

	const { AppStore } = stores;
	const currentUserQuery = useFetchUserProfile();
</script>

<Card>
	<CardContent class="flex flex-col gap-3">
		{#if currentUserQuery.status === 'success' && currentUserQuery.data}
			<div class="flex items-center gap-3">
				<Avatar class="size-28">
					<AvatarImage src={currentUserQuery.data.profile_photo_url} alt="@shadcn" />
					<AvatarFallback class="text-4xl"
						>{getInitials(
							`${currentUserQuery.data.first_name} ${currentUserQuery.data.last_name}`
						)}</AvatarFallback
					>
				</Avatar>

				<div class="flex flex-col gap-1">
					<div class="flex divide-y-2">
						<Button size="xs" variant="secondary">Upload</Button>
						<Button
							size="xs"
							variant="destructive"
							disabled={!!currentUserQuery.data?.profile_photo_url}>Remove</Button
						>
					</div>
					<Paragraph size="sm" muted>Recommended: 400x400px, JPG or PNG, max 5MB</Paragraph>
				</div>
			</div>

			<div class="flex items-center justify-between border-b">
				<Heading level="h3">Personal Information</Heading>
				<Button
					size="icon-xs"
					variant="ghost"
					onclick={() => AppStore.toggleModals({ open: true, name: AppModals.PROFILE_FORM_MODAL })}
				>
					<PenIcon />
				</Button>
			</div>

			<div class="grid grid-cols-3 gap-2 border-b pb-2">
				<div class="flex flex-col gap-2">
					<Paragraph size="sm" muted>First Name</Paragraph>
					<Paragraph>{currentUserQuery.data.first_name}</Paragraph>
				</div>
				<div class="flex flex-col gap-2">
					<Paragraph size="sm" muted>Middle Name</Paragraph>
					<Paragraph>{currentUserQuery.data?.middle_name ?? '-'}</Paragraph>
				</div>
				<div class="flex flex-col gap-2">
					<Paragraph size="sm" muted>Last Name</Paragraph>
					<Paragraph>{currentUserQuery.data.last_name}</Paragraph>
				</div>
			</div>

			<div class="grid grid-cols-3 gap-2 border-b pb-2">
				<div class="flex flex-col gap-2">
					<Paragraph size="sm" muted>Prefered Name</Paragraph>
					<Paragraph>{currentUserQuery.data?.prefered_name ?? '-'}</Paragraph>
				</div>
				<div class="flex flex-col gap-2">
					<Paragraph size="sm" muted>Date of Birth</Paragraph>
					<Paragraph
						>{currentUserQuery.data?.dob ? formatDate(currentUserQuery.data?.dob) : '-'}</Paragraph
					>
				</div>
				<div class="flex flex-col gap-2">
					<Paragraph size="sm" muted>Gender</Paragraph>
					<Paragraph>{capitalize(currentUserQuery.data?.gender ?? '-')}</Paragraph>
				</div>
			</div>

			<Item class="border border-neutral-200 bg-neutral-100">
				<ItemHeader class="border-b pb-2">
					<ItemTitle>Contact Details</ItemTitle>
				</ItemHeader>

				<ItemContent class="flex flex-col gap-3">
					<div class="flex flex-col gap-2 border-b pb-2">
						<Paragraph size="sm" muted>Email Address</Paragraph>
						<Paragraph>{currentUserQuery.data?.email ?? '-'}</Paragraph>
						<Badge variant="warning">Your email address can not be changed.</Badge>
					</div>

					<div class="auto-grid">
						<div class="flex flex-col gap-2">
							<Paragraph size="sm" muted>Phone Number</Paragraph>
							<Paragraph
								>{currentUserQuery.data?.phone
									? obfuscatePhoneNo(currentUserQuery.data.phone)
									: '-'}</Paragraph
							>
						</div>
						<div class="flex flex-col gap-2">
							<Paragraph size="sm" muted>Alternative Phone</Paragraph>
							<Paragraph
								>{currentUserQuery.data?.alternative_phone
									? obfuscatePhoneNo(currentUserQuery.data.alternative_phone)
									: '-'}</Paragraph
							>
						</div>
					</div>
				</ItemContent>
			</Item>
		{/if}
	</CardContent>
</Card>
