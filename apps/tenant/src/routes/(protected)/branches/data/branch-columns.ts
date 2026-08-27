import type { ColumnDef } from '@tanstack/table-core';
import {
	renderComponent,
	textSnippet
} from '@cariva/ui/components/ui/data-table/render-helpers.js';

import { Checkbox } from '@cariva/ui/components/ui/checkbox/index.js';
import { Badge } from '@cariva/ui/components/ui/badge/index.js';
import { cn } from '@cariva/ui/utils';
import { formatDate } from '$lib/utils/date';
import { branchStatusBadge } from './branch-status-badge';
import BranchActions from './branch-actions.svelte';
import { Button } from '@cariva/ui/components/ui/button/index.js';
import { Paragraph } from '@cariva/ui/components/ui/typography/index.js';

export const columns: ColumnDef<TenantBranchItem, unknown>[] = [
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
		accessorKey: 'name',
		header: 'Branch',
		cell: (info) => info.row.original.name,
		enableSorting: false,
		enableHiding: false
	},

	{
		accessorKey: 'is_main',
		header: 'Type',
		cell: (info) =>
			renderComponent(Badge, {
				class: cn('w-fit'),
				variant: branchStatusBadge.get(info.row.original.is_main) as 'default',
				children: textSnippet(info.row.original.is_main ? 'Main' : 'Satellite')
			}),
		enableSorting: false,
		enableHiding: false
	},

	{
		id: 'city',
		header: 'City',
		accessorFn: (row) => row.city,
		cell: (info) => info.getValue(),
		enableSorting: false,
		enableHiding: false
	},

	{
		id: 'state',
		header: 'State',
		accessorFn: (row) => row.state,
		cell: (info) => info.getValue(),
		enableSorting: false,
		enableHiding: false
	},

	{
		id: 'country',
		header: 'Country',
		accessorFn: (row) => row.country,
		cell: (info) => info.getValue(),
		enableSorting: false,
		enableHiding: false
	},

	{
		id: 'admin',
		header: 'Admin',
		accessorFn: (row) => row.user_count,
		cell: (info) => {
			if (info.row.original.admin) {
				return;
			} else {
				return renderComponent(Button, {
					size: 'xs',
					variant: 'info',
					children: textSnippet('Assign branch admin')
				});
			}
		},
		enableSorting: false,
		enableHiding: false
	},

	{
		id: 'user_count',
		header: 'Staff size',
		accessorFn: (row) => row.user_count,
		cell: (info) =>
			renderComponent(Paragraph, {
				children: textSnippet(`${info.row.original.user_count} staff`)
			}),
		enableSorting: false,
		enableHiding: false
	},

	{
		accessorKey: 'is_active',
		header: 'Status',
		cell: (info) =>
			renderComponent(Badge, {
				class: cn('w-fit'),
				variant: branchStatusBadge.get(info.row.original.is_active) as 'default',
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
		cell: (info) => renderComponent(BranchActions, { branch: info.row.original }),
		enableSorting: false,
		enableHiding: false
	}
];
