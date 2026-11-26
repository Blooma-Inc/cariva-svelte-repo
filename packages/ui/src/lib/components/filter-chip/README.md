# FilterChip

```svelte
<script lang="ts">
  import { FilterChip, type FilterValue } from '@cariva/ui/components/filter-chip/index.js';

  let status = $state<FilterValue>(null);
</script>

<FilterChip
  label="Status"
  bind:value={status}
  options={[
    { value: 'pending', label: 'Pending', count: 12 },
    { value: 'approved', label: 'Approved', count: 0 }
  ]}
/>
```

`value` and `open` support binding or `onValueChange` / `onOpenChange` callbacks. `defaultValue` is the reset target and does not initialize `value`. Without a default, reset produces `null`, an empty array, or a recursively emptied object. Zero and false count as selections. Primitive selection arrays compare without regard to order, including arrays inside grouped objects.

Immediate mode commits each change. Choosing a single option closes the panel; multiple selection stays open. Done, Escape, and outside dismissal retain committed changes. With `mode="apply"`, edits and Clear affect a copied draft. Apply commits it; Cancel, Escape, outside dismissal, and custom `close()` discard it. The chip always summarizes the committed value. `showFooter={false}` hides the built-in actions; custom content can commit by updating the consumer's value directly if it supplies its own Apply control.

Options accept `value`, `label`, `count`, `disabled`, and `group`. Values must be unique primitives. Counts never determine availability. Above eight options, the list shows search and an eight-option preview. Searching matches labels across every option. Radio groups provide single-choice keyboard navigation; checkbox lists support Up/Down, Home, and End.

## Custom editor

```svelte
<script lang="ts">
  import { FilterChip, type FilterValue } from '@cariva/ui/components/filter-chip/index.js';
  import { Input } from '@cariva/ui/components/ui/input/index.js';

  let amount = $state<FilterValue>({ min: null, max: null });
</script>

<FilterChip label="Amount" bind:value={amount} mode="apply">
  {#snippet children({ value, setValue, close })}
    {@const range = value as { min: number | null; max: number | null }}
    <Input
      aria-label="Minimum amount"
      type="number"
      value={range.min}
      oninput={(event) =>
        setValue({
          ...range,
          min: event.currentTarget.value === '' ? null : Number(event.currentTarget.value)
        })}
    />
    <Input
      aria-label="Maximum amount"
      type="number"
      value={range.max}
      oninput={(event) =>
        setValue({
          ...range,
          max: event.currentTarget.value === '' ? null : Number(event.currentTarget.value)
        })}
    />
  {/snippet}
</FilterChip>
```

Custom content receives `{ value, setValue, close }`. Treat the supplied value as read-only and submit changes through `setValue`. Values use primitives, arrays, and plain objects; represent dates as strings. Use `formatSummary(value)` for domain-specific summaries. Built-in summaries support option labels, first selection plus `+N`, grouped objects, and `{ min, max }` ranges.

Desktop uses an anchored popover; below 768px it uses a modal bottom sheet. `side` and `align` configure desktop placement. The panel inherits CSS variables, font, color scheme, and light/dark class from its trigger. `leadingIcon` accepts a Lucide-compatible component. `disabled`, `class`, and `showFooter` customize presentation. `labels` overrides Clear, Done, Cancel, Apply, search, empty-search, remaining-count, remove-button, and one-sided-range text.

The application owns queries, record filtering, counts, validation, URL state, and persistence.

Run browser and value tests from the repository root with `pnpm --filter @cariva/ui exec vitest run --config vitest.config.ts`. To run only value tests without a browser: `pnpm --filter @cariva/ui exec vitest run --config vitest.config.ts --browser.enabled=false tests/filter-chip.test.ts`.
