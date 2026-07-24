<script lang="ts" module>
  export interface OffsetPaginationMeta {
    type: 'offset';
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  }

  export interface CursorPaginationMeta {
    type: 'cursor';
    perPage: number;
    nextCursor: string | null;
    prevCursor: string | null;
  }

  export function toOffsetPagination(meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  }): OffsetPaginationMeta {
    return {
      type: 'offset',
      total: meta.total,
      page: meta.page,
      perPage: meta.perPage,
      totalPages: meta.totalPages
    };
  }

  export function toCursorPagination(meta: {
    perPage: number;
    nextCursor: string | null;
    prevCursor: string | null;
  }): CursorPaginationMeta {
    return {
      type: 'cursor',
      perPage: meta.perPage,
      nextCursor: meta.nextCursor,
      prevCursor: meta.prevCursor
    };
  }

  export type PaginationMeta = OffsetPaginationMeta | CursorPaginationMeta;
  export interface DataTablePaginationProps {
    meta: PaginationMeta;
    isLoading?: boolean;
    perPageOptions?: number[];
    onPerPageChange?: (perPage: number) => void;
    // offset-only
    onPageChange?: (page: number) => void;
    // cursor-only
    onCursorChange?: (direction: 'next' | 'prev') => void;
  }
</script>

<script lang="ts">
  import ChevronLeft from '@lucide/svelte/icons/chevron-left';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import ChevronsLeft from '@lucide/svelte/icons/chevrons-left';
  import ChevronsRight from '@lucide/svelte/icons/chevrons-right';

  import { Button } from '$lib/components/ui/button';
  import * as Select from '$lib/components/ui/select';

  let {
    meta,
    isLoading = false,
    perPageOptions = [10, 20, 50, 100],
    onPerPageChange,
    onPageChange,
    onCursorChange
  }: DataTablePaginationProps = $props();

  const rangeLabel = $derived.by(() => {
    if (meta.type !== 'offset') return null;
    const start = (meta.page - 1) * meta.perPage + 1;
    const end = Math.min(meta.page * meta.perPage, meta.total);
    return meta.total === 0 ? '0 results' : `${start}–${end} of ${meta.total}`;
  });
</script>

<div class="flex items-center justify-between gap-4 px-2 py-3">
  <div class="text-muted-foreground text-sm">
    {#if meta.type === 'offset'}
      {rangeLabel}
    {/if}
  </div>

  <div class="flex items-center gap-6">
    <div class="flex items-center gap-2">
      <span class="text-muted-foreground text-sm">Rows per page</span>
      <Select.Root
        type="single"
        value={String(meta.perPage)}
        onValueChange={(value) => onPerPageChange?.(Number(value))}
      >
        <Select.Trigger size="sm" class="w-fit">
          {meta.perPage}
        </Select.Trigger>
        <Select.Content>
          {#each perPageOptions as option (option)}
            <Select.Item value={String(option)}>{option}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>

    {#if meta.type === 'offset'}
      <div class="flex items-center gap-1">
        <span class="text-muted-foreground text-sm">
          Page {meta.page} of {Math.max(meta.totalPages, 1)}
        </span>
        <Button
          variant="outline"
          size="icon"
          disabled={isLoading || meta.page <= 1}
          onclick={() => onPageChange?.(1)}
        >
          <ChevronsLeft class="size-3" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={isLoading || meta.page <= 1}
          onclick={() => onPageChange?.(meta.page - 1)}
        >
          <ChevronLeft class="size-3" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={isLoading || meta.page >= meta.totalPages}
          onclick={() => onPageChange?.(meta.page + 1)}
        >
          <ChevronRight class="size-3" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={isLoading || meta.page >= meta.totalPages}
          onclick={() => onPageChange?.(meta.totalPages)}
        >
          <ChevronsRight class="size-3" />
        </Button>
      </div>
    {:else}
      <div class="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          disabled={isLoading || !meta.prevCursor}
          onclick={() => onCursorChange?.('prev')}
        >
          <ChevronLeft class="size-3" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          disabled={isLoading || !meta.nextCursor}
          onclick={() => onCursorChange?.('next')}
        >
          <ChevronRight class="size-3" />
        </Button>
      </div>
    {/if}
  </div>
</div>
