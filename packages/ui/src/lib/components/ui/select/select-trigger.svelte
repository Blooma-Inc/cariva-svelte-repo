<script lang="ts">
  import * as Form from '$lib/components/ui/form';
  import { Select as SelectPrimitive } from 'bits-ui';
  import { cn, type WithoutChild } from '$lib/utils.js';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

  let {
    ref = $bindable(null),
    class: className,
    label,
    floatingLabel = true,
    children,
    size = 'default',
    ...restProps
  }: WithoutChild<SelectPrimitive.TriggerProps> & {
    label?: string;
    size?: 'sm' | 'default';
    floatingLabel?: boolean;
  } = $props();
</script>

<div class="group/select-field relative">
  <SelectPrimitive.Trigger
    bind:ref
    data-slot="select-trigger"
    data-size={size}
    class={cn(
      "data-placeholder:text-muted-foreground aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 border-border flex w-full items-center justify-between gap-1.5 rounded-xl border bg-white px-2 py-1 text-sm whitespace-nowrap transition-[color,box-shadow,background-color] outline-none focus-visible:border-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-11 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
      floatingLabel &&
        label &&
        'px-3 py-0 data-placeholder:not-data-[state=open]:not-focus:text-transparent data-[size=default]:h-14 data-[size=sm]:h-14 sm:data-[size=default]:h-16 sm:data-[size=sm]:h-16',
      className
    )}
    {...restProps}
  >
    <span
      class={cn(
        'flex min-w-0 flex-1 items-center',
        floatingLabel &&
          label &&
          'self-stretch pt-7 pb-2 group-has-[[data-placeholder]:not([data-state=open]):not(:focus)]/select-field:py-1'
      )}
    >
      {@render children?.()}
    </span>
    <span
      aria-hidden="true"
      class={cn(
        'text-muted-foreground pointer-events-none flex shrink-0 items-center justify-center',
        floatingLabel && label && 'bg-secondary text-secondary-foreground -mr-1 size-6 rounded-xl'
      )}
    >
      <ChevronDownIcon class="size-3" />
    </span>
  </SelectPrimitive.Trigger>

  {#if floatingLabel && label}
    <Form.Label
      class={cn(
        'text-foreground group-has-[[data-placeholder]:not([data-state=open]):not(:focus)]/select-field:text-muted-foreground pointer-events-none absolute top-3 left-3 text-xs leading-none transition-all duration-150 ease-out select-none group-has-[[data-placeholder]:not([data-state=open]):not(:focus)]/select-field:top-1/2 group-has-[[data-placeholder]:not([data-state=open]):not(:focus)]/select-field:-translate-y-1/2 group-has-[[data-placeholder]:not([data-state=open]):not(:focus)]/select-field:text-sm'
      )}
    >
      {label}
    </Form.Label>
  {/if}
</div>
