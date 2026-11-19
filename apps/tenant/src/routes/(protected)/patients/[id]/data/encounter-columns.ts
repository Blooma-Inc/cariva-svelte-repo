import type { ColumnDef } from '@tanstack/table-core';
import { format } from 'date-fns';
import { snakeCaseToSentenceCase } from '$lib/utils/strings';

export const columns: ColumnDef<EncounterItem, unknown>[] = [
	{ accessorKey: 'encounter_no', header: 'Encounter', enableSorting: false },
	{
		accessorKey: 'encounter_class',
		header: 'Class',
		cell: ({ row }) => snakeCaseToSentenceCase(row.original.encounter_class),
		enableSorting: false
	},
	{
		accessorKey: 'encounter_types',
		header: 'Types',
		cell: ({ row }) => row.original.encounter_types.join(', ') || 'Not specified',
		enableSorting: false
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => snakeCaseToSentenceCase(row.original.status),
		enableSorting: false
	},
	{
		accessorKey: 'started_at',
		header: 'Started',
		cell: ({ row }) => format(new Date(row.original.started_at), 'dd MMM yyyy, HH:mm'),
		enableSorting: false
	},
	{
		accessorKey: 'ended_at',
		header: 'Ended',
		cell: ({ row }) =>
			row.original.ended_at
				? format(new Date(row.original.ended_at), 'dd MMM yyyy, HH:mm')
				: 'In progress',
		enableSorting: false
	},
	{
		id: 'session',
		header: 'Visit / session',
		cell: ({ row }) =>
			row.original.part_of_encounter_uid
				? 'Care session'
				: row.original.encounter_class === 'inpatient'
					? 'Hospital stay'
					: 'Visit',
		enableSorting: false
	}
];
