<script lang="ts">
  import { focusEditor } from './shared.js';
  let {
    name,
    value = '',
    form,
    disabled = false,
    required = false,
    message = '',
    editor,
    onReset
  }: {
    name?: string;
    value?: string;
    form?: string;
    disabled?: boolean;
    required?: boolean;
    message?: string;
    editor: HTMLDivElement | null;
    onReset: () => void;
  } = $props();
  let input = $state<HTMLInputElement | null>(null);
  $effect(() => {
    input?.setCustomValidity(disabled ? '' : message);
  });
  $effect(() => {
    const reset = (event: Event) => {
      if (event.target !== input?.form) return;
      queueMicrotask(() => {
        if (!event.defaultPrevented) onReset();
      });
    };
    document.addEventListener('reset', reset, true);
    return () => document.removeEventListener('reset', reset, true);
  });
</script>

<input
  bind:this={input}
  type="text"
  {name}
  {form}
  {value}
  {disabled}
  {required}
  tabindex="-1"
  aria-hidden="true"
  class="pointer-events-none absolute size-px opacity-0"
  oninvalid={(event) => {
    event.preventDefault();
    focusEditor(editor);
  }}
/>
