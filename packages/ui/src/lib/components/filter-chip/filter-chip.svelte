<script lang="ts">
  import { tick, untrack } from 'svelte';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import XIcon from '@lucide/svelte/icons/x';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import * as Sheet from '$lib/components/ui/sheet/index.js';
  import { IsMobile } from '$lib/hooks/is-mobile.svelte.js';
  import { cn } from '$lib/utils.js';
  import FilterChipOptions from './filter-chip-options.svelte';
  import {
    copyValue,
    defaultLabels,
    emptyValue,
    equalValues,
    isEmpty,
    summarize
  } from './value.js';
  import type { FilterChipProps, FilterValue } from './types.js';

  let {
    label,
    value = $bindable(),
    onValueChange,
    defaultValue,
    options = [],
    multiple = false,
    mode = 'immediate',
    formatSummary,
    children,
    disabled = false,
    open = $bindable(false),
    onOpenChange,
    showFooter = true,
    labels: labelOverrides,
    side = 'bottom',
    align = 'start',
    leadingIcon: LeadingIcon,
    class: className
  }: FilterChipProps = $props();

  const mobile = new IsMobile();
  const Root = $derived(mobile.current ? Sheet.Root : Popover.Root);
  const Trigger = $derived(mobile.current ? Sheet.Trigger : Popover.Trigger);
  let trigger = $state<HTMLButtonElement | null>(null);
  let panel = $state<HTMLDivElement | null>(null);
  let draft = $state<FilterValue>(null);
  let themeStyle = $state('');
  let themeClass = $state('');
  let sessionOpen = false;
  const labels = $derived({ ...defaultLabels, ...labelOverrides });
  const resetValue = $derived(
    defaultValue === undefined ? emptyValue(value, multiple) : defaultValue
  );
  const editingValue = $derived(mode === 'apply' ? draft : value);
  const selected = $derived(!isEmpty(value));
  const removable = $derived(selected && !equalValues(value, resetValue));
  const canClear = $derived(!equalValues(editingValue, resetValue));
  const summary = $derived(
    formatSummary ? formatSummary(value) : summarize(value, options, labels)
  );

  function captureTheme() {
    if (!trigger) return;
    const style = getComputedStyle(trigger);
    themeStyle =
      Array.from(style)
        .filter(
          (name) =>
            name.startsWith('--') && !name.startsWith('--tw-') && !name.startsWith('--bits-')
        )
        .map((name) => `${name}: ${style.getPropertyValue(name)};`)
        .join('') + `font-family: ${style.fontFamily}; color-scheme: ${style.colorScheme};`;
    const theme = trigger.closest('.dark, .light');
    themeClass = theme?.classList.contains('dark')
      ? 'dark'
      : theme?.classList.contains('light')
        ? 'light'
        : '';
  }

  function setOpen(next: boolean) {
    if (next && disabled) return;
    if (next && !open) {
      draft = copyValue(value);
      captureTheme();
    }
    open = next;
    onOpenChange?.(next);
  }

  $effect(() => {
    if (open && disabled) setOpen(false);
    if (open && !sessionOpen) {
      draft = copyValue(untrack(() => value));
      captureTheme();
    }
    if (!open) draft = null;
    sessionOpen = open;
  });

  function commit(next: FilterValue) {
    value = copyValue(next);
    onValueChange?.(copyValue(value));
  }

  function setValue(next: FilterValue) {
    if (disabled) return;
    if (mode === 'apply') draft = copyValue(next);
    else commit(next);
  }

  function select(next: FilterValue) {
    setValue(next);
    if (mode === 'immediate' && !multiple) setOpen(false);
  }

  function clear() {
    if (!disabled && canClear) setValue(copyValue(resetValue));
  }

  async function remove() {
    if (disabled || !removable) return;
    commit(resetValue);
    setOpen(false);
    await tick();
    trigger?.focus();
  }

  function focusEditor(event: Event) {
    event.preventDefault();
    (panel?.querySelector<HTMLInputElement>('input[type="search"]') ?? panel)?.focus();
  }

  function restoreFocus(event: Event) {
    event.preventDefault();
    trigger?.focus();
  }
</script>

{#snippet editor()}
  <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
    {#if children}
      {@render children({ value: editingValue, setValue, close: () => setOpen(false) })}
    {:else}
      <FilterChipOptions
        {label}
        value={editingValue}
        {options}
        {multiple}
        {disabled}
        {labels}
        onChange={select}
      />
    {/if}
  </div>
  {#if showFooter}
    <div
      class="border-border flex shrink-0 items-center gap-2 border-t p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <Button
        variant="ghost"
        size={mobile.current ? 'lg' : 'sm'}
        disabled={disabled || !canClear}
        onclick={clear}>{labels.clear}</Button
      >
      <div class="flex-1"></div>
      {#if mode === 'apply'}
        <Button variant="outline" size={mobile.current ? 'lg' : 'sm'} onclick={() => setOpen(false)}
          >{labels.cancel}</Button
        >
        <Button
          size={mobile.current ? 'lg' : 'sm'}
          {disabled}
          onclick={() => {
            commit(draft);
            setOpen(false);
          }}>{labels.apply}</Button
        >
      {:else}
        <Button size={mobile.current ? 'lg' : 'sm'} onclick={() => setOpen(false)}
          >{labels.done}</Button
        >
      {/if}
    </div>
  {/if}
{/snippet}

<Root bind:open={() => open, setOpen}>
  <div
    data-slot="filter-chip"
    data-selected={selected}
    data-disabled={disabled}
    class={cn(
      'border-border text-muted-foreground inline-flex h-8 max-w-full items-center rounded-full border border-dashed text-sm [@media(pointer:coarse)]:h-10',
      (selected || open) && 'border-primary text-primary border-solid',
      selected && 'bg-primary/10',
      disabled && 'opacity-50',
      className
    )}
  >
    <Trigger>
      {#snippet child({ props })}
        <Button
          {...props}
          bind:ref={trigger}
          variant="ghost"
          {disabled}
          aria-expanded={open}
          class="h-full min-w-0 gap-1.5 rounded-full px-3 text-sm font-normal text-inherit"
        >
          {#if LeadingIcon}<LeadingIcon class="size-3.5 shrink-0" />{:else if !selected}<PlusIcon
              class="size-3.5 shrink-0"
            />{/if}
          <span class="truncate"
            >{label}{#if selected}: <span class="font-semibold">{summary}</span>{/if}</span
          >
        </Button>
      {/snippet}
    </Trigger>
    {#if removable}
      <Button
        variant="ghost"
        size="icon-sm"
        {disabled}
        aria-label={labels.remove(label)}
        onclick={remove}
        class="mr-1 h-full w-7 shrink-0 rounded-full text-inherit [@media(pointer:coarse)]:w-9"
        ><XIcon class="size-3.5" /></Button
      >
    {/if}
  </div>
  {#if mobile.current}
    <Sheet.Content
      bind:ref={panel}
      tabindex={-1}
      onOpenAutoFocus={focusEditor}
      side="bottom"
      showCloseButton={false}
      class={cn('max-h-[85dvh] gap-0 overflow-hidden rounded-t-2xl', themeClass)}
      style={themeStyle}
      onCloseAutoFocus={restoreFocus}
    >
      <div class="bg-muted mx-auto mt-2 h-1 w-10 shrink-0 rounded-full" aria-hidden="true"></div>
      <Sheet.Header class="shrink-0 px-3 pt-3 pb-0"><Sheet.Title>{label}</Sheet.Title></Sheet.Header
      >
      {@render editor()}
    </Sheet.Content>
  {:else}
    <Popover.Content
      bind:ref={panel}
      tabindex={-1}
      onOpenAutoFocus={focusEditor}
      {side}
      {align}
      sideOffset={6}
      collisionPadding={12}
      aria-label={label}
      class={cn(
        'max-h-[min(85dvh,var(--bits-popover-content-available-height))] w-72 max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden rounded-2xl p-0 shadow-xl shadow-black/15',
        themeClass
      )}
      style={themeStyle}
      onCloseAutoFocus={restoreFocus}
    >
      {@render editor()}
    </Popover.Content>
  {/if}
</Root>
