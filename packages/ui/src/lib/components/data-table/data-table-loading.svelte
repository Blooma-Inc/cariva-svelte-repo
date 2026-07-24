<script lang="ts" module>
  export interface DataTableLoaderProps {
    columnLength: number;
    rowLength: number;
  }
</script>

<script lang="ts">
  import { TableBody, TableCell, TableRow } from '$lib/components/ui/table';

  let { rowLength, columnLength }: DataTableLoaderProps = $props();

  const rows = $derived(Array.from({ length: rowLength }, (_, i) => i));
  const columns = $derived(Array.from({ length: columnLength }, (_, i) => i));
</script>

<TableBody class="w-full">
  {#each rows as row (row)}
    <TableRow class="w-full hover:bg-gray-50">
      {#each columns as column (column)}
        <TableCell>
          <div class="h-4 animate-pulse rounded bg-neutral-50"></div>
        </TableCell>
      {/each}
    </TableRow>
  {/each}
</TableBody>
