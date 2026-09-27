import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '@cariva/ui/components/ui/data-table/render-helpers.js';

import { Checkbox } from '@cariva/ui/components/ui/checkbox/index.js';
import PatientActions from './patient-actions.svelte';
import UserAvatar from '$lib/components/user-avatar.svelte';

export const columns: ColumnDef<LinkedTenantPatientItem, unknown>[] = [
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
		header: 'Patient',
		cell: (info) => {
			const uid = info.row.original.patient_uid;
			const firstName = info.row.original.patient.first_name;
			const lastName = info.row.original.patient.last_name;

			return renderComponent(UserAvatar, {
				uid: uid,
				photoUrl: '',
				firstName: firstName,
				lastName: lastName,
				email: ''
			});
		},
		enableSorting: false,
		enableHiding: false
	},

	{
		accessorKey: 'patient_no',
		header: 'Patient No',
		cell: (info) => {
			const patientNo = info.row.original.patient_no;
			return patientNo;
		},
		enableSorting: false,
		enableHiding: false
	},

	{
		accessorKey: 'gender',
		header: 'Gender',
		cell: (info) => {
			return info.row.original.patient.gender;
		},
		enableSorting: false,
		enableHiding: false
	},

	{
		accessorKey: 'date_of_birth',
		header: 'Date of Birth',
		cell: (info) => {
			return info.row.original.patient.date_of_birth;
		},
		enableSorting: false,
		enableHiding: false
	},

	{
		id: 'actions',
		header: 'Actions',
		cell: (info) => renderComponent(PatientActions, { linkedTenantPatient: info.row.original }),
		enableSorting: false,
		enableHiding: false
	}
];
