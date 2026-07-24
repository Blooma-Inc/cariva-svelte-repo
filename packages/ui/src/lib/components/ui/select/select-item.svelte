<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui';
  import { cn, type WithoutChild } from '$lib/utils.js';
  import { CircleCheckIcon } from '@lucide/svelte';

  let {
    ref = $bindable(null),
    class: className,
    value,
    label,
    children: childrenProp,
    ...restProps
  }: WithoutChild<SelectPrimitive.ItemProps> = $props();
</script>

<SelectPrimitive.Item
  bind:ref
  {value}
  data-slot="select-item"
  class={cn(
    "focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex w-full cursor-default items-center gap-2.5 rounded-xl p-2 text-sm font-medium outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
    className
  )}
  {...restProps}
>
  {#snippet children({ selected, highlighted })}
    <span class="absolute right-3 flex size-1 items-center justify-center">
      {#if selected}
        <CircleCheckIcon class="cn-select-item-indicator-icon size-3" />
      {/if}
    </span>
    <span
      data-selected={selected}
      class="flex flex-1 shrink-0 gap-2 whitespace-nowrap text-neutral-600 data-[selected=true]:text-neutral-950"
    >
      {#if childrenProp}
        {@render childrenProp({ selected, highlighted })}
      {:else}
        {label || value}
      {/if}
    </span>
  {/snippet}
</SelectPrimitive.Item>
