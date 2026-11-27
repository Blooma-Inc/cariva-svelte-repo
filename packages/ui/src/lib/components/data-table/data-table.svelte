<script lang="ts" module>
  import type { RowData, ColumnDef } from '@tanstack/table-core';
  import type { Snippet } from 'svelte';

  declare module '@tanstack/table-core' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
      className: string;
    }
  }

  export interface DataTableProps<TData extends RowData, TValue> {
    limit: number;
    status: 'pending' | 'error' | 'success';
    data: TData[];
    columns: ColumnDef<TData, TValue>[];
    getRowId?: (row: TData, index: number) => string;
    children?: Snippet;
    showPagination?: boolean;
    paginationProps: DataTablePaginationProps;
    emptyDataNode?: Snippet;
    loadingDataNode?: Snippet;
    emptyDataProps?: DataTableEmptyProps;
    errorDataProps: DataTableErrorProps;
  }
</script>

<script lang="ts" generics="TData extends RowData, TValue">
  import {
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type RowSelectionState,
    type VisibilityState,
    type ColumnFiltersState,
    type SortingState
  } from '@tanstack/table-core';

  import { Table } from '$lib/components/ui/table';
  import DataTableHeader from './data-table-header.svelte';
  import DataTableLoading from './data-table-loading.svelte';
  import DataTableBody from './data-table-body.svelte';
  import DataTablePagination, {
    type DataTablePaginationProps
  } from './data-table-pagination.svelte';
  import DataTableEmpty, { type DataTableEmptyProps } from './data-table-empty.svelte';
  import DataTableError, { type DataTableErrorProps } from './data-table-error.svelte';
  import { createSvelteTable } from '../ui/data-table/data-table.svelte';

  let {
    limit,
    status,
    data,
    columns,
    children,
    emptyDataNode,
    loadingDataNode,
    paginationProps,
    emptyDataProps,
    errorDataProps,
    getRowId,
    showPagination = false
  }: DataTableProps<TData, TValue> = $props();

  let rowSelection = $state<RowSelectionState>({});
  let columnVisibility = $state<VisibilityState>({});
  let columnFilters = $state<ColumnFiltersState>([]);
  let sorting = $state<SortingState>([]);

  const table = createSvelteTable({
    get data() {
      return data;
    },
    get columns() {
      return columns;
    },
    ...(getRowId ? { getRowId } : {}),
    state: {
      get sorting() {
        return sorting;
      },
      get columnVisibility() {
        return columnVisibility;
      },
      get rowSelection() {
        return rowSelection;
      },
      get columnFilters() {
        return columnFilters;
      },
      get pagination() {
        return { pageIndex: 0, pageSize: limit };
      }
    },
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      rowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
    },
    onSortingChange: (updater) => {
      sorting = typeof updater === 'function' ? updater(sorting) : updater;
    },
    onColumnFiltersChange: (updater) => {
      columnFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
    },
    onColumnVisibilityChange: (updater) => {
      columnVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  });
</script>

<div class="bg-card text-card-foreground border-border w-full overflow-hidden rounded-xl border">
  {@render children?.()}

  <div class="max-h-150 overflow-y-auto">
    <Table>
      <DataTableHeader headers={table.getHeaderGroups()} />
      {#if status === 'pending'}
        {#if loadingDataNode}
          {@render loadingDataNode()}
        {:else}
          <DataTableLoading columnLength={table.getAllLeafColumns().length} rowLength={limit} />
        {/if}
      {:else if status === 'success'}
        {#if data && data.length}
          <DataTableBody rows={table.getRowModel().rows} />
        {/if}
      {/if}
    </Table>
  </div>

  <div class="w-full">
    {#if status === 'success'}
      {#if data && data.length === 0}
        {#if emptyDataNode}
          <div class="w-full">
            {@render emptyDataNode?.()}
          </div>
        {:else if emptyDataProps}
          <div class="w-full">
            <DataTableEmpty {...emptyDataProps} />
          </div>
        {:else}
          <DataTableEmpty description="Records will appear here when they are available." />
        {/if}
      {/if}
    {/if}
  </div>

  {#if status === 'error'}
    <DataTableError
      title={errorDataProps.title}
      errorDescription={errorDataProps.errorDescription}
      onRetry={errorDataProps.onRetry}
    />
  {/if}

  {#if showPagination}
    <div class="flex w-full justify-end">
      <DataTablePagination
        meta={paginationProps.meta}
        isLoading={paginationProps.isLoading}
        perPageOptions={paginationProps.perPageOptions}
        onPageChange={paginationProps.onPageChange}
        onPerPageChange={paginationProps.onPerPageChange}
        onCursorChange={paginationProps.onCursorChange}
      />
    </div>
  {/if}
</div>
