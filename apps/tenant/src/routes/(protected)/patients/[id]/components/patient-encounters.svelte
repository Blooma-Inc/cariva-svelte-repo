<script lang="ts">
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { DataTable } from '@cariva/ui/components/data-table/index.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { useFetchPatientEncounters } from '$lib/hooks/encounters/use-fetch-patient-encounters';
	import { useOffsetPagination } from '$lib/hooks/app/use-offset-pagination.svelte';
	import { parseError } from '$lib/utils/errorHandler';
	import { columns } from '../data/encounter-columns';

	let {
		patientUid,
		branchUid,
		branchName
	}: { patientUid: string; branchUid: string; branchName: string } = $props();
	const params = $state({ limit: 10, offset: 0 });
	const query = useFetchPatientEncounters(
		() => patientUid,
		() => branchUid,
		params
	);
	const pagination = useOffsetPagination(query, params);
</script>

<section class="flex min-w-0 flex-col gap-3" aria-label="Patient encounters">
	<div>
		<Heading level="h2">Encounters</Heading>
		<Paragraph size="sm" muted>Visits and care sessions at {branchName}.</Paragraph>
	</div>
	<DataTable
		getRowId={(row) => row.uid}
		{columns}
		limit={params.limit}
		status={query.status}
		data={query.data?.data ?? []}
		paginationProps={{
			meta: pagination.paginationMeta,
			isLoading: query.isFetching,
			onPageChange: pagination.handlePageChange,
			onPerPageChange: pagination.handlePerPageChange
		}}
		errorDataProps={{
			title: 'Failed to load encounters',
			errorDescription: parseError(query.error),
			onRetry: query.refetch
		}}
		emptyDataProps={{
			title: 'No encounters yet',
			description: 'This patient has no encounters at this branch.'
		}}
	/>
	{#if query.status === 'success' && query.data && query.data.meta.total > 0}
		<div class="flex flex-wrap items-center justify-between gap-3">
			<Paragraph size="sm" muted>
				{params.offset + 1}–{Math.min(params.offset + params.limit, query.data.meta.total)} of {query
					.data.meta.total}
			</Paragraph>
			<div class="flex items-center gap-2">
				<Button
					variant="outline"
					disabled={query.isFetching || params.offset === 0}
					onclick={() => pagination.handlePageChange(query.data!.meta.page - 1)}>Previous</Button
				>
				<Paragraph size="sm">Page {query.data.meta.page} of {query.data.meta.total_pages}</Paragraph
				>
				<Button
					variant="outline"
					disabled={query.isFetching || params.offset + params.limit >= query.data.meta.total}
					onclick={() => pagination.handlePageChange(query.data!.meta.page + 1)}>Next</Button
				>
			</div>
		</div>
	{/if}
</section>
