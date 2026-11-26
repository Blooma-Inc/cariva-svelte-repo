<script lang="ts">
  import { Checkbox } from '$lib/components/ui/checkbox/index.js';
  import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { cn } from '$lib/utils.js';
  import type { FilterChipLabels, FilterOption, FilterValue } from './types.js';

  let {
    label,
    value,
    options,
    multiple,
    disabled,
    labels,
    onChange
  }: {
    label: string;
    value: FilterValue;
    options: FilterOption[];
    multiple: boolean;
    disabled: boolean;
    labels: FilterChipLabels;
    onChange: (value: FilterValue) => void;
  } = $props();

  const id = $props.id();
  let search = $state('');
  let list: HTMLDivElement | undefined = $state();
  const visible = $derived(
    search.trim()
      ? options.filter((option) =>
          option.label.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
        )
      : options.slice(0, 8)
  );
  const radioValue = $derived(
    options.findIndex((option) => Object.is(option.value, value)) < 0
      ? ''
      : String(options.findIndex((option) => Object.is(option.value, value)))
  );

  function checked(option: FilterOption) {
    return Array.isArray(value) && value.some((item) => Object.is(item, option.value));
  }

  function toggle(option: FilterOption, selected: boolean) {
    if (disabled || option.disabled) return;
    const current = Array.isArray(value) ? value : [];
    onChange(
      selected
        ? [...current, option.value]
        : current.filter((item) => !Object.is(item, option.value))
    );
  }

  function navigate(event: KeyboardEvent) {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const items = Array.from(
      list?.querySelectorAll<HTMLButtonElement>('[role="checkbox"]:not(:disabled)') ?? []
    );
    if (!items.length) return;
    event.preventDefault();
    const index = items.indexOf(event.currentTarget as HTMLButtonElement);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  }
</script>

{#if options.length > 8}
  <Input
    type="search"
    aria-label={labels.search}
    placeholder={labels.search}
    bind:value={search}
    {disabled}
    class="mb-2 h-9 shrink-0"
  />
{/if}

{#snippet rows()}
  {#each visible as option, index (option.value)}
    {#if option.group && (index === 0 || visible[index - 1]?.group !== option.group)}
      <div
        class={cn(
          'text-muted-foreground px-2 py-1 text-xs font-semibold',
          index > 0 && 'border-border mt-2 border-t pt-2'
        )}
      >
        {option.group}
      </div>
    {/if}
    <Label
      for={`${id}-${options.indexOf(option)}`}
      class={cn(
        'hover:bg-accent focus-within:bg-accent flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm',
        (disabled || option.disabled) && 'pointer-events-none opacity-50'
      )}
    >
      {#if multiple}
        <Checkbox
          id={`${id}-${options.indexOf(option)}`}
          checked={checked(option)}
          disabled={disabled || option.disabled}
          onCheckedChange={(selected) => toggle(option, selected)}
          onkeydown={navigate}
        />
      {:else}
        <RadioGroup.Item
          id={`${id}-${options.indexOf(option)}`}
          value={String(options.indexOf(option))}
          disabled={disabled || option.disabled}
          onclick={() => {
            if (!disabled && !option.disabled && Object.is(value, option.value))
              onChange(option.value);
          }}
        />
      {/if}
      <span class="min-w-0 flex-1 truncate">{option.label}</span>
      {#if option.count !== undefined}
        <span class={cn('text-xs tabular-nums', option.count === 0 && 'text-muted-foreground')}
          >{option.count}</span
        >
      {/if}
    </Label>
  {/each}
{/snippet}

<div bind:this={list} class="min-h-0">
  {#if !visible.length}
    <p class="text-muted-foreground px-2 py-3 text-sm" role="status">{labels.noResults}</p>
  {:else if multiple}
    <div role="group" aria-label={label} class="grid gap-1">{@render rows()}</div>
  {:else}
    <RadioGroup.Root
      value={radioValue}
      onValueChange={(index) => {
        const option = options[Number(index)];
        if (option && !disabled && !option.disabled) onChange(option.value);
      }}
      orientation="vertical"
      loop
      aria-label={label}
      class="gap-1"
    >
      {@render rows()}
    </RadioGroup.Root>
  {/if}
</div>

{#if !search.trim() && options.length > 8}
  <p class="text-muted-foreground px-2 pt-2 text-xs">{labels.remaining(options.length - 8)}</p>
{/if}
