import type { Snippet } from 'svelte';
import type { ColumnDef } from '@tanstack/table-core';
import { Badge } from '@cariva/ui/components/ui/badge/index.js';
import {
	renderComponent,
	renderSnippet,
	textSnippet
} from '@cariva/ui/components/ui/data-table/render-helpers.js';
import { formatDate } from '$lib/utils/date';
import BranchServiceActions from './branch-service-actions.svelte';

export function createBranchServiceColumns(
	name: Snippet<[BranchHealthcareServiceItem]>,
	onOpen: (mode: 'view' | 'form' | 'status', serviceUid: string) => void
): ColumnDef<BranchHealthcareServiceItem, unknown>[] {
	return [
		{
			accessorKey: 'name',
			header: 'Service',
			cell: (info) => renderSnippet(name, info.row.original)
		},
		{
			accessorKey: 'is_active',
			header: 'Branch status',
			cell: (info) =>
				renderComponent(Badge, {
					variant: info.row.original.is_active ? 'default' : 'secondary',
					children: textSnippet(info.row.original.is_active ? 'Active' : 'Inactive')
				})
		},
		{
			id: 'availability',
			header: 'Service hours',
			cell: (info) =>
				info.row.original.availability === null
					? 'Unconfigured'
					: info.row.original.availability.available_time.length
						? `${info.row.original.availability.available_time.length} weekly window(s)`
						: 'No available windows'
		},
		{
			accessorKey: 'updated_at',
			header: 'Last updated',
			cell: (info) => formatDate(info.row.original.updated_at)
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: (info) => renderComponent(BranchServiceActions, { service: info.row.original, onOpen })
		}
	];
}
