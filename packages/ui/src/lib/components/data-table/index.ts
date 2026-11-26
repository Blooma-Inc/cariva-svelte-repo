import Root, { type DataTableProps } from './data-table.svelte';
import DataTableSearch from './data-table-search.svelte';
import DataTablePagination from './data-table-pagination.svelte';
import { type DataTableEmptyProps } from './data-table-empty.svelte';
import { type DataTableBodyProps } from './data-table-body.svelte';
import { type DataTableErrorProps } from './data-table-error.svelte';
import { type DataTableLoaderProps } from './data-table-loading.svelte';
import type {
  DataTablePaginationProps,
  OffsetPaginationMeta,
  CursorPaginationMeta,
  PaginationMeta
} from './data-table-pagination.svelte';
import { type DataTableHeaderProps } from './data-table-header.svelte';

export {
  Root, //
  type DataTableProps,
  type DataTableEmptyProps,
  type DataTableBodyProps,
  type DataTableErrorProps,
  type DataTableLoaderProps,
  type DataTablePaginationProps,
  type DataTableHeaderProps,
  type OffsetPaginationMeta,
  type CursorPaginationMeta,
  type PaginationMeta,
  DataTableSearch,
  DataTablePagination,
  Root as DataTable
};
