import { type Snippet } from 'svelte';

export type FieldInputs<T> = T & {
  label: string;
  description?: Snippet | string;
};
