<script lang="ts" module>
  import { type VariantProps, tv } from 'tailwind-variants';

  export const headingVariants = tv({
    base: 'font-sans text-foreground',
    variants: {
      level: {
        h1: 'text-display',
        h2: 'text-h2',
        h3: 'text-h3'
      },
      muted: {
        true: 'text-muted-foreground'
      },
      balance: {
        true: 'text-balance'
      }
    },
    defaultVariants: {
      level: 'h2'
    }
  });

  export type HeadingVariants = VariantProps<typeof headingVariants>;
  export type HeadingProps = WithElementRef<HTMLAttributes<HTMLHeadingElement>> & HeadingVariants;
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn, type WithElementRef } from '../../../utils.js';

  let {
    class: className,
    level = 'h2',
    muted,
    balance,
    children,
    ...restProps
  }: HeadingProps = $props();
</script>

{#if level === 'h1'}
  <h1 class={cn(headingVariants({ level, muted, balance }), className)} {...restProps}>
    {@render children?.()}
  </h1>
{:else if level === 'h2'}
  <h2 class={cn(headingVariants({ level, muted, balance }), className)} {...restProps}>
    {@render children?.()}
  </h2>
{:else if level === 'h3'}
  <h3 class={cn(headingVariants({ level, muted, balance }), className)} {...restProps}>
    {@render children?.()}
  </h3>
{/if}
