<script lang="ts" module>
  import type { CopyButtonProps } from '$lib/components/copy-button/copy-button.svelte';

  export interface TextWithCopyProps {
    value: string;
    copyProps: CopyButtonProps;
  }
</script>

<script lang="ts">
  import CopyButton from '$lib/components/copy-button/copy-button.svelte';

  let { value, copyProps }: TextWithCopyProps = $props();
</script>

<div class="flex items-center gap-1">
  <span class="max-w-20 flex-1 truncate">{value}</span>
  <CopyButton {...copyProps} />
</div>
