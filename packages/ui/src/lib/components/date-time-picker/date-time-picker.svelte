<script lang="ts">
  import { TimeField } from 'bits-ui';
  import { CalendarDateTime, Time, type DateValue } from '@internationalized/date';
  import CalendarIcon from '@lucide/svelte/icons/calendar-days';
  import ClockIcon from '@lucide/svelte/icons/clock-3';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
  import { Calendar } from '$lib/components/ui/calendar/index.js';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { cn } from '$lib/utils.js';

  let {
    value = $bindable<CalendarDateTime | undefined>(),
    label = 'Date and time',
    description,
    timezone,
    disabled = false,
    invalid = false,
    locale = 'en-US',
    onValueChange,
    class: className
  }: {
    value?: CalendarDateTime;
    label?: string;
    description?: string;
    timezone?: string;
    disabled?: boolean;
    invalid?: boolean;
    locale?: string;
    onValueChange?: (value: CalendarDateTime | undefined) => void;
    class?: string;
  } = $props();

  const id = $props.id();
  let open = $state(false);
  const time = $derived(value ? new Time(value.hour, value.minute) : undefined);
  const formatted = $derived(
    value
      ? new Intl.DateTimeFormat(locale, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'UTC'
        }).format(value.toDate('UTC'))
      : ''
  );

  function update(next: CalendarDateTime | undefined) {
    value = next;
    onValueChange?.(next);
  }

  function selectDate(date: DateValue | undefined) {
    if (!date) return;
    update(
      new CalendarDateTime(date.year, date.month, date.day, value?.hour ?? 9, value?.minute ?? 0)
    );
  }

  function selectTime(next: Time | undefined) {
    if (value && next) update(value.set({ hour: next.hour, minute: next.minute }));
  }
</script>

<div class={cn('flex w-full flex-col gap-2', className)}>
  <Popover.Root bind:open>
    <Popover.Trigger
      {disabled}
      aria-label={`${label}${formatted ? `: ${formatted}` : ''}`}
      aria-describedby={description ? `${id}-description` : undefined}
      aria-invalid={invalid}
      class={cn(
        'border-input bg-background ring-ring/30 focus-visible:border-ring relative flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 text-left text-sm transition-shadow outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50',
        open && 'border-ring ring-3',
        invalid && 'border-destructive ring-destructive/20'
      )}
    >
      <CalendarIcon class="text-muted-foreground size-4 shrink-0" />
      <span
        class={cn(
          'text-muted-foreground pointer-events-none absolute left-10 transition-all',
          value || open
            ? 'bg-background text-foreground top-0 -translate-y-1/2 px-1 text-xs'
            : 'top-1/2 -translate-y-1/2'
        )}
      >
        {label}
      </span>
      <span class="min-w-0 flex-1 truncate"
        >{formatted || (open ? 'Select date and time' : '')}</span
      >
      <ChevronDownIcon class="text-muted-foreground size-4 shrink-0" />
    </Popover.Trigger>
    <Popover.Content
      align="start"
      sideOffset={8}
      aria-label={label}
      class="max-h-[min(85dvh,640px)] w-auto max-w-[calc(100vw-2rem)] gap-0 overflow-y-auto rounded-2xl p-0 shadow-xl"
    >
      <div class="border-b px-4 py-3">
        <p class="text-sm font-semibold">{label}</p>
        {#if timezone}<p class="text-muted-foreground mt-1 text-xs">Times in {timezone}</p>{/if}
      </div>
      <Calendar
        type="single"
        {value}
        onValueChange={selectDate}
        {locale}
        captionLayout="dropdown"
      />
      <div class="border-t px-4 py-4">
        <TimeField.Root
          value={time}
          onValueChange={selectTime}
          hourCycle={12}
          granularity="minute"
          {locale}
          disabled={!value}
        >
          <TimeField.Label class="mb-2 flex items-center gap-2 text-sm font-medium"
            ><ClockIcon class="text-muted-foreground size-4" />Time</TimeField.Label
          >
          <TimeField.Input
            class="border-input bg-background flex min-h-11 items-center justify-center gap-1 rounded-xl border px-3 py-2 data-disabled:opacity-50"
          >
            {#snippet children({ segments })}
              {#each segments as segment, segmentIndex (segmentIndex)}
                <TimeField.Segment
                  part={segment.part}
                  class="data-[segment=literal]:text-muted-foreground focus:bg-primary focus:text-primary-foreground data-[segment=dayPeriod]:bg-primary/10 data-[segment=dayPeriod]:text-primary data-[segment=dayPeriod]:focus:bg-primary data-[segment=dayPeriod]:focus:text-primary-foreground rounded-md px-1.5 py-1 text-sm font-medium tabular-nums outline-none data-[segment=dayPeriod]:ml-2 data-[segment=literal]:px-0"
                >
                  {segment.value}
                </TimeField.Segment>
              {/each}
            {/snippet}
          </TimeField.Input>
        </TimeField.Root>
        <p class="text-muted-foreground mt-2 text-xs">
          {value
            ? 'Type a time or use the arrow keys. Select AM or PM.'
            : 'Choose a date to set the time.'}
        </p>
      </div>
      <div class="bg-popover sticky bottom-0 flex justify-between gap-3 border-t px-4 py-3">
        <Button variant="ghost" disabled={!value} onclick={() => update(undefined)}>Clear</Button>
        <Button onclick={() => (open = false)}>Done</Button>
      </div>
    </Popover.Content>
  </Popover.Root>
  {#if description}<p
      id={`${id}-description`}
      class={cn('text-muted-foreground text-xs', invalid && 'text-destructive')}
    >
      {description}
    </p>{/if}
</div>
