import { describe, expect, it } from 'vitest';
import {
  copyValue,
  defaultLabels,
  emptyValue,
  equalValues,
  isEmpty,
  summarize
} from '../src/lib/components/filter-chip/value.js';

const options = [
  { value: 'usd', label: 'USD' },
  { value: 'eur', label: 'EUR' }
];

describe('filter values', () => {
  it('preserves zero and false as selections', () => {
    expect(isEmpty(0)).toBe(false);
    expect(isEmpty(false)).toBe(false);
    expect(isEmpty({ min: 0, max: null })).toBe(false);
    expect(isEmpty({ verification: [], account: [] })).toBe(true);
  });

  it('compares primitive arrays without order, including nested groups', () => {
    expect(equalValues(['usd', 'eur'], ['eur', 'usd'])).toBe(true);
    expect(equalValues({ verification: ['a', 'b'] }, { verification: ['b', 'a'] })).toBe(true);
    expect(equalValues(['usd', 'usd'], ['usd', 'eur'])).toBe(false);
    expect(equalValues({ min: 0 }, { min: 1 })).toBe(false);
  });

  it('isolates nested drafts and retains their shape when emptied', () => {
    const original = { verification: ['pending'], amount: { min: 0, max: 100 } };
    const draft = copyValue(original) as typeof original;
    draft.verification.push('approved');
    draft.amount.min = 10;
    expect(original).toEqual({ verification: ['pending'], amount: { min: 0, max: 100 } });
    expect(emptyValue(original)).toEqual({ verification: [], amount: { min: null, max: null } });
  });

  it('summarizes labels, multiple selections, and ranges', () => {
    expect(summarize(['usd', 'eur'], options, defaultLabels)).toBe('USD +1');
    expect(summarize({ min: 0, max: 500 }, [], defaultLabels)).toBe('0 – 500');
    expect(summarize({ min: 100 }, [], defaultLabels)).toBe('100 or more');
    expect(summarize({ max: 500 }, [], defaultLabels)).toBe('Up to 500');
    expect(summarize({ account: ['usd'], verification: ['eur'] }, options, defaultLabels)).toBe(
      'USD +1'
    );
  });
});
