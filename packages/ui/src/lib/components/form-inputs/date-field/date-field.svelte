<script lang="ts" module>
  import type { FieldInputs } from '$lib/types';

  export interface DateFieldBaseProps {
    ref?: HTMLButtonElement | null;
    value?: SvelteDate;
    placeholder?: string;
    showCalendar?: boolean;
    showTime?: boolean;
    min?: SvelteDate;
    max?: SvelteDate;
    timeInterval?: number;
    class?: string;
    required?: boolean;
  }

  export type DateFieldProps = FieldInputs<DateFieldBaseProps>;
</script>

<script lang="ts">
  import Calendar from '$lib/components/ui/calendar/calendar.svelte';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import * as Form from '$lib/components/ui/form';
  import { CalendarDate, getLocalTimeZone, type DateValue } from '@internationalized/date';
  import { cn } from '$lib/utils.js';
  import { SvelteDate } from 'svelte/reactivity';

  let {
    ref = $bindable(null),
    value = $bindable<SvelteDate | undefined>(undefined),
    label,
    description,
    showCalendar = true,
    showTime = false,
    min,
    max,
    timeInterval = 10,
    ...props
  }: DateFieldProps = $props();

  let open = $state(false);

  function toCalendarDate(date: SvelteDate | undefined): CalendarDate | undefined {
    if (!date) return undefined;
    return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  function mergeDatePart(base: SvelteDate | undefined, cal: DateValue): SvelteDate {
    const next = new SvelteDate(cal.toDate(getLocalTimeZone()));
    if (base) {
      next.setHours(base.getHours(), base.getMinutes(), 0, 0);
    }
    return next;
  }

  const calendarValue = $derived(toCalendarDate(value));
  const minValue = $derived(min ? toCalendarDate(min) : undefined);
  const maxValue = $derived(max ? toCalendarDate(max) : undefined);

  function handleDateSelect(cal: DateValue | undefined) {
    if (!cal) {
      value = undefined;
      return;
    }
    value = mergeDatePart(value, cal);
    if (!showTime) {
      open = false;
    }
  }

  interface TimeOption {
    value: string;
    hour: number;
    minute: number;
  }

  function generateTimeOptions(): TimeOption[] {
    const times: TimeOption[] = [];
    const totalMinutes = 12 * 60;

    for (let i = 0; i < totalMinutes; i += timeInterval) {
      const hour = Math.floor(i / 60);
      const minute = i % 60;
      const displayHour = hour === 0 ? 12 : hour;
      const timeString = `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push({ value: timeString, hour, minute });
    }

    return times;
  }

  const timeOptions = generateTimeOptions();

  const currentTimeString = $derived.by(() => {
    if (!value) return null;

    const currentHour = value.getHours();
    const currentMinute = value.getMinutes();
    const displayHour = currentHour === 0 ? 12 : currentHour > 12 ? currentHour - 12 : currentHour;

    const match = timeOptions.find((time) => {
      const timeHour = time.hour === 0 ? 12 : time.hour;
      return timeHour === displayHour && time.minute === currentMinute;
    });

    return match?.value ?? null;
  });

  const isPM = $derived(value ? value.getHours() >= 12 : false);

  function handleTimeChange(type: 'hour' | 'ampm', option: TimeOption | 'AM' | 'PM') {
    const base = value ? new SvelteDate(value) : new SvelteDate();

    if (type === 'ampm') {
      const currentHour = base.getHours();
      const isCurrentlyPM = currentHour >= 12;
      const hour12 = currentHour % 12;

      if (option === 'PM' && !isCurrentlyPM) {
        base.setHours(hour12 + 12);
      } else if (option === 'AM' && isCurrentlyPM) {
        base.setHours(hour12);
      }
    } else if (typeof option !== 'string') {
      const pm = base.getHours() >= 12;
      const hour24 = option.hour === 12 ? (pm ? 12 : 0) : pm ? option.hour + 12 : option.hour;
      base.setHours(hour24, option.minute, 0, 0);
    }

    value = base;
  }

  function formatValue(date: SvelteDate): string {
    if (showCalendar && showTime) {
      return new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);
    }
    if (showCalendar) {
      return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    }
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }
</script>

<div class="relative flex w-full flex-col gap-1">
  <Form.Control>
    {#snippet children({ props: controlProps })}
      <div class="relative flex w-full flex-col gap-1">
        {#if label}
          <Form.Label>
            {label}
            {#if props.required}
              <small class="text-destructive">*</small>
            {/if}
          </Form.Label>
        {/if}

        <Popover.Root bind:open>
          <Popover.Trigger>
            {#snippet child({ props: triggerProps })}
              <button
                bind:this={ref}
                {...controlProps}
                {...triggerProps}
                {...props}
                type="button"
                class={cn(
                  'font-grotesk border-border flex h-11 w-full items-center justify-start gap-2 rounded-xl border bg-white px-3 text-left text-sm font-normal shadow-none focus-within:border-neutral-950 hover:bg-white',
                  !value && 'text-neutral-400',
                  props.class
                )}
              >
                {#if value}
                  <span>{formatValue(value)}</span>
                {:else}
                  <span class="w-11/12 text-sm">{props.placeholder}</span>
                {/if}
              </button>
            {/snippet}
          </Popover.Trigger>

          <Popover.Content class="w-auto overflow-hidden p-0" align="start">
            <div class="md:flex">
              {#if showCalendar}
                <Calendar
                  type="single"
                  value={calendarValue}
                  onValueChange={handleDateSelect}
                  captionLayout="dropdown"
                  {minValue}
                  {maxValue}
                />
              {/if}

              {#if showTime}
                <div class="flex flex-col divide-y md:h-82.5 md:flex-row md:divide-x md:divide-y-0">
                  <ScrollArea class="w-75 max-w-fit">
                    <div class="flex space-x-3 p-1 md:flex-col md:space-x-0">
                      {#each timeOptions as time (time.value)}
                        <Button
                          variant={currentTimeString === time.value ? 'default' : 'ghost'}
                          class="p-2 sm:w-full"
                          onclick={() => handleTimeChange('hour', time)}
                        >
                          {time.value}
                        </Button>
                      {/each}
                    </div>
                  </ScrollArea>

                  <ScrollArea>
                    <div class="flex p-2 md:flex-col md:space-y-2">
                      {#each ['AM', 'PM'] as ampm (ampm)}
                        <Button
                          variant={(ampm === 'AM' && !isPM) || (ampm === 'PM' && isPM)
                            ? 'default'
                            : 'ghost'}
                          class="p-2 sm:w-full"
                          onclick={() => handleTimeChange('ampm', ampm as 'AM' | 'PM')}
                        >
                          {ampm}
                        </Button>
                      {/each}
                    </div>
                  </ScrollArea>
                </div>
              {/if}
            </div>

            {#if showTime}
              <div class="flex justify-end border-t px-4 py-3">
                <Button class="px-6" onclick={() => (open = false)}>Done</Button>
              </div>
            {/if}
          </Popover.Content>
        </Popover.Root>
      </div>
    {/snippet}
  </Form.Control>

  {#if description}
    <Form.Description>
      {#if typeof description === 'string'}
        {description}
      {:else}
        {@render description()}
      {/if}
    </Form.Description>
  {/if}

  <Form.FieldErrors />
</div>
