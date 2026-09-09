import type { PaginationMeta } from '@cariva/ui/components/data-table/data-table-pagination.svelte.js';

export function useOffsetPagination<D>(
	query: QueryHookResponse<CarivaServerResp<D, OffsetPagination> | undefined>,
	params: CarivaBaseQueryParams
) {
	const paginationMeta = $derived.by<PaginationMeta>(() => {
		if (query.status === 'success' && query.data) {
			const meta = query.data.meta;
			return {
				type: 'offset',
				total: meta.total,
				page: meta.page,
				perPage: meta.per_page,
				totalPages: meta.total_pages
			};
		}
		return {
			type: 'offset',
			total: 0,
			page: 1,
			perPage: params.limit,
			totalPages: 1
		};
	});

	function handlePageChange(page: number) {
		params.offset = (page - 1) * params.limit;
	}

	function handlePerPageChange(perPage: number) {
		params.limit = perPage;
		params.offset = 0;
	}

	return {
		get paginationMeta() {
			return paginationMeta;
		},

		handlePageChange: handlePageChange,
		handlePerPageChange: handlePerPageChange
	};
}
