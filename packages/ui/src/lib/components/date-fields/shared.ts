import {
  CalendarDateTime,
  Time,
  toCalendarDate,
  type CalendarDate,
  type DateValue
} from '@internationalized/date';
import type { EditState } from './types.js';

export const segmentClass =
  'rounded bg-transparent px-0.5 py-0.5 tabular-nums outline-none transition-colors hover:bg-accent/50 focus:bg-primary/15 focus:text-primary focus-visible:ring-2 focus-visible:ring-ring/40 data-[segment=literal]:hover:bg-transparent';
export const actionClass =
  'text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/40 inline-flex size-8 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-40';
export const editorClass =
  'flex min-w-0 flex-wrap items-center gap-0.5 text-sm tabular-nums outline-none';

export function dateError(
  date: DateValue | undefined,
  min?: DateValue,
  max?: DateValue,
  disabled?: (date: DateValue) => boolean,
  unavailable?: (date: DateValue) => boolean
) {
  if (!date) return '';
  if (min && date.compare(min) < 0) return `Choose a date on or after ${min.toString()}.`;
  if (max && date.compare(max) > 0) return `Choose a date on or before ${max.toString()}.`;
  if (disabled?.(date) || unavailable?.(date)) return 'This date is unavailable.';
  return '';
}

export function focusEditor(node: HTMLElement | null) {
  node
    ?.querySelector<HTMLElement>(
      '[role="spinbutton"], [data-segment]:not([data-segment="literal"])'
    )
    ?.focus();
}

export function observeSegments(node: HTMLElement, callback: (state: EditState) => void) {
  let last = '';
  const previouslyFilled = new WeakSet<HTMLElement>();
  const inspect = () => {
    const segments = Array.from(
      node.querySelectorAll<HTMLElement>('[role="spinbutton"]:not([data-segment="dayPeriod"])')
    );
    const groups = new Map<HTMLElement, HTMLElement[]>();
    for (const segment of segments) {
      const group =
        segment.closest<HTMLElement>('[data-date-field-input], [data-time-field-input]') ?? node;
      groups.set(group, [...(groups.get(group) ?? []), segment]);
    }
    const state = { incomplete: false, hasInput: false };
    for (const [group, parts] of groups) {
      const filled = parts.filter(
        (segment) => segment.getAttribute('aria-valuetext') !== 'Empty'
      ).length;
      const started = filled > 0 || previouslyFilled.has(group);
      state.incomplete ||= started && filled < parts.length;
      state.hasInput ||= started;
      if (filled > 0) previouslyFilled.add(group);
    }
    const key = JSON.stringify(state);
    if (last !== key) {
      last = key;
      callback(state);
    }
  };
  const observer = new MutationObserver(inspect);
  observer.observe(node, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['aria-valuenow', 'aria-valuetext']
  });
  inspect();
  return { destroy: () => observer.disconnect() };
}

export function captureTheme(node: HTMLElement | null) {
  if (!node) return { style: '', class: '' };
  const computed = getComputedStyle(node);
  return {
    style:
      Array.from(computed)
        .filter(
          (name) =>
            name.startsWith('--') && !name.startsWith('--tw-') && !name.startsWith('--bits-')
        )
        .map((name) => `${name}:${computed.getPropertyValue(name)};`)
        .join('') + `font-family:${computed.fontFamily};color-scheme:${computed.colorScheme};`,
    class: node.closest('.dark, .light')?.classList.contains('dark') ? 'dark' : ''
  };
}

export function combineDateTime(date: CalendarDate | undefined, time: Time | undefined) {
  return date && time
    ? new CalendarDateTime(
        date.year,
        date.month,
        date.day,
        time.hour,
        time.minute,
        time.second,
        time.millisecond
      )
    : undefined;
}

export function dateTimeBoundary(
  date: CalendarDate | undefined,
  limit: CalendarDateTime | undefined
) {
  return date && limit && date.compare(toCalendarDate(limit)) === 0
    ? new Time(limit.hour, limit.minute, limit.second, limit.millisecond)
    : undefined;
}
