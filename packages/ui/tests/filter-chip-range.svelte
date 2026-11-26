<script lang="ts">
  import FilterChip from '../src/lib/components/filter-chip/filter-chip.svelte';
  import type { FilterValue } from '../src/lib/components/filter-chip/types.js';

  let value = $state<FilterValue>({ min: 0, max: 500 });
</script>

<div class="dark" style="--primary: rgb(30, 120, 100); font-family: monospace;">
  <FilterChip label="Amount" bind:value mode="apply" defaultValue={{ min: 0, max: 500 }}>
    {#snippet children({ value: draft, setValue })}
      {@const range = draft as { min: number | null; max: number | null }}
      <label>
        Minimum
        <input
          type="number"
          value={range.min}
          oninput={(event) =>
            setValue({
              ...range,
              min: Number(event.currentTarget.value)
            })}
        />
      </label>
    {/snippet}
  </FilterChip>
</div>
