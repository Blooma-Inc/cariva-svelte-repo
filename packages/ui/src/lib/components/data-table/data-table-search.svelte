<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Input } from '$lib/components/ui/input/index.js';
  import { cn } from '$lib/utils.js';

  let {
    ref = $bindable(null),
    value = $bindable(''),
    class: className,
    ...restProps
  }: ComponentProps<typeof Input> = $props();
</script>

<Input
  bind:ref
  bind:value
  data-slot="data-table-search-input"
  data-sidebar="input"
  type="text"
  class={cn(
    'h-9 w-full max-w-80 bg-white text-sm shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0',
    className
  )}
  {...restProps}
/>
