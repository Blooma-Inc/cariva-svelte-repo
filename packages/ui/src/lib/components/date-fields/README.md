# Date and time fields

```svelte
<script lang="ts">
  import { CalendarDate, CalendarDateTime, Time } from '@internationalized/date';
  import {
    DateField,
    DateRangeField,
    TimeField,
    DateTimeField,
    DateRangeTimeField
  } from '@cariva/ui/components/date-fields/index.js';

  let date = $state<CalendarDate | undefined>();
  let time = $state<Time | undefined>();
  let appointment = $state<CalendarDateTime | undefined>();
</script>

<DateField label="Visit date" bind:value={date} name="visitDate" />
<TimeField label="Visit time" bind:value={time} name="visitTime" hourCycle={12} />
<DateTimeField label="Appointment" bind:value={appointment} name="appointment" />
<DateRangeField label="Leave dates" startName="from" endName="to" numberOfMonths={2} />
<DateRangeTimeField label="Unavailable period" startName="startsAt" endName="endsAt" />
```

| Field              | Value                                              | Named submission                                |
| ------------------ | -------------------------------------------------- | ----------------------------------------------- |
| DateField          | CalendarDate or undefined                          | name: YYYY-MM-DD                                |
| DateRangeField     | { start, end }, each CalendarDate or undefined     | startName and endName, date-only ISO            |
| TimeField          | Time or undefined                                  | name: HH:mm:ss (preserves seconds/milliseconds) |
| DateTimeField      | CalendarDateTime or undefined                      | name: YYYY-MM-DDTHH:mm:ss                       |
| DateRangeTimeField | { start, end }, each CalendarDateTime or undefined | startName and endName, local ISO datetimes      |

Values are immutable objects from `@internationalized/date`. Combined fields do not invent an unentered time. Partial input stays in the editor, prevents submission, and serializes an empty value for an incomplete endpoint. Conversion to UTC or a branch timezone belongs to the consumer.

All fields support `label`, `description`, `error`, `required`, `disabled`, `readonly`, `floatingLabel` (inset by default), `showClear`, `form`, `aria-describedby`, `class`, and a bindable `ref`. `ref` is the outer element; call `ref.querySelector<HTMLElement>('[role="spinbutton"]')?.focus()` for programmatic focus. Clear focuses the first segment. Dates hide Clear when read-only; time keeps it disabled.

Use `bind:value` or `value` with `onValueChange`. `defaultValue` initializes an unset value and is the native reset target; absent a default, reset empties the field. Cancelled reset events leave values intact. A plain form or externally associated form (`form="form-id"`) works without a form library. Disabled values are omitted; read-only values submit. A visually hidden text input supplies native constraint validation, including completeness, bounds, and consumer errors; invalid submission focuses the visible editor. Primitive inputs are unnamed to avoid duplicate submitted values.

Date fields use en-GB, one fixed six-week month, and Monday first. Configure `locale`, `placeholder`, `minValue`, `maxValue`, `isDateDisabled`, `isDateUnavailable`, `numberOfMonths`, `bind:open`, and `onOpenChange`. A placeholder changes the calendar view without selecting a date. Month and year dropdowns navigate without committing; year choices span supplied bounds, or 1900–2100 for an unbounded side. Supply bounds to extend that span. Same-day date ranges are allowed. Only endpoints are validated; rules about crossing unavailable days belong to the consumer.

Time defaults to 24-hour display and minute precision. Set `hourCycle={12}` for AM/PM, and `granularity="hour" | "minute" | "second"`. Undisplayed seconds remain part of the value. Inclusive `minValue`/`maxValue` use Time objects. `isLoading` adds a named status without locking editing.

Combined bounds use CalendarDateTime objects. The calendar uses their date parts; time limits apply on the corresponding boundary dates. Date changes retain each endpoint's time. End must be on or after start; an overnight period needs a later end date. Clear resets all parts.

For Superforms, bind each field to the appropriate form value and pass `error` from the form errors. These standalone fields own their label and description; do not add a second Form.Label. Convert API strings at the consumer boundary with `parseDate`, `parseTime`, or `parseDateTime`. Use string schemas or a transform in the form model when the API expects strings. `internal` disables native serialization/validation adapters and is reserved for composing fields with a parent that owns them.

The existing `components/form-inputs/date-field` API remains available for screens using SvelteDate values. This family uses the new `components/date-fields` entry point; existing forms have not been migrated.

The development-only tenant route `/preview/date-time` includes all five fields, empty/populated states, standard/inset labels, disabled/read-only/required/errors, date and time bounds, multi-month selection, seconds, loading, reset cancellation, serialized output, and a nested dialog example. The earlier `DateTimePicker` prototype remains separate for comparison.
