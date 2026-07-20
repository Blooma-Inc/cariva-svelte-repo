import type { ColumnDef } from '@tanstack/table-core';
import {
	renderComponent,
	textSnippet
} from '@cariva/ui/components/ui/data-table/render-helpers.js';

import { Checkbox } from '@cariva/ui/components/ui/checkbox/index.js';
import { Badge } from '@cariva/ui/components/ui/badge/index.js';
import { cn } from '@cariva/ui/utils';
import { toTitleCase } from '$lib/utils/strings';
import { formatDate } from '$lib/utils/date';

import { tenantStatusBadge } from './tenant-status-badge';
import TenantActions from './tenant-actions.svelte';
import { TextWithCopy } from '@cariva/ui/components/text-with-copy/index.js';

export const columns: ColumnDef<PlatformTenantItem, unknown>[] = [
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
		header: 'Tenant',
		cell: (info) => info.row.original.name,
		enableSorting: false,
		enableHiding: false
	},

	{
		accessorKey: 'code',
		header: 'Code',
		cell: (info) =>
			renderComponent(TextWithCopy, {
				value: info.row.original.code,
				copyProps: {
					value: info.row.original.name,
					showLabel: false,
					buttonProps: {
						variant: 'ghost',
						size: 'icon-sm'
					}
				}
			}),
		enableSorting: false,
		enableHiding: false
	},

	{
		accessorKey: 'hospital_type',
		header: 'Type',
		cell: (info) =>
			renderComponent(Badge, {
				class: cn('w-fit justify-between space-x-1 capitalize'),
				children: textSnippet(toTitleCase(info.row.original.hospital_type))
			}),
		enableSorting: false,
		enableHiding: false
	},

	{
		accessorKey: 'registration_number',
		header: 'Reg. No.',
		cell: (info) =>
			renderComponent(TextWithCopy, {
				value: info.row.original.registration_number,
				copyProps: {
					value: info.row.original.registration_number,
					showLabel: false,
					buttonProps: {
						variant: 'ghost',
						size: 'icon-sm'
					}
				}
			}),
		enableSorting: false,
		enableHiding: true
	},

	{
		accessorKey: 'date_established',
		header: 'Established',
		cell: (info) => formatDate(info.row.original.date_established),
		enableSorting: false,
		enableHiding: true
	},

	{
		id: 'email',
		header: 'Email',
		cell: (info) => {
			if (info.row.original.email) {
				return renderComponent(TextWithCopy, {
					value: info.row.original.email,
					copyProps: {
						value: info.row.original.email,
						showLabel: false,
						buttonProps: {
							variant: 'ghost',
							size: 'icon-sm'
						}
					}
				});
			} else {
				return textSnippet('-');
			}
		},
		enableSorting: false,
		enableHiding: true
	},

	{
		id: 'website_url',
		header: 'url',
		cell: (info) => {
			const webUrl = info.row.original.website_url;
			if (webUrl) {
				return renderComponent(TextWithCopy, {
					value: webUrl,
					copyProps: {
						value: webUrl,
						showLabel: false,
						buttonProps: {
							variant: 'ghost',
							size: 'icon-sm'
						}
					}
				});
			} else {
				return textSnippet('-');
			}
		},
		enableSorting: false,
		enableHiding: true
	},

	{
		id: 'latest_subscription_plan',
		header: 'Plan',
		accessorFn: (row) => row.latest_subscription?.subscription_plan?.plan ?? null,
		cell: (info) => (info.getValue() as string | null) ?? '—',
		enableSorting: false,
		enableHiding: false
	},

	{
		accessorKey: 'status',
		header: 'Status',
		cell: (info) =>
			renderComponent(Badge, {
				class: cn(
					'w-fit justify-between space-x-1 capitalize',
					tenantStatusBadge.get(info.row.original.status)
				),
				children: textSnippet(toTitleCase(info.row.original.status))
			}),
		enableSorting: false,
		enableHiding: false
	},

	{
		accessorKey: 'onboarded_at',
		header: 'Onboarded',
		cell: (info) => {
			const onboardedAt = info.row.original.onboarded_at;
			if (onboardedAt) {
				return textSnippet(formatDate(onboardedAt));
			}
			return renderComponent(Badge, { variant: 'default', children: textSnippet('Pending') });
		},
		enableSorting: false,
		enableHiding: true
	},

	{
		id: 'actions',
		cell: (info) => renderComponent(TenantActions, { tenant: info.row.original }),
		enableSorting: false,
		enableHiding: false
	}
];
