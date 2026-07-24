<script lang="ts" module>
  export interface CopyButtonProps {
    value: string;
    successMessage?: string;
    label?: string;
    showLabel?: boolean;
    disabled?: boolean;
    buttonProps: ButtonProps;
  }
</script>

<script lang="ts">
  import CopyIcon from '@lucide/svelte/icons/copy';
  import CheckIcon from '@lucide/svelte/icons/check';
  import { cn } from '$lib/utils';
  import { useCopy } from '$lib/hooks/use-copy.svelte';
  import Button, { type ButtonProps } from '$lib/components/ui/button/button.svelte';

  let {
    value,
    successMessage = 'Copied!',
    label,
    showLabel = true,
    disabled = false,
    buttonProps
  }: CopyButtonProps = $props();

  const copy = useCopy(
    () => value,
    () => successMessage
  );
  const isCopied = $derived(copy.buttonText === 'Copied!');
</script>

<Button {disabled} type="button" onclick={() => copy.handleCopy} {...buttonProps}>
  <span class={cn('transition-transform duration-200', isCopied ? 'scale-110' : 'scale-100')}>
    {#if isCopied}
      <CheckIcon class="animate-pop size-3" />
    {:else}
      <CopyIcon class="size-3" />
    {/if}
  </span>

  {#if showLabel}
    <span class="text-button transition-all duration-200">
      {#if label && !isCopied}
        {label}
      {:else}
        {copy.buttonText}
      {/if}
    </span>
  {/if}
</Button>
