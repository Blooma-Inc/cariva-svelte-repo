import type { FilterChipLabels, FilterOption, FilterValue } from './types.js';

export const defaultLabels: FilterChipLabels = {
  clear: 'Clear',
  done: 'Done',
  cancel: 'Cancel',
  apply: 'Apply',
  search: 'Search options',
  noResults: 'No matching options',
  remaining: (count) => `Search to find ${count} more options`,
  remove: (label) => `Remove ${label.toLowerCase()} filter`,
  minimum: (value) => `${value} or more`,
  maximum: (value) => `Up to ${value}`
};

export function copyValue(value: FilterValue): FilterValue {
  if (Array.isArray(value)) return value.map(copyValue);
  if (value !== null && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, copyValue(item)]));
  return value;
}

export function isEmpty(value: FilterValue): boolean {
  if (value === undefined || value === null || value === '') return true;
  if (Array.isArray(value)) return value.every(isEmpty);
  if (typeof value === 'object') return Object.values(value).every(isEmpty);
  return false;
}

export function equalValues(left: FilterValue, right: FilterValue): boolean {
  if (Object.is(left, right)) return true;
  if (isEmpty(left) && isEmpty(right)) return true;
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false;
    if ([...left, ...right].every((item) => item === null || typeof item !== 'object')) {
      const remaining = [...right];
      return left.every((item) => {
        const index = remaining.findIndex((other) => Object.is(item, other));
        if (index < 0) return false;
        remaining.splice(index, 1);
        return true;
      });
    }
    return left.every((item, index) => equalValues(item, right[index]));
  }
  if (
    left &&
    right &&
    typeof left === 'object' &&
    typeof right === 'object' &&
    !Array.isArray(left) &&
    !Array.isArray(right)
  ) {
    const keys = Object.keys(left);
    return (
      keys.length === Object.keys(right).length &&
      keys.every((key) => Object.hasOwn(right, key) && equalValues(left[key], right[key]))
    );
  }
  return false;
}

export function emptyValue(value: FilterValue, multiple = false): FilterValue {
  if (Array.isArray(value) || multiple) return [];
  if (value !== null && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, emptyValue(item)]));
  return null;
}

export function summarize(
  value: FilterValue,
  options: FilterOption[],
  labels: FilterChipLabels
): string {
  if (isEmpty(value)) return '';
  if (Array.isArray(value)) {
    const selected = value.filter((item) => !isEmpty(item));
    return `${summarize(selected[0], options, labels)}${selected.length > 1 ? ` +${selected.length - 1}` : ''}`;
  }
  if (value !== null && typeof value === 'object') {
    if ('min' in value || 'max' in value) {
      const min = isEmpty(value.min) ? '' : String(value.min);
      const max = isEmpty(value.max) ? '' : String(value.max);
      if (min && max) return `${min} – ${max}`;
      return min ? labels.minimum(min) : labels.maximum(max);
    }
    return summarize(
      Object.values(value)
        .flat()
        .filter((item) => !isEmpty(item)),
      options,
      labels
    );
  }
  return options.find((option) => Object.is(option.value, value))?.label ?? String(value);
}
