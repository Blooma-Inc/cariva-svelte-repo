<script lang="ts" module>
  import type { RowData, Row } from '@tanstack/table-core';
  export interface DataTableBodyProps<TData extends RowData> {
    rows: Row<TData>[];
  }
</script>

<script lang="ts" generics="TData extends RowData">
  import { TableBody, TableRow, TableCell } from '$lib/components/ui/table';
  import FlexRender from '../ui/data-table/flex-render.svelte';

  let { rows }: DataTableBodyProps<TData> = $props();
</script>

<TableBody>
  {#each rows as row (row)}
    <TableRow data-state={row.getIsSelected() ? 'selected' : undefined} class="group/row">
      {#each row.getVisibleCells() as cell (cell.id)}
        <TableCell class={cell.column.columnDef.meta?.className ?? ''}>
          <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
        </TableCell>
      {/each}
    </TableRow>
  {/each}
</TableBody>
