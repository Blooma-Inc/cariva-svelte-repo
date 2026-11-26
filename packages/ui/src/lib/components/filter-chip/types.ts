import type { Component, Snippet } from 'svelte';
import type { IconProps } from '@lucide/svelte';

export type FilterPrimitive = string | number | boolean;
export type FilterValue =
  | FilterPrimitive
  | null
  | undefined
  | FilterValue[]
  | { [key: string]: FilterValue };

export interface FilterOption {
  value: FilterPrimitive;
  label: string;
  count?: number;
  disabled?: boolean;
  group?: string;
}

export interface FilterChipLabels {
  clear: string;
  done: string;
  cancel: string;
  apply: string;
  search: string;
  noResults: string;
  remaining: (count: number) => string;
  remove: (label: string) => string;
  minimum: (value: string) => string;
  maximum: (value: string) => string;
}

export interface FilterEditorContext {
  value: FilterValue;
  setValue: (value: FilterValue) => void;
  close: () => void;
}

export interface FilterChipProps {
  label: string;
  value?: FilterValue;
  onValueChange?: (value: FilterValue) => void;
  defaultValue?: FilterValue;
  options?: FilterOption[];
  multiple?: boolean;
  mode?: 'immediate' | 'apply';
  formatSummary?: (value: FilterValue) => string;
  children?: Snippet<[FilterEditorContext]>;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showFooter?: boolean;
  labels?: Partial<FilterChipLabels>;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  leadingIcon?: Component<IconProps>;
  class?: string;
}
