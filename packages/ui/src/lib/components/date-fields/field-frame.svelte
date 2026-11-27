<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils.js';
  import { InputGroup, InputGroupAddon } from '$lib/components/ui/input-group/index.js';
  let {
    label,
    floatingLabel = true,
    disabled = false,
    invalid = false,
    class: className,
    children,
    actions
  }: {
    label: Snippet;
    floatingLabel?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    class?: string;
    children: Snippet;
    actions?: Snippet;
  } = $props();
</script>

<div class={cn('flex min-w-0 flex-col gap-2', className)}>
  {#if !floatingLabel}<div class="text-sm font-medium">{@render label()}</div>{/if}
  <InputGroup
    class={cn(
      'bg-background dark:focus-within:border-ring h-auto min-h-14 focus-within:border-neutral-950 sm:min-h-16',
      disabled && 'pointer-events-none opacity-50',
      invalid &&
        'border-destructive ring-destructive/20 focus-within:border-destructive dark:ring-destructive/40 dark:focus-within:border-destructive ring-3'
    )}
  >
    <div class="flex min-w-0 flex-1 flex-col gap-1 px-3 py-3">
      {#if floatingLabel}<div class="text-muted-foreground text-[10px] leading-none font-medium">
          {@render label()}
        </div>{/if}
      {@render children()}
    </div>
    {#if actions}
      <InputGroupAddon align="inline-end" class="gap-0.5">
        {@render actions()}
      </InputGroupAddon>
    {/if}
  </InputGroup>
</div>
