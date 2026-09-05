import type { ColumnDef } from '@tanstack/table-core';
import {
	renderComponent,
	textSnippet
} from '@cariva/ui/components/ui/data-table/render-helpers.js';

import { Checkbox } from '@cariva/ui/components/ui/checkbox/index.js';
import { Badge } from '@cariva/ui/components/ui/badge/index.js';
import { cn } from '@cariva/ui/utils';
import { formatDate, formatRelativeTime } from '$lib/utils/date';
import { staffStatusBadge } from './staff-status-badge';
import StaffActions from './staff-actions.svelte';
import UserAvatar from '$lib/components/user-avatar.svelte';

export const columns: ColumnDef<StaffItem, unknown>[] = [
	{
		id: 'select',
		header: (context) =>
			renderComponent(Checkbox, {
				checked:
					context.table.getIsAllPageRowsSelected() ||
					context.table.getIsSomePageRowsSelected() ||
					undefined,
				onCheckedChange: (value: boolean) => context.table.toggleAllPageRowsSelected(!!value),
				'aria-label': 'Select all',
				class: 'translate-y-[2px]'
			}),
		cell: (info) =>
			renderComponent(Checkbox, {
				checked: info.row.getIsSelected(),
				onCheckedChange: (value: boolean) => info.row.toggleSelected(!!value),
				'aria-label': 'Select row',
				class: 'translate-y-[2px]'
			}),
		enableSorting: false,
		enableHiding: false
	},

	{
		accessorKey: 'first_name',
		header: 'Staff Member',
		cell: (info) => {
			const photoUrl = info.row.original.profile_photo_url;
			const firstName = info.row.original.first_name;
			const lastName = info.row.original.last_name;
			const email = info.row.original.email;

			return renderComponent(UserAvatar, {
				photoUrl: photoUrl,
				firstName: firstName,
				lastName: lastName,
				email: email
			});
		},
		enableSorting: false,
		enableHiding: false
	},

	{
		accessorKey: 'branch_assignments',
		header: 'Branch',
		cell: (info) => {
			const branches = info.row.original.branch_assignments;
			const branch_name = branches.length ? branches[0].branch.name : 'N/A';
			return branch_name;
		},
		enableSorting: false,
		enableHiding: false
	},

	{
		accessorKey: 'user_roles',
		header: 'Role',
		cell: (info) => {
			return info.row.original.user_roles[0].role.name;
		},
		enableSorting: false,
		enableHiding: false
	},

	{
		accessorKey: 'designation',
		header: 'Designation',
		cell: (info) => {
			const designation = info.row.original?.designation ? info.row.original?.designation : 'N/A';
			return designation;
		},
		enableSorting: false,
		enableHiding: false
	},

	{
		accessorKey: 'last_login_at',
		header: 'Last Login',
		cell: (info) => {
			const lastLoginAt = info.row.original.last_login_at;
			return formatRelativeTime(lastLoginAt);
		},
		enableSorting: false,
		enableHiding: false
	},

	{
		accessorKey: 'is_active',
		header: 'Status',
		cell: (info) =>
			renderComponent(Badge, {
				class: cn('w-fit'),
				variant: staffStatusBadge.get(info.row.original.is_active) as 'default',
				children: textSnippet(info.row.original.is_active ? 'Active' : 'Inactive')
			}),
		enableSorting: false,
		enableHiding: false
	},

	{
		accessorKey: 'created_at',
		header: 'Created at',
		cell: (info) => {
			const createdAt = info.row.original.created_at;
			return formatDate(createdAt);
		},
		enableSorting: false,
		enableHiding: true
	},

	{
		id: 'actions',
		header: 'Actions',
		cell: (info) => renderComponent(StaffActions, { staff: info.row.original }),
		enableSorting: false,
		enableHiding: false
	}
];
