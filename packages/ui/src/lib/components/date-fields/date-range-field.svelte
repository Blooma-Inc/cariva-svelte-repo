<script lang="ts">
  import DateEditor from './date-editor.svelte';
  import type { DateRangeFieldProps } from './types.js';
  let {
    value = $bindable(),
    open = $bindable(false),
    ref = $bindable(null),
    ...props
  }: DateRangeFieldProps = $props();
</script>

<DateEditor
  range
  bind:value={value as never}
  bind:open
  bind:ref
  {...props}
  onValueChange={(next) => props.onValueChange?.(next as NonNullable<typeof value>)}
/>
