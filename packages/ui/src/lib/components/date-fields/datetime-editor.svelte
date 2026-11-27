<script lang="ts">
  import {
    CalendarDateTime,
    toCalendarDate,
    Time,
    type CalendarDate
  } from '@internationalized/date';
  import { tick, untrack } from 'svelte';
  import DateField from './date-field.svelte';
  import DateRangeField from './date-range-field.svelte';
  import TimeField from './time-field.svelte';
  import FormAdapter from './form-adapter.svelte';
  import { combineDateTime, dateTimeBoundary, focusEditor } from './shared.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { cn } from '$lib/utils.js';
  import type { DateRangeTimeFieldProps, DateTimeRangeValue, EditState } from './types.js';

  const uid = $props.id();
  let {
    range = false,
    value = $bindable<CalendarDateTime | DateTimeRangeValue | undefined>(undefined),
    defaultValue,
    onValueChange,
    label,
    description,
    error,
    required = false,
    disabled = false,
    readonly = false,
    floatingLabel = true,
    showClear = true,
    name,
    startName,
    endName,
    form,
    id = uid,
    class: className,
    'aria-describedby': describedBy,
    ref = $bindable(null),
    onEditStateChange,
    internal = false,
    locale = 'en-GB',
    placeholder,
    minValue,
    maxValue,
    isDateDisabled,
    isDateUnavailable,
    open = $bindable(false),
    onOpenChange,
    numberOfMonths = 1,
    hourCycle = 24,
    granularity = 'minute'
  }: Omit<DateRangeTimeFieldProps, 'value' | 'defaultValue' | 'onValueChange'> & {
    range?: boolean;
    name?: string;
    value?: CalendarDateTime | DateTimeRangeValue;
    defaultValue?: CalendarDateTime | DateTimeRangeValue;
    onValueChange?: (value: CalendarDateTime | DateTimeRangeValue | undefined) => void;
  } = $props();
  const initial = untrack(() => defaultValue);
  if (value === undefined && initial !== undefined) value = initial;
  function endpoints(next: typeof value) {
    return range
      ? (next as DateTimeRangeValue | undefined)
      : { start: next as CalendarDateTime | undefined, end: undefined };
  }
  const starting = untrack(() => endpoints(value));
  let startDate = $state<CalendarDate | undefined>(
    starting?.start ? toCalendarDate(starting.start) : undefined
  );
  let endDate = $state<CalendarDate | undefined>(
    starting?.end ? toCalendarDate(starting.end) : undefined
  );
  let startTime = $state<Time | undefined>(
    starting?.start
      ? new Time(
          starting.start.hour,
          starting.start.minute,
          starting.start.second,
          starting.start.millisecond
        )
      : undefined
  );
  let endTime = $state<Time | undefined>(
    starting?.end
      ? new Time(
          starting.end.hour,
          starting.end.minute,
          starting.end.second,
          starting.end.millisecond
        )
      : undefined
  );
  let dateEdit = $state<EditState>({ incomplete: false, hasInput: false });
  let startEdit = $state<EditState>({ incomplete: false, hasInput: false });
  let endEdit = $state<EditState>({ incomplete: false, hasInput: false });
  let revision = $state(0);
  let seen = value;
  const dateRange = $derived({ start: startDate, end: endDate });
  const start = $derived(
    !dateEdit.incomplete && !startEdit.incomplete
      ? combineDateTime(startDate, startTime)
      : undefined
  );
  const end = $derived(
    !dateEdit.incomplete && !endEdit.incomplete ? combineDateTime(endDate, endTime) : undefined
  );
  const hasInput = $derived(
    !!startDate ||
      !!endDate ||
      !!startTime ||
      !!endTime ||
      dateEdit.hasInput ||
      startEdit.hasInput ||
      endEdit.hasInput
  );
  const incomplete = $derived(hasInput && (!start || (range && !end)));
  const message = $derived(
    error ||
      (incomplete ? 'Complete every date and time.' : '') ||
      (range && start && end && end.compare(start) < 0
        ? 'End must be on or after start. Overnight periods need a later end date.'
        : '') ||
      ([start, end].some((item) => item && minValue && item.compare(minValue) < 0)
        ? `Choose a date and time at or after ${minValue}.`
        : '') ||
      ([start, end].some((item) => item && maxValue && item.compare(maxValue) > 0)
        ? `Choose a date and time at or before ${maxValue}.`
        : '') ||
      ([startDate, endDate].some(
        (item) => item && (isDateDisabled?.(item) || isDateUnavailable?.(item))
      )
        ? 'This date is unavailable.'
        : '')
  );
  const ids = $derived(
    [describedBy, description ? `${id}-description` : '', message ? `${id}-error` : '']
      .filter(Boolean)
      .join(' ') || undefined
  );
  function publish() {
    const next = range ? { start, end } : start;
    value = next;
    seen = next;
    onValueChange?.(next);
    onEditStateChange?.({ incomplete: !!incomplete, hasInput });
  }
  function load(next: typeof value) {
    const parts = endpoints(next);
    startDate = parts?.start ? toCalendarDate(parts.start) : undefined;
    endDate = parts?.end ? toCalendarDate(parts.end) : undefined;
    startTime = parts?.start
      ? new Time(parts.start.hour, parts.start.minute, parts.start.second, parts.start.millisecond)
      : undefined;
    endTime = parts?.end
      ? new Time(parts.end.hour, parts.end.minute, parts.end.second, parts.end.millisecond)
      : undefined;
    dateEdit = { incomplete: false, hasInput: false };
    startEdit = { incomplete: false, hasInput: false };
    endEdit = { incomplete: false, hasInput: false };
    open = false;
    onOpenChange?.(false);
    revision += 1;
  }
  function reset() {
    load(initial);
    publish();
  }
  async function clear() {
    load(undefined);
    publish();
    await tick();
    focusEditor(ref);
  }
  $effect(() => {
    if (value !== seen) {
      seen = value;
      untrack(() => load(value));
    }
  });
</script>

<div bind:this={ref} class={cn('relative min-w-0', className)}>
  <fieldset class="flex min-w-0 flex-col gap-3" {disabled} aria-describedby={ids}>
    <legend class="mb-3 text-sm font-medium">{label}</legend>
    {#key revision}
      {#if range}
        <DateRangeField
          label="Date range"
          value={dateRange}
          onValueChange={(next) => {
            startDate = next.start;
            endDate = next.end;
            publish();
          }}
          onEditStateChange={(next) => {
            dateEdit = next;
            publish();
          }}
          bind:open
          {onOpenChange}
          {floatingLabel}
          {locale}
          {placeholder}
          {numberOfMonths}
          minValue={minValue ? toCalendarDate(minValue) : undefined}
          maxValue={maxValue ? toCalendarDate(maxValue) : undefined}
          {isDateDisabled}
          {isDateUnavailable}
          {readonly}
          {disabled}
          showClear={false}
          internal
          aria-describedby={ids}
        />
      {/if}
      <div class="grid min-w-0 gap-3 sm:grid-cols-2">
        {#if !range}
          <DateField
            label="Date"
            value={startDate}
            onValueChange={(next) => {
              startDate = next;
              publish();
            }}
            onEditStateChange={(next) => {
              dateEdit = next;
              publish();
            }}
            bind:open
            {onOpenChange}
            {floatingLabel}
            {locale}
            {placeholder}
            minValue={minValue ? toCalendarDate(minValue) : undefined}
            maxValue={maxValue ? toCalendarDate(maxValue) : undefined}
            {isDateDisabled}
            {isDateUnavailable}
            {readonly}
            {disabled}
            showClear={false}
            internal
            aria-describedby={ids}
          />
        {/if}
        <TimeField
          label={range ? 'Start time' : 'Time'}
          value={startTime}
          onValueChange={(next) => {
            startTime = next;
            publish();
          }}
          onEditStateChange={(next) => {
            startEdit = next;
            publish();
          }}
          minValue={dateTimeBoundary(startDate, minValue)}
          maxValue={dateTimeBoundary(startDate, maxValue)}
          {hourCycle}
          {granularity}
          {floatingLabel}
          {readonly}
          {disabled}
          showClear={false}
          internal
          aria-describedby={ids}
        />
        {#if range}<TimeField
            label="End time"
            value={endTime}
            onValueChange={(next) => {
              endTime = next;
              publish();
            }}
            onEditStateChange={(next) => {
              endEdit = next;
              publish();
            }}
            minValue={dateTimeBoundary(endDate, minValue)}
            maxValue={dateTimeBoundary(endDate, maxValue)}
            {hourCycle}
            {granularity}
            {floatingLabel}
            {readonly}
            {disabled}
            showClear={false}
            internal
            aria-describedby={ids}
          />{/if}
      </div>
    {/key}
    {#if showClear && hasInput && !readonly}<Button
        type="button"
        variant="ghost"
        size="sm"
        class="self-end"
        {disabled}
        onclick={clear}>Clear {label}</Button
      >{/if}
  </fieldset>
  {#if description}<p id={`${id}-description`} class="text-muted-foreground mt-1.5 text-xs">
      {description}
    </p>{/if}
  {#if message}<p id={`${id}-error`} class="text-destructive mt-1.5 text-xs" aria-live="polite">
      {message}
    </p>{/if}
  {#if !internal}
    <FormAdapter
      name={range ? startName : name}
      value={start?.toString() ?? ''}
      {form}
      {disabled}
      required={required || hasInput}
      {message}
      editor={ref}
      onReset={reset}
    />
    {#if range}<FormAdapter
        name={endName}
        value={end?.toString() ?? ''}
        {form}
        {disabled}
        required={required || hasInput}
        {message}
        editor={ref}
        onReset={reset}
      />{/if}
  {/if}
</div>
