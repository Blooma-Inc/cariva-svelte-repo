<script lang="ts" module>
  import { type VariantProps, tv } from 'tailwind-variants';

  export const paragraphVariants = tv({
    base: 'font-sans text-foreground',
    variants: {
      size: {
        default: 'text-body',
        sm: 'text-body-sm',
        caption: 'text-caption'
      },
      muted: {
        true: 'text-muted-foreground'
      },
      balance: {
        true: 'text-balance'
      }
    },
    defaultVariants: {
      size: 'default'
    }
  });

  export type ParagraphVariants = VariantProps<typeof paragraphVariants>;
  export type ParagraphProps = WithElementRef<HTMLAttributes<HTMLParagraphElement>> &
    ParagraphVariants;
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn, type WithElementRef } from '../../../utils.js';

  let {
    class: className,
    size = 'default',
    muted = false,
    balance = false,
    children,
    ...restProps
  }: ParagraphProps = $props();
</script>

<p class={cn(paragraphVariants({ size, muted, balance }), className)} {...restProps}>
  {@render children?.()}
</p>
