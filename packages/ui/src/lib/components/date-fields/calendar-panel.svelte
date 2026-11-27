<script lang="ts">
  import { DatePicker, DateRangePicker } from 'bits-ui';
  import type { DateValue } from '@internationalized/date';
  import ChevronLeft from '@lucide/svelte/icons/chevron-left';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import { actionClass } from './shared.js';
  let {
    range = false,
    minValue,
    maxValue
  }: { range?: boolean; minValue?: DateValue; maxValue?: DateValue } = $props();
  const P = $derived(range ? DateRangePicker : DatePicker);
  const years = $derived(
    Array.from(
      { length: (maxValue?.year ?? 2100) - (minValue?.year ?? 1900) + 1 },
      (_, i) => (minValue?.year ?? 1900) + i
    )
  );
</script>

<P.Calendar>
  {#snippet children({ months, weekdays })}
    <div class="flex flex-col gap-6 sm:flex-row">
      {#each months as month, index (month.value.toString())}
        <div class="w-76 max-w-full">
          <P.Header class="mb-4 flex items-center justify-between gap-1">
            <P.PrevButton class={actionClass} aria-label="Previous month"
              ><ChevronLeft class="size-4" /></P.PrevButton
            >
            <div class="flex items-center gap-2">
              <P.MonthSelect
                aria-label={`Month ${index + 1}`}
                class="bg-input/50 focus-visible:ring-ring h-9 min-w-32 rounded-lg py-2 pr-8 pl-3 text-sm outline-none focus-visible:ring-2"
              />
              <P.YearSelect
                {years}
                aria-label={`Year ${index + 1}`}
                class="bg-input/50 focus-visible:ring-ring h-9 min-w-20 rounded-lg py-2 pr-8 pl-3 text-sm outline-none focus-visible:ring-2"
              />
            </div>
            <P.NextButton class={actionClass} aria-label="Next month"
              ><ChevronRight class="size-4" /></P.NextButton
            >
          </P.Header>
          <P.Grid class="mx-auto w-70 max-w-full border-collapse">
            <P.GridHead
              ><P.GridRow
                >{#each weekdays as day, i (i)}<P.HeadCell
                    class="text-muted-foreground h-9 w-10 text-center text-xs font-normal"
                    >{day.slice(0, 2)}</P.HeadCell
                  >{/each}</P.GridRow
              ></P.GridHead
            >
            <P.GridBody>
              {#each month.weeks as week, i (i)}
                <P.GridRow>
                  {#each week as date (date.toString())}
                    <P.Cell {date} month={month.value} class="p-0">
                      <P.Day
                        class="hover:bg-accent focus-visible:ring-ring data-selected:bg-primary data-selected:text-primary-foreground data-range-middle:bg-primary/10 data-range-middle:text-foreground data-range-start:bg-primary data-range-start:text-primary-foreground data-range-end:bg-primary data-range-end:text-primary-foreground relative flex size-10 items-center justify-center rounded-lg text-sm outline-none focus-visible:ring-2 data-disabled:pointer-events-none data-disabled:opacity-30 data-outside-month:pointer-events-none data-outside-month:opacity-30 data-range-middle:rounded-none data-today:after:absolute data-today:after:bottom-1 data-today:after:size-1 data-today:after:rounded-full data-today:after:bg-current data-unavailable:line-through"
                      />
                    </P.Cell>
                  {/each}
                </P.GridRow>
              {/each}
            </P.GridBody>
          </P.Grid>
        </div>
      {/each}
    </div>
  {/snippet}
</P.Calendar>
