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
    required,
    children,
    size = 'default',
    ...restProps
  }: WithoutChild<SelectPrimitive.TriggerProps> & {
    label?: string;
    size?: 'sm' | 'default';
    floatingLabel?: boolean;
    required?: boolean;
  } = $props();

  let focused = $state(false);
  let isFloating = $derived(focused || children !== undefined);
</script>

<div class="relative" onfocusin={() => (focused = true)} onfocusout={() => (focused = false)}>
  <SelectPrimitive.Trigger
    bind:ref
    data-slot="select-trigger"
    data-size={size}
    class={cn(
      "data-placeholder:text-muted-foreground aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 border-border flex w-full items-center justify-between gap-1.5 rounded-xl border bg-white px-2 py-1 text-sm whitespace-nowrap transition-[color,box-shadow,background-color] outline-none focus-visible:border-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-11 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
      className
    )}
    {...restProps}
  >
    {@render children?.()}
    <ChevronDownIcon class="text-muted-foreground pointer-events-none size-3" />
  </SelectPrimitive.Trigger>

  {#if floatingLabel && label}
    <Form.Label
      class={cn(
        'text-muted-foreground pointer-events-none absolute left-3 transition-all duration-150 ease-out select-none',
        isFloating
          ? 'bg-background text-foreground top-0 -translate-y-1/2 px-1 text-xs'
          : 'top-1/2 -translate-y-1/2 text-sm'
      )}
    >
      {label}
      {#if required}
        <small class="text-destructive">*</small>
      {/if}
    </Form.Label>
  {/if}
</div>
