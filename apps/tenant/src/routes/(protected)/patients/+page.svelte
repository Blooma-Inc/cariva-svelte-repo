<script lang="ts">
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import NoPatient from './components/no-patient.svelte';
	import { columns } from './data/patient-columns';
	import { DataTable, DataTableSearch } from '@cariva/ui/components/data-table/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ListFilterIcon from '@lucide/svelte/icons/list-filter';
	import { useOffsetPagination } from '$lib/hooks/app/use-offset-pagination.svelte';
	import { useFetchTenantPatients } from '$lib/hooks/patients/use-fetch-tenant-patients';

	const params: PatientSearchParams = $state({
		limit: 30,
		offset: 0,
		first_name: null,
		last_name: null,
		other_name: null,
		date_of_birth: null,
		gender: null,
		patient_no: null,
		imported_patient_no: null,
		nin: null
	});

	const query = useFetchTenantPatients(params);
	const { paginationMeta, handlePageChange, handlePerPageChange } = useOffsetPagination(
		query,
		params
	);
</script>

{#snippet EmptyPatient()}
	<NoPatient />
{/snippet}

<div class="flex w-full min-w-0 flex-col gap-4">
	<div>
		<Heading>Patient</Heading>
		<Paragraph size="sm" muted>
			Manage registered Patients, and their details access across the platform.
		</Paragraph>
	</div>

	<div class="flex w-full flex-col gap-2">
		{#if query.status === 'success' && query.data}
			{#if query.data.data.length}
				<div class="flex w-full flex-col justify-between gap-2 md:flex-row md:items-center">
					<div class="flex items-center justify-start gap-2">
						<DataTableSearch class="w-full! max-w-sm" placeholder="search patients" />
						<Button size="icon" variant="outline">
							<ListFilterIcon class="size-3" />
						</Button>
					</div>

					<Button>
						<PlusIcon class="size-3" />
						Register Patient
					</Button>
				</div>
			{/if}
		{/if}

		<DataTable
			limit={params.limit}
			status={query.status}
			{columns}
			data={query.data?.data ?? []}
			paginationProps={{
				meta: paginationMeta,
				isLoading: query.isLoading,
				onPageChange: handlePageChange,
				onPerPageChange: handlePerPageChange
			}}
			errorDataProps={{
				title: 'Failed to load patient',
				errorDescription: 'An error occurred while fetching the patient list.',
				onRetry: query.refetch
			}}
			emptyDataNode={EmptyPatient}
		/>
	</div>
</div>
