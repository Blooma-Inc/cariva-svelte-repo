<script lang="ts">
  import DateEditor from './date-editor.svelte';
  import type { DateFieldProps } from './types.js';
  let {
    value = $bindable(),
    open = $bindable(false),
    ref = $bindable(null),
    ...props
  }: DateFieldProps = $props();
</script>

<DateEditor
  bind:value={value as never}
  bind:open
  bind:ref
  {...props}
  onValueChange={(next) => props.onValueChange?.(next as typeof value)}
/>
