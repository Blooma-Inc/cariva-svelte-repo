<script lang="ts" module>
  export interface DataTableErrorProps {
    title: string;
    errorDescription: string;
    onRetry?: () => void;
  }
</script>

<script lang="ts">
  import { EmptyState } from '../empty-state/index.js';
  let { title, errorDescription, onRetry }: DataTableErrorProps = $props();
</script>

<EmptyState
  kind="error"
  {title}
  description={errorDescription || 'We couldn’t retrieve these records. Please try again.'}
  onAction={onRetry}
/>
