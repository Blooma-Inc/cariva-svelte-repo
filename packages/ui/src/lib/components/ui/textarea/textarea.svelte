<script lang="ts" module>
  import { cn, type WithElementRef, type WithoutChildren } from '$lib/utils.js';
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  export type TextareaProps = WithoutChildren<WithElementRef<HTMLTextareaAttributes>>;
</script>

<script lang="ts">
  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    'data-slot': dataSlot = 'textarea',
    ...restProps
  }: TextareaProps = $props();
</script>

<textarea
  bind:this={ref}
  data-slot={dataSlot}
  class={cn(
    'aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 placeholder:text-muted-foreground border-border flex field-sizing-content min-h-20 w-full resize-none rounded-xl border bg-white px-3 py-3 text-base outline-0 transition-[color,box-shadow,background-color] outline-none focus-visible:border focus-visible:border-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
    className
  )}
  bind:value
  {...restProps}
></textarea>
