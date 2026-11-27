<script lang="ts">
  import { CalendarDate, CalendarDateTime, Time } from '@internationalized/date';
  import {
    DateField,
    DateRangeField,
    TimeField,
    DateTimeField,
    DateRangeTimeField
  } from '../src/lib/components/date-fields/index.js';
  let { cancelReset = false }: { cancelReset?: boolean } = $props();
  let result = $state('');
  let date = $state<CalendarDate | undefined>(new CalendarDate(2026, 11, 27));
</script>

<div class="dark" style="--primary: rgb(30, 120, 100)">
  <form
    id="fields"
    onreset={(event) => {
      if (cancelReset) event.preventDefault();
    }}
    onsubmit={(event) => {
      event.preventDefault();
      result = JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)));
    }}
  >
    <DateField
      label="Visit date"
      name="date"
      bind:value={date}
      defaultValue={new CalendarDate(2026, 11, 27)}
      minValue={new CalendarDate(2026, 1, 1)}
      maxValue={new CalendarDate(2027, 12, 31)}
    />
    <DateRangeField label="Leave dates" startName="from" endName="to" numberOfMonths={2} />
    <TimeField label="Visit time" name="time" defaultValue={new Time(9, 30, 45)} hourCycle={12} />
    <DateTimeField
      label="Appointment"
      name="appointment"
      defaultValue={new CalendarDateTime(2026, 11, 27, 9, 30)}
    />
    <DateRangeTimeField label="Absence" startName="absenceStart" endName="absenceEnd" />
    <button type="submit">Submit</button>
    <button type="reset">Reset</button>
    <button type="button" onclick={() => (date = new CalendarDate(2027, 1, 15))}
      >External update</button
    >
  </form>
  <output>{result}</output>
</div>
