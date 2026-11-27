<script lang="ts">
  import DateTimeEditor from './datetime-editor.svelte';
  import type { DateRangeTimeFieldProps } from './types.js';
  let {
    value = $bindable(),
    open = $bindable(false),
    ref = $bindable(null),
    ...props
  }: DateRangeTimeFieldProps = $props();
</script>

<DateTimeEditor
  range
  bind:value={value as never}
  bind:open
  bind:ref
  {...props}
  onValueChange={(next) => props.onValueChange?.(next as NonNullable<typeof value>)}
/>
