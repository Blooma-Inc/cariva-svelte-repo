<script lang="ts" module>
  import type { HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements';
  import { cn, type WithElementRef } from '$lib/utils.js';

  export type InputType = Exclude<HTMLInputTypeAttribute, 'file'>;
  export type InputProps = WithElementRef<HTMLInputAttributes>;
</script>

<script lang="ts">
  let {
    ref = $bindable(null),
    value = $bindable(),
    type,
    files = $bindable(),
    class: className,
    'data-slot': dataSlot = 'input',
    ...restProps
  }: InputProps = $props();
</script>

{#if type === 'file'}
  <input
    bind:this={ref}
    data-slot={dataSlot}
    class={cn(
      'bg-input/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 file:text-foreground placeholder:text-muted-foreground h-11 w-full min-w-0 rounded-xl border border-transparent px-3 py-1 text-base transition-[color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:border-neutral-950 focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm',
      className
    )}
    type="file"
    bind:files
    bind:value
    {...restProps}
  />
{:else}
  <input
    bind:this={ref}
    data-slot={dataSlot}
    class={cn(
      'aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 file:text-foreground placeholder:text-muted-foreground border-border h-11 w-full min-w-0 rounded-xl border px-3 py-1 text-base transition-colors file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-none focus-visible:border-neutral-950 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {type}
    bind:value
    {...restProps}
  />
{/if}
