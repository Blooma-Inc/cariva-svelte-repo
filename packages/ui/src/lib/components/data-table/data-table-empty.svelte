<script lang="ts" module>
  export interface DataTableEmptyProps {
    description: string;
    showAction?: boolean;
    actionFn?: () => void;
    actionText?: string;
  }
</script>

<script lang="ts">
  import { FileIcon, PlusIcon } from '@lucide/svelte';
  import { Button } from '../ui/button';
  import { Paragraph } from '../ui/typography';

  let { description, showAction, actionFn, actionText }: DataTableEmptyProps = $props();
</script>

<div class="mx-auto flex h-96 w-full max-w-96 items-center justify-center">
  <div class="flex flex-col items-center justify-center space-y-4">
    <figure
      class="flex aspect-auto h-28 w-28 items-center justify-center rounded-full bg-neutral-50"
    >
      <FileIcon class="size-16" />
    </figure>

    <div class="flex w-full flex-col items-center justify-center space-y-4 text-center">
      <Paragraph class="text-neutral-500">{description}</Paragraph>

      {#if showAction}
        <div
          class="flex w-full flex-col items-center justify-start space-y-4 md:w-fit md:flex-row md:space-y-0 md:space-x-4"
        >
          <Button size="lg" variant="info" class="w-full" onclick={() => actionFn?.()}>
            <PlusIcon size={17} />
            {actionText}
          </Button>
        </div>
      {/if}
    </div>
  </div>
</div>
