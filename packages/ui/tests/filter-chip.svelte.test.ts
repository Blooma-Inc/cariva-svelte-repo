import { beforeEach, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import FilterChip from '../src/lib/components/filter-chip/filter-chip.svelte';
import RangeFilter from './filter-chip-range.svelte';

const options = [
  { value: 'active', label: 'Active', count: 0 },
  { value: 'inactive', label: 'Inactive' }
];

beforeEach(async () => {
  await page.viewport(1200, 800);
});

it('commits single choices immediately, closes, and resets with focus restoration', async () => {
  const onValueChange = vi.fn();
  render(FilterChip, { label: 'Status', options, onValueChange });
  await page.getByRole('button', { name: 'Status', exact: true }).click();
  await expect.element(page.getByRole('dialog', { name: 'Status' })).toBeVisible();
  await page.getByRole('radio', { name: 'Active 0' }).click();
  await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  expect(onValueChange).toHaveBeenLastCalledWith('active');
  const trigger = page.getByRole('button', { name: 'Status: Active', exact: true });
  await expect.element(trigger).toBeVisible();
  await page.getByRole('button', { name: 'Remove status filter' }).click();
  expect(onValueChange).toHaveBeenLastCalledWith(null);
  await expect.element(page.getByRole('button', { name: 'Status', exact: true })).toHaveFocus();
});

it('keeps immediate multiple selections on Escape and shows the committed summary', async () => {
  const onValueChange = vi.fn();
  render(FilterChip, { label: 'Status', options, multiple: true, value: [], onValueChange });
  await page.getByRole('button', { name: 'Status', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Active 0' }).click();
  await page.getByRole('checkbox', { name: 'Inactive', exact: true }).click();
  await expect.element(page.getByRole('dialog', { name: 'Status' })).toBeVisible();
  await userEvent.keyboard('{Escape}');
  expect(onValueChange).toHaveBeenLastCalledWith(['active', 'inactive']);
  await expect
    .element(page.getByRole('button', { name: 'Status: Active +1', exact: true }))
    .toBeVisible();
});

it('discards cancelled and dismissed drafts, and only commits on Apply', async () => {
  const onValueChange = vi.fn();
  render(FilterChip, { label: 'Status', options, value: 'active', mode: 'apply', onValueChange });
  const trigger = page.getByRole('button', { name: 'Status: Active', exact: true });
  await trigger.click();
  await page.getByRole('radio', { name: 'Inactive', exact: true }).click();
  await expect.element(trigger).toHaveTextContent('Status: Active');
  expect(onValueChange).not.toHaveBeenCalled();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await trigger.click();
  await expect.element(page.getByRole('radio', { name: 'Active 0' })).toBeChecked();
  await page.getByRole('radio', { name: 'Inactive', exact: true }).click();
  await userEvent.keyboard('{Escape}');
  expect(onValueChange).not.toHaveBeenCalled();
  await trigger.click();
  await page.getByRole('radio', { name: 'Inactive', exact: true }).click();
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith('inactive');
});

it('uses the reset default without initializing value and hides removal at that default', async () => {
  render(FilterChip, {
    label: 'Status',
    options,
    value: null,
    defaultValue: 'active',
    mode: 'apply'
  });
  await page.getByRole('button', { name: 'Status', exact: true }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect.element(page.getByRole('radio', { name: 'Active 0' })).toBeChecked();
  await expect.element(page.getByRole('button', { name: 'Clear', exact: true })).toBeDisabled();
  await expect.element(page.getByRole('button', { name: 'Status', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect
    .element(page.getByRole('button', { name: 'Status: Active', exact: true }))
    .toBeVisible();
  await expect
    .element(page.getByRole('button', { name: 'Remove status filter' }))
    .not.toBeInTheDocument();
});

it('searches the full list and skips disabled options during keyboard navigation', async () => {
  const longOptions = Array.from({ length: 10 }, (_, index) => ({
    value: index,
    label: `Option ${index}`,
    disabled: index === 1
  }));
  render(FilterChip, { label: 'Currency', options: longOptions, multiple: true, value: [] });
  await page.getByRole('button', { name: 'Currency', exact: true }).click();
  await expect.element(page.getByText('Search to find 2 more options')).toBeVisible();
  const first = page.getByRole('checkbox', { name: 'Option 0', exact: true });
  await first.click();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(page.getByRole('checkbox', { name: 'Option 2', exact: true })).toHaveFocus();
  await userEvent.keyboard('{End}');
  await expect.element(page.getByRole('checkbox', { name: 'Option 7', exact: true })).toHaveFocus();
  await userEvent.keyboard('{Home}');
  await expect.element(first).toHaveFocus();
  await page.getByRole('searchbox', { name: 'Search options' }).fill('OPTION 9');
  await expect.element(page.getByRole('checkbox', { name: 'Option 9', exact: true })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search options' }).fill('missing');
  await expect.element(page.getByText('No matching options')).toBeVisible();
});

it('isolates custom range edits and carries the active theme into the portal', async () => {
  render(RangeFilter);
  const trigger = page.getByRole('button', { name: 'Amount: 0 – 500', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Amount' });
  expect(getComputedStyle(dialog.element()).getPropertyValue('--primary').trim()).toBe(
    'rgb(30, 120, 100)'
  );
  await page.getByRole('spinbutton', { name: 'Minimum' }).fill('100');
  await expect.element(trigger).toHaveTextContent('Amount: 0 – 500');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await trigger.click();
  await expect.element(page.getByRole('spinbutton', { name: 'Minimum' })).toHaveValue(0);
  await page.getByRole('spinbutton', { name: 'Minimum' }).fill('100');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect
    .element(page.getByRole('button', { name: 'Amount: 100 – 500', exact: true }))
    .toBeVisible();
});

it('opens a modal bottom sheet on narrow screens', async () => {
  await page.viewport(390, 844);
  render(FilterChip, { label: 'Status', options });
  await page.getByRole('button', { name: 'Status', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Status' });
  await expect.element(dialog).toBeVisible();
  await expect.element(dialog).toHaveAttribute('data-slot', 'sheet-content');
  await expect.element(dialog).toHaveAttribute('aria-modal', 'true');
  await expect.element(page.getByRole('heading', { name: 'Status' })).toBeVisible();
});

it('disables both opening and removal', async () => {
  render(FilterChip, { label: 'Status', options, value: 'active', disabled: true });
  await expect
    .element(page.getByRole('button', { name: 'Status: Active', exact: true }))
    .toBeDisabled();
  await expect.element(page.getByRole('button', { name: 'Remove status filter' })).toBeDisabled();
});
