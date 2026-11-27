<script lang="ts">
  import DateTimeEditor from './datetime-editor.svelte';
  import type { DateTimeFieldProps } from './types.js';
  let {
    value = $bindable(),
    open = $bindable(false),
    ref = $bindable(null),
    ...props
  }: DateTimeFieldProps = $props();
</script>

<DateTimeEditor
  bind:value={value as never}
  bind:open
  bind:ref
  {...props}
  onValueChange={(next) => props.onValueChange?.(next as typeof value)}
/>
