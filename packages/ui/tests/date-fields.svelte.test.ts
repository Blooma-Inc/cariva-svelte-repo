import { expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import Fixture from './date-fields-fixture.svelte';
import DialogFixture from './date-fields-dialog.svelte';

it('submits one ISO value per named field and retains hidden seconds', async () => {
  render(Fixture);
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect.element(page.getByRole('status')).toHaveTextContent('"date":"2026-11-27"');
  await expect.element(page.getByRole('status')).toHaveTextContent('"time":"09:30:45"');
  await expect
    .element(page.getByRole('status'))
    .toHaveTextContent('"appointment":"2026-11-27T09:30:00"');
});

it('clears partial time edits, restores defaults on reset and honours cancelled resets', async () => {
  render(Fixture);
  const time = page.getByRole('group', { name: 'Visit time' });
  await time.getByRole('spinbutton', { name: 'minute' }).click();
  await userEvent.keyboard('{Backspace}');
  await expect.element(page.getByText('Complete the time.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear Visit time', exact: true }).click();
  await expect
    .element(page.getByText('Complete the time.', { exact: true }))
    .not.toBeInTheDocument();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect.element(time.getByRole('spinbutton', { name: 'minute' })).toHaveTextContent('30');
});

it('updates from the consumer and restores the date default', async () => {
  render(Fixture);
  await page.getByRole('button', { name: 'External update' }).click();
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect.element(page.getByRole('status')).toHaveTextContent('2027-01-15');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect.element(page.getByRole('status')).toHaveTextContent('2026-11-27');
});

it('keeps values when a native reset is cancelled', async () => {
  render(Fixture, { cancelReset: true });
  await page.getByRole('button', { name: 'External update' }).click();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect.element(page.getByRole('status')).toHaveTextContent('2027-01-15');
});

it('opens an accessible calendar, navigates years without selecting, and restores focus', async () => {
  render(Fixture);
  const trigger = page.getByRole('button', { name: 'Open Visit date calendar' });
  await trigger.click();
  await expect.element(page.getByRole('dialog', { name: 'Visit date calendar' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Year 1' }).selectOptions('2027');
  await userEvent.keyboard('{Escape}');
  await expect.element(trigger).toHaveFocus();
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect.element(page.getByRole('status')).toHaveTextContent('"date":"2026-11-27"');
});

it('opens an empty datetime calendar inside a form dialog after control props update', async () => {
  render(DialogFixture);
  const parent = page.getByRole('dialog', { name: 'Schedule editor' });
  await expect.element(parent).toBeVisible();
  await parent.getByRole('button', { name: 'Open Date calendar', exact: true }).click();
  await expect
    .element(page.getByRole('dialog', { name: 'Date calendar', exact: true }))
    .toBeVisible();
  await expect.element(page.getByRole('combobox', { name: 'Month 1' })).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect.element(parent).toBeVisible();
});
