<script lang="ts" module>
  export interface DataTableErrorProps {
    title: string;
    errorDescription: string;
    onRetry?: () => void;
  }
</script>

<script lang="ts">
  import { CircleAlertIcon, RefreshCwIcon } from '@lucide/svelte';
  import { Button } from '../ui/button';
  import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';

  let { title, errorDescription, onRetry }: DataTableErrorProps = $props();
</script>

<Card class="border-destructive/40 bg-destructive/5 col-span-full w-full">
  <CardHeader>
    <div class="text-destructive flex items-center gap-2">
      <CircleAlertIcon class="h-5 w-5" />
      <CardTitle>{title}</CardTitle>
    </div>
  </CardHeader>

  <CardContent class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <CardDescription class="text-muted-foreground">{errorDescription}</CardDescription>

    {#if onRetry}
      <Button variant="outline" onclick={() => onRetry()} class="gap-2">
        <RefreshCwIcon class="h-4 w-4" />
        Retry
      </Button>
    {/if}
  </CardContent>
</Card>
