<script lang="ts" module>
  import type { Component, Snippet } from 'svelte';
  import type { IconProps } from '@lucide/svelte';
  import type { ButtonVariant } from '../ui/button/index.js';
  export interface EmptyStateProps {
    kind?: 'empty' | 'no-results' | 'error';
    title: string;
    description?: string;
    icon?: Component<IconProps>;
    compact?: boolean;
    bordered?: boolean;
    actionLabel?: string;
    onAction?: () => void;
    actionVariant?: ButtonVariant;
    actionDisabled?: boolean;
    actions?: Snippet;
    class?: string;
  }
</script>

<script lang="ts">
  import Inbox from '@lucide/svelte/icons/inbox';
  import Search from '@lucide/svelte/icons/search';
  import CloudAlert from '@lucide/svelte/icons/cloud-alert';
  import RefreshCw from '@lucide/svelte/icons/refresh-cw';
  import Plus from '@lucide/svelte/icons/plus';
  import { Empty, EmptyMedia } from '../ui/empty/index.js';
  import { Button } from '../ui/button/index.js';
  import { cn } from '$lib/utils.js';
  let {
    kind = 'empty',
    title,
    description,
    icon,
    compact = false,
    bordered = false,
    actionLabel,
    onAction,
    actionVariant,
    actionDisabled = false,
    actions,
    class: className
  }: EmptyStateProps = $props();
  const Icon = $derived(
    icon ?? (kind === 'error' ? CloudAlert : kind === 'no-results' ? Search : Inbox)
  );
</script>

<Empty
  data-slot="empty-state"
  data-kind={kind}
  role={kind === 'error' ? 'alert' : undefined}
  class={cn(
    'gap-5 border-solid',
    compact
      ? 'min-h-0 flex-row items-start justify-start gap-3 p-4 text-left text-wrap'
      : 'min-h-72 px-6 py-10 sm:px-10 sm:py-12',
    bordered && 'border-border bg-card text-card-foreground border',
    className
  )}
>
  <EmptyMedia
    class={cn(
      'mb-0 shrink-0 rounded-2xl',
      compact ? 'size-10 rounded-xl' : 'size-16',
      kind === 'error'
        ? 'bg-warning/10 text-warning'
        : kind === 'no-results'
          ? 'bg-muted text-muted-foreground'
          : 'bg-primary/10 text-primary'
    )}
  >
    <Icon class={compact ? 'size-5' : 'size-7'} aria-hidden="true" />
  </EmptyMedia>
  <div
    class={cn(
      'flex min-w-0 flex-col',
      compact ? 'flex-1 items-start gap-2' : 'w-full max-w-sm items-center gap-5'
    )}
  >
    <div class="space-y-2">
      <h3 class={cn('font-semibold text-balance', compact ? 'text-sm' : 'text-lg')}>{title}</h3>
      {#if description}<p
          class={cn(
            'text-muted-foreground text-sm leading-relaxed break-words whitespace-pre-wrap',
            !compact && 'min-h-12'
          )}
        >
          {description}
        </p>{/if}
    </div>
    {#if actions}<div class={cn('flex flex-wrap items-center gap-2', !compact && 'justify-center')}>
        {@render actions()}
      </div>
    {:else if onAction}<Button
        type="button"
        variant={actionVariant ?? (kind === 'empty' ? 'default' : 'secondary')}
        disabled={actionDisabled}
        onclick={onAction}
        >{#if kind === 'error'}<RefreshCw
            class="size-3"
            aria-hidden="true"
          />{:else if kind === 'empty'}<Plus
            class="size-3"
            aria-hidden="true"
          />{/if}{actionLabel ??
          (kind === 'error'
            ? 'Try again'
            : kind === 'no-results'
              ? 'Clear filters'
              : 'Get started')}</Button
      >{/if}
  </div>
</Empty>
