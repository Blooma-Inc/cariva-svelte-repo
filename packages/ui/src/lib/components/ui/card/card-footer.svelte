<script lang="ts">
  import { cn, type WithElementRef } from '$lib/utils.js';
  import type { HTMLAttributes } from 'svelte/elements';

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
  bind:this={ref}
  data-slot="card-footer"
  class={cn(
    'flex items-center rounded-b-xl px-4 group-data-[size=sm]/card:px-4 [.border-t]:pt-3 group-data-[size=sm]/card:[.border-t]:pt-1',
    className
  )}
  {...restProps}
>
  {@render children?.()}
</div>
