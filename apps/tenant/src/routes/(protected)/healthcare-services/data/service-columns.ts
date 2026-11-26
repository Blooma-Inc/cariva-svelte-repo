import type { ColumnDef } from '@tanstack/table-core';
import { Badge } from '@cariva/ui/components/ui/badge/index.js';
import {
	renderComponent,
	textSnippet
} from '@cariva/ui/components/ui/data-table/render-helpers.js';
import { formatDate } from '$lib/utils/date';
import ServiceActions from './service-actions.svelte';
import { Button } from '@cariva/ui/components/ui/button/index.js';

export function createServiceColumns(
	onOpen: (mode: 'view' | 'form' | 'status', uid: string) => void
): ColumnDef<HealthcareServiceItem, unknown>[] {
	return [
		{
			accessorKey: 'name',
			header: 'Name',
			cell: (info) =>
				renderComponent(Button, {
					variant: 'link',
					children: textSnippet(info.row.original.name),
					onclick: () => onOpen('view', info.row.original.uid)
				}),
			meta: { className: 'font-medium' }
		},
		{
			accessorKey: 'description',
			header: 'Description',
			cell: (info) => info.row.original.description || '—',
			meta: { className: 'max-w-sm truncate' }
		},
		{
			accessorKey: 'is_active',
			header: 'Status',
			cell: (info) =>
				renderComponent(Badge, {
					variant: info.row.original.is_active ? 'default' : 'secondary',
					children: textSnippet(info.row.original.is_active ? 'Active' : 'Inactive')
				})
		},
		{
			accessorKey: 'updated_at',
			header: 'Last updated',
			cell: (info) => formatDate(info.row.original.updated_at)
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: (info) => renderComponent(ServiceActions, { service: info.row.original, onOpen })
		}
	];
}
