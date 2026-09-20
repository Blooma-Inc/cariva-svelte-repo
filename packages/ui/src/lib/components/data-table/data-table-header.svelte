<script lang="ts" module>
  import type { RowData, HeaderGroup } from '@tanstack/table-core';
  export interface DataTableHeaderProps<TData extends RowData> {
    headers: HeaderGroup<TData>[];
  }
</script>

<script lang="ts" generics="TData extends RowData">
  import { TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import FlexRender from '../ui/data-table/flex-render.svelte';

  let { headers }: DataTableHeaderProps<TData> = $props();
</script>

<TableHeader class="static">
  {#each headers as headerGroup (headerGroup.id)}
    <TableRow class="group/row">
      {#each headerGroup.headers as header (header.id)}
        <TableHead colspan={header.colSpan} class={header.column.columnDef.meta?.className ?? ''}>
          {#if !header.isPlaceholder}
            <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
          {/if}
        </TableHead>
      {/each}
    </TableRow>
  {/each}
</TableHeader>
