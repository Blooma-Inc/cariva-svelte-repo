<script lang="ts" module>
	interface StaffDetailsProps {
		data: UserProfileItem;
	}
</script>

<script lang="ts">
	import { Card, CardContent } from '@cariva/ui/components/ui/card/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import PenIcon from '@lucide/svelte/icons/pen';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { Item, ItemContent, ItemHeader, ItemTitle } from '@cariva/ui/components/ui/item/index.js';
	import { Avatar, AvatarFallback, AvatarImage } from '@cariva/ui/components/ui/avatar/index.js';
	import { getInitials, obfuscatePhoneNo } from '$lib/utils/strings';
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuItem,
		DropdownMenuContent
	} from '@cariva/ui/components/ui/dropdown-menu/index.js';
	import capitalize from 'lodash/capitalize';
	import { stores } from '$lib/store/index.svelte';
	import { formatDate, formatRelativeTime } from '$lib/utils/date';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import { AppModals } from '$lib/store/app/modal-types';

	let { data }: StaffDetailsProps = $props();
	let { AppStore } = stores;
</script>

<Card>
	<CardContent class="flex flex-col gap-3">
		<div class="flex items-center gap-3">
			<Avatar class="size-28">
				<AvatarImage src={data.profile_photo_url} alt="@shadcn" />
				<AvatarFallback class="text-4xl"
					>{getInitials(`${data.first_name} ${data.last_name}`)}</AvatarFallback
				>
			</Avatar>
		</div>

		<div class="border-b border-border pb-3">
			<div class="flex items-center justify-between">
				<Heading>{data.first_name} {data.last_name}</Heading>
				<Paragraph size="sm">Account created: {formatDate(data.created_at)}</Paragraph>
			</div>
			<Badge>{data.user_roles[0].role.name}</Badge>
			<Paragraph size="sm">Last Login: {formatRelativeTime(data.last_login_at)}</Paragraph>
		</div>

		<div class="flex items-center gap-2">
			<Button>
				<PenIcon class="size-3" />
				Edit Profile
			</Button>

			<Button variant="warning">Deactivate</Button>

			<DropdownMenu>
				<DropdownMenuTrigger>
					<Button size="icon" variant="secondary">
						<EllipsisIcon class="size-3" />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="end">
					<DropdownMenuItem
						onclick={() =>
							AppStore.toggleModals({
								open: true,
								name: AppModals.STAFF_PERMISSION_OVERRIDE_MODAL,
								user_uid: data.uid
							})}
					>
						Permissions override
					</DropdownMenuItem>
					<DropdownMenuItem>Reset Password</DropdownMenuItem>
					<DropdownMenuItem>Change Branch</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>

		<Item class="flex w-full flex-col gap-3 border border-neutral-200">
			<div class="flex w-full flex-col gap-2">
				<ItemHeader class="border-b pb-2">
					<ItemTitle>Personal Information</ItemTitle>
				</ItemHeader>

				<ItemContent class="flex flex-col gap-2">
					<Paragraph size="sm" muted
						>Full Name: {data.first_name} {data?.middle_name} {data.last_name}</Paragraph
					>
					<Paragraph size="sm" muted>Gender: {capitalize(data?.gender)}</Paragraph>
					<Paragraph size="sm" muted
						>Date of birth: {data?.dob ? formatDate(data.dob) : '-'}</Paragraph
					>
					<Paragraph size="sm" muted>Emergency Address: -</Paragraph>
				</ItemContent>
			</div>

			<div class="flex w-full flex-col gap-2">
				<ItemHeader class="border-b pb-2">
					<ItemTitle>Contact Details</ItemTitle>
				</ItemHeader>

				<ItemContent class="flex flex-col gap-2">
					<Paragraph size="sm" muted>Email: {data?.email ?? '-'}</Paragraph>
					<Paragraph size="sm" muted
						>Phone: {data?.phone ? obfuscatePhoneNo(data.phone) : '-'}</Paragraph
					>
					<Paragraph size="sm" muted
						>Alternative Phone: {data?.alternative_phone
							? obfuscatePhoneNo(data.alternative_phone)
							: '-'}</Paragraph
					>
				</ItemContent>
			</div>

			<div class="flex w-full flex-col gap-2">
				<ItemHeader class="border-b pb-2">
					<ItemTitle>Professional Details</ItemTitle>
				</ItemHeader>

				<ItemContent class="flex flex-col gap-2">
					<Paragraph size="sm" muted>Role: {data.user_roles[0].role.name}</Paragraph>
					<Paragraph size="sm" muted>Designation: {data?.designation ?? '-'}</Paragraph>
					<Paragraph size="sm" muted>License Number: {data?.license_no ?? '-'}</Paragraph>
				</ItemContent>
			</div>

			<div class="flex w-full flex-col gap-2">
				<ItemHeader class="border-b pb-2">
					<ItemTitle>Branch Assignment</ItemTitle>
				</ItemHeader>

				<ItemContent class="flex flex-col gap-2">
					<Paragraph size="sm" muted>Branch: {data.branch_assignments[0].branch.name}</Paragraph>
				</ItemContent>
			</div>
		</Item>
	</CardContent>
</Card>
