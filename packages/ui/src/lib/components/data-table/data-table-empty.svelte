<script lang="ts" module>
  import type { EmptyStateProps } from '../empty-state/index.js';
  export interface DataTableEmptyProps {
    title?: string;
    description: string;
    kind?: EmptyStateProps['kind'];
    icon?: EmptyStateProps['icon'];
    showAction?: boolean;
    actionFn?: () => void;
    actionText?: string;
  }
</script>

<script lang="ts">
  import { EmptyState } from '../empty-state/index.js';
  let {
    title = 'No records yet',
    description,
    kind = 'empty',
    icon,
    showAction,
    actionFn,
    actionText
  }: DataTableEmptyProps = $props();
</script>

<EmptyState
  {kind}
  {title}
  {description}
  {icon}
  onAction={showAction ? actionFn : undefined}
  actionLabel={actionText}
/>
