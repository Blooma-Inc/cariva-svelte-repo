import type { CalendarDate, CalendarDateTime, DateValue, Time } from '@internationalized/date';

export type DateRangeValue = { start: CalendarDate | undefined; end: CalendarDate | undefined };
export type DateTimeRangeValue = {
  start: CalendarDateTime | undefined;
  end: CalendarDateTime | undefined;
};
export type EditState = { incomplete: boolean; hasInput: boolean };
export interface FieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  floatingLabel?: boolean;
  showClear?: boolean;
  form?: string;
  id?: string;
  class?: string;
  'aria-describedby'?: string;
  ref?: HTMLDivElement | null;
  onEditStateChange?: (state: EditState) => void;
  internal?: boolean;
}
export interface DateOptions {
  locale?: string;
  placeholder?: DateValue;
  minValue?: CalendarDate;
  maxValue?: CalendarDate;
  isDateDisabled?: (date: DateValue) => boolean;
  isDateUnavailable?: (date: DateValue) => boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  numberOfMonths?: number;
}
export interface DateFieldProps extends FieldProps, DateOptions {
  value?: CalendarDate;
  defaultValue?: CalendarDate;
  onValueChange?: (value: CalendarDate | undefined) => void;
  name?: string;
}
export interface DateRangeFieldProps extends FieldProps, DateOptions {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onValueChange?: (value: DateRangeValue) => void;
  startName?: string;
  endName?: string;
}
export interface TimeFieldProps extends FieldProps {
  value?: Time;
  defaultValue?: Time;
  onValueChange?: (value: Time | undefined) => void;
  name?: string;
  minValue?: Time;
  maxValue?: Time;
  hourCycle?: 12 | 24;
  granularity?: 'hour' | 'minute' | 'second';
  isLoading?: boolean;
}
export interface DateTimeFieldProps extends FieldProps, Omit<DateOptions, 'minValue' | 'maxValue'> {
  value?: CalendarDateTime;
  defaultValue?: CalendarDateTime;
  onValueChange?: (value: CalendarDateTime | undefined) => void;
  name?: string;
  minValue?: CalendarDateTime;
  maxValue?: CalendarDateTime;
  hourCycle?: 12 | 24;
  granularity?: 'hour' | 'minute' | 'second';
}
export interface DateRangeTimeFieldProps extends Omit<
  DateTimeFieldProps,
  'value' | 'defaultValue' | 'onValueChange' | 'name'
> {
  value?: DateTimeRangeValue;
  defaultValue?: DateTimeRangeValue;
  onValueChange?: (value: DateTimeRangeValue) => void;
  startName?: string;
  endName?: string;
}
