import { expect, it } from 'vitest';
import { render } from 'svelte/server';
import Fixture from './date-fields-fixture.svelte';

it('renders every field with ISO values, local datetime serialization and segmented editors', () => {
  const { body } = render(Fixture);
  expect(body).toContain('name="date" value="2026-11-27"');
  expect(body).toContain('name="time" value="09:30:45"');
  expect(body).toContain('name="appointment" value="2026-11-27T09:30:00"');
  expect(body.match(/name="appointment"/g)).toHaveLength(1);
  expect(body).toContain('name="absenceStart" value=""');
  expect(body).toContain('name="absenceEnd" value=""');
  expect(body).toContain('data-segment="dayPeriod"');
  expect(body).toContain('data-segment="day"');
  expect(body).not.toContain('2026-11-27T09:30:00Z');
});
