import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '@cariva/ui/components/ui/data-table/render-helpers.js';
import type { SuperForm } from 'sveltekit-superforms';
import type { TPermissionSchema, TOverridesSchema } from './index.svelte';
import PermissionActionCell from './permission-action-cell.svelte';
import Permission from './permission.svelte';

export function createColumns(
	form: SuperForm<TOverridesSchema>
): ColumnDef<TPermissionSchema, unknown>[] {
	return [
		{
			accessorKey: 'code',
			header: 'Permission',
			cell: (info) =>
				renderComponent(Permission, {
					text: info.row.original.code,
					isDefaultPerm: info.row.original.isDefaultPerm
				})
		},
		{
			accessorKey: 'module',
			header: 'Module',
			cell: (info) => info.row.original.module
		},
		{
			id: 'grant',
			header: 'Grant',
			cell: (info) =>
				renderComponent(PermissionActionCell, {
					form,
					permissionUid: info.row.original.permission_uid,
					action: 'grant',
					label: `Grant ${info.row.original.code}`
				})
		},
		{
			id: 'revoke',
			header: 'Revoke',
			cell: (info) =>
				renderComponent(PermissionActionCell, {
					form,
					permissionUid: info.row.original.permission_uid,
					action: 'revoke',
					label: `Revoke ${info.row.original.code}`
				})
		}
	];
}
