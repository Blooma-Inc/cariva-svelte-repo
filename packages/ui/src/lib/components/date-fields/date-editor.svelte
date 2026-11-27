<script lang="ts">
  import { InputGroupButton } from '$lib/components/ui/input-group/index.js';
  import { DatePicker, DateRangePicker } from 'bits-ui';
  import { toCalendarDate, today, getLocalTimeZone, type DateValue } from '@internationalized/date';
  import { tick, untrack } from 'svelte';
  import CalendarIcon from '@lucide/svelte/icons/calendar-days';
  import XIcon from '@lucide/svelte/icons/x';
  import { cn } from '$lib/utils.js';
  import FieldFrame from './field-frame.svelte';
  import FormAdapter from './form-adapter.svelte';
  import CalendarPanel from './calendar-panel.svelte';
  import {
    segmentClass,
    editorClass,
    dateError,
    focusEditor,
    observeSegments,
    captureTheme
  } from './shared.js';
  import type { DateOptions, DateRangeValue, EditState, FieldProps } from './types.js';

  const uid = $props.id();
  let {
    range = false,
    value = $bindable<DateValue | DateRangeValue | undefined>(undefined),
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
    numberOfMonths = 1
  }: FieldProps &
    DateOptions & {
      range?: boolean;
      value?: DateValue | DateRangeValue;
      defaultValue?: DateValue | DateRangeValue;
      onValueChange?: (value: DateValue | DateRangeValue | undefined) => void;
      name?: string;
      startName?: string;
      endName?: string;
    } = $props();
  const Root = $derived(range ? DateRangePicker.Root : DatePicker.Root);
  const P = $derived(range ? DateRangePicker : DatePicker);
  let revision = $state(0);
  let edit = $state<EditState>({ incomplete: false, hasInput: false });
  let theme = $state({ style: '', class: '' });
  const initial = untrack(() => defaultValue);
  if (value === undefined && initial !== undefined) value = initial;
  let seen = value;
  let pickerValue = $state<DateValue | DateRangeValue | undefined>(untrack(() => value));
  let calendarPlaceholder = $state<DateValue>(
    untrack(
      () =>
        placeholder ??
        (range ? (value as DateRangeValue | undefined)?.start : (value as DateValue | undefined)) ??
        minValue ??
        today(getLocalTimeZone())
    )
  );
  let previousPlaceholder = untrack(() => placeholder);
  $effect(() => {
    if (placeholder !== previousPlaceholder) {
      previousPlaceholder = placeholder;
      if (placeholder) calendarPlaceholder = placeholder;
    }
  });
  const dates = $derived(
    range
      ? ((value as DateRangeValue | undefined) ?? { start: undefined, end: undefined })
      : { start: value as DateValue | undefined, end: undefined }
  );
  const message = $derived(
    error ||
      (edit.incomplete ? 'Complete the date.' : '') ||
      (range && !!dates.start !== !!dates.end ? 'Enter both start and end dates.' : '') ||
      (range && dates.start && dates.end && dates.end.compare(dates.start) < 0
        ? 'End date must be on or after start date.'
        : '') ||
      dateError(dates.start, minValue, maxValue, isDateDisabled, isDateUnavailable) ||
      dateError(dates.end, minValue, maxValue, isDateDisabled, isDateUnavailable)
  );
  const ids = $derived(
    [describedBy, description ? `${id}-description` : '', message ? `${id}-error` : '']
      .filter(Boolean)
      .join(' ') || undefined
  );
  const populated = $derived(!!dates.start || !!dates.end || edit.hasInput);

  function change(
    next: DateValue | { start: DateValue | undefined; end: DateValue | undefined } | undefined
  ) {
    pickerValue = next as typeof pickerValue;
    value = range
      ? {
          start: (next as DateRangeValue | undefined)?.start
            ? toCalendarDate((next as DateRangeValue).start!)
            : undefined,
          end: (next as DateRangeValue | undefined)?.end
            ? toCalendarDate((next as DateRangeValue).end!)
            : undefined
        }
      : next
        ? toCalendarDate(next as DateValue)
        : undefined;
    seen = value;
    onValueChange?.(value);
  }
  function changeEndpoint(endpoint: 'start' | 'end', next: DateValue | undefined) {
    if (!range) return;
    const previous = value as DateRangeValue | undefined;
    if (previous?.[endpoint]?.toString() === next?.toString()) return;
    value = {
      start: previous?.start,
      end: previous?.end,
      [endpoint]: next ? toCalendarDate(next) : undefined
    };
    seen = value;
    onValueChange?.(value);
  }
  function editing(next: EditState) {
    edit = next;
    onEditStateChange?.(next);
  }
  function setOpen(next: boolean) {
    if (next && (disabled || readonly)) return;
    theme = captureTheme(ref);
    open = next;
    onOpenChange?.(next);
  }
  async function reset(next: DateValue | DateRangeValue | undefined) {
    change(next ?? (range ? { start: undefined, end: undefined } : undefined));
    editing({
      incomplete: false,
      hasInput: range
        ? !!(next as DateRangeValue | undefined)?.start ||
          !!(next as DateRangeValue | undefined)?.end
        : !!next
    });
    setOpen(false);
    revision += 1;
  }
  async function clear() {
    await reset(range ? { start: undefined, end: undefined } : undefined);
    await tick();
    focusEditor(ref);
  }
  function valueKey(next: typeof value) {
    if (!range) return (next as DateValue | undefined)?.toString() ?? '';
    const pair = next as DateRangeValue | undefined;
    return `${pair?.start?.toString() ?? ''}/${pair?.end?.toString() ?? ''}`;
  }
  $effect(() => {
    if (value !== seen) {
      const changed = valueKey(value) !== valueKey(seen);
      seen = value;
      if (changed) {
        pickerValue = value;
        revision += 1;
        edit = { incomplete: false, hasInput: false };
      }
    }
  });
  $effect(() => {
    if (open) {
      theme = captureTheme(ref);
      if (disabled || readonly) setOpen(false);
    }
  });
</script>

{#snippet labelContent()}<P.Label>{label}</P.Label>{/snippet}

<div bind:this={ref} class={cn('relative min-w-0', className)}>
  {#key revision}
    <Root
      value={pickerValue as never}
      onValueChange={change}
      onStartValueChange={(next) => changeEndpoint('start', next)}
      onEndValueChange={(next) => changeEndpoint('end', next)}
      {open}
      onOpenChange={setOpen}
      bind:placeholder={
        () => calendarPlaceholder,
        (next) => {
          if (next) calendarPlaceholder = next;
        }
      }
      {locale}
      {minValue}
      {maxValue}
      {isDateDisabled}
      {isDateUnavailable}
      {disabled}
      {readonly}
      {required}
      {numberOfMonths}
      fixedWeeks
      weekStartsOn={1}
      weekdayFormat="short"
      disableDaysOutsideMonth
      initialFocus
      calendarLabel={label}
      validate={() => message || undefined}
      errorMessageId={message ? `${id}-error` : undefined}
    >
      <FieldFrame label={labelContent} {floatingLabel} {disabled} invalid={!!message}>
        {#snippet actions()}
          {#if showClear && populated && !readonly}
            <InputGroupButton
              size="icon-xs"
              variant="secondary"
              {disabled}
              aria-label={`Clear ${label}`}
              onclick={clear}><XIcon class="size-3" /></InputGroupButton
            >
          {/if}
          <P.Trigger disabled={disabled || readonly} aria-label={`Open ${label} calendar`}>
            {#snippet child({ props })}
              <InputGroupButton {...props} size="icon-xs" variant="secondary">
                <CalendarIcon class="size-3" />
              </InputGroupButton>
            {/snippet}
          </P.Trigger>
        {/snippet}
        <div class="flex items-center gap-2">
          <div
            class="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-2"
            use:observeSegments={editing}
          >
            {#if range}
              <DateRangePicker.Input
                type="start"
                aria-label={`${label}: Start date`}
                aria-describedby={ids}
                class={editorClass}
              >
                {#snippet children({
                  segments
                })}{#each segments as segment, segmentIndex (segmentIndex)}<DateRangePicker.Segment
                      part={segment.part}
                      class={segmentClass}>{segment.value}</DateRangePicker.Segment
                    >{/each}{/snippet}
              </DateRangePicker.Input>
              <span aria-hidden="true" class="text-muted-foreground">–</span>
              <DateRangePicker.Input
                type="end"
                aria-label={`${label}: End date`}
                aria-describedby={ids}
                class={editorClass}
              >
                {#snippet children({
                  segments
                })}{#each segments as segment, segmentIndex (segmentIndex)}<DateRangePicker.Segment
                      part={segment.part}
                      class={segmentClass}>{segment.value}</DateRangePicker.Segment
                    >{/each}{/snippet}
              </DateRangePicker.Input>
            {:else}
              <DatePicker.Input {id} aria-describedby={ids} class={editorClass}>
                {#snippet children({
                  segments
                })}{#each segments as segment, segmentIndex (segmentIndex)}<DatePicker.Segment
                      part={segment.part}
                      class={segmentClass}>{segment.value}</DatePicker.Segment
                    >{/each}{/snippet}
              </DatePicker.Input>
            {/if}
          </div>
        </div>
      </FieldFrame>
      <DatePicker.Portal>
        <P.Content
          role="dialog"
          align="start"
          sideOffset={6}
          collisionPadding={8}
          aria-label={`${label} calendar`}
          style={theme.style}
          class={cn(
            'bg-popover text-popover-foreground ring-border z-50 max-h-[70svh] max-w-[calc(100vw-1rem)] overflow-auto rounded-2xl p-4 shadow-xl ring-1 outline-none sm:p-5',
            theme.class
          )}
        >
          <CalendarPanel {range} {minValue} {maxValue} />
        </P.Content>
      </DatePicker.Portal>
    </Root>
  {/key}
  {#if description}<p id={`${id}-description`} class="text-muted-foreground mt-1.5 text-xs">
      {description}
    </p>{/if}
  {#if message}<p id={`${id}-error`} class="text-destructive mt-1.5 text-xs" aria-live="polite">
      {message}
    </p>{/if}
  {#if !internal}
    <FormAdapter
      name={range ? startName : name}
      value={!edit.incomplete ? (dates.start?.toString() ?? '') : ''}
      {form}
      {disabled}
      {required}
      {message}
      editor={ref}
      onReset={() => reset(initial)}
    />
    {#if range}<FormAdapter
        name={endName}
        value={!edit.incomplete ? (dates.end?.toString() ?? '') : ''}
        {form}
        {disabled}
        {required}
        {message}
        editor={ref}
        onReset={() => reset(initial)}
      />{/if}
  {/if}
</div>
