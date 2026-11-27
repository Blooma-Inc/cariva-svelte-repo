<script lang="ts">
  import { InputGroupButton } from '$lib/components/ui/input-group/index.js';
  import { TimeField as Primitive } from 'bits-ui';
  import { tick, untrack } from 'svelte';
  import XIcon from '@lucide/svelte/icons/x';
  import LoaderIcon from '@lucide/svelte/icons/loader-circle';
  import { cn } from '$lib/utils.js';
  import FieldFrame from './field-frame.svelte';
  import FormAdapter from './form-adapter.svelte';
  import { segmentClass, editorClass, focusEditor, observeSegments } from './shared.js';
  import type { EditState, TimeFieldProps } from './types.js';
  const uid = $props.id();
  let {
    value = $bindable(),
    defaultValue,
    onValueChange,
    label,
    description,
    error,
    required = false,
    disabled = false,
    readonly = false,
    floatingLabel = true,
    showClear = true,
    name,
    form,
    id = uid,
    class: className,
    'aria-describedby': describedBy,
    ref = $bindable(null),
    onEditStateChange,
    internal = false,
    minValue,
    maxValue,
    hourCycle = 24,
    granularity = 'minute',
    isLoading = false
  }: TimeFieldProps = $props();
  const initial = untrack(() => defaultValue);
  if (value === undefined && initial !== undefined) value = initial;
  let seen = value;
  let revision = $state(0);
  let edit = $state<EditState>({ incomplete: false, hasInput: false });
  const message = $derived(
    error ||
      (edit.incomplete ? 'Complete the time.' : '') ||
      (value && minValue && value.compare(minValue) < 0
        ? `Choose a time at or after ${minValue}.`
        : '') ||
      (value && maxValue && value.compare(maxValue) > 0
        ? `Choose a time at or before ${maxValue}.`
        : '')
  );
  const ids = $derived(
    [describedBy, description ? `${id}-description` : '', message ? `${id}-error` : '']
      .filter(Boolean)
      .join(' ') || undefined
  );
  function change(next: typeof value) {
    value = next;
    seen = next;
    onValueChange?.(next);
  }
  function editing(next: EditState) {
    edit = next;
    onEditStateChange?.(next);
  }
  function reset() {
    change(initial);
    revision += 1;
    editing({ incomplete: false, hasInput: !!initial });
  }
  async function clear() {
    change(undefined);
    revision += 1;
    editing({ incomplete: false, hasInput: false });
    await tick();
    focusEditor(ref);
  }
  $effect(() => {
    if (value !== seen) {
      seen = value;
      revision += 1;
      edit = { incomplete: false, hasInput: false };
    }
  });
</script>

{#snippet labelContent()}<Primitive.Label>{label}</Primitive.Label>{/snippet}

<div bind:this={ref} class={cn('relative min-w-0', className)} aria-busy={isLoading}>
  {#key revision}
    <Primitive.Root
      {value}
      onValueChange={change}
      {minValue}
      {maxValue}
      {disabled}
      {readonly}
      {required}
      {hourCycle}
      {granularity}
      locale={hourCycle === 12 ? 'en-US' : 'en-GB'}
      validate={() => message || undefined}
      errorMessageId={message ? `${id}-error` : undefined}
    >
      <FieldFrame label={labelContent} {floatingLabel} {disabled} invalid={!!message}>
        {#snippet actions()}
          {#if isLoading}
            <span
              role="status"
              aria-label="Loading"
              class="bg-secondary flex size-6 items-center justify-center rounded-xl"
            >
              <LoaderIcon class="text-primary size-3 animate-spin" />
            </span>
          {/if}
          {#if showClear && (value || edit.hasInput)}
            <InputGroupButton
              size="icon-xs"
              variant="secondary"
              {disabled}
              aria-label={`Clear ${label}`}
              onclick={clear}><XIcon class="size-3" /></InputGroupButton
            >
          {/if}
        {/snippet}
        <div class="flex items-center gap-2">
          <div class="min-w-0 flex-1" use:observeSegments={editing}>
            <Primitive.Input {id} aria-describedby={ids} class={editorClass}>
              {#snippet children({
                segments
              })}{#each segments as segment, segmentIndex (segmentIndex)}<Primitive.Segment
                    part={segment.part}
                    class={segmentClass}>{segment.value}</Primitive.Segment
                  >{/each}{/snippet}
            </Primitive.Input>
          </div>
        </div>
      </FieldFrame>
    </Primitive.Root>
  {/key}
  {#if description}<p id={`${id}-description`} class="text-muted-foreground mt-1.5 text-xs">
      {description}
    </p>{/if}
  {#if message}<p id={`${id}-error`} class="text-destructive mt-1.5 text-xs" aria-live="polite">
      {message}
    </p>{/if}
  {#if !internal}<FormAdapter
      {name}
      value={!edit.incomplete ? (value?.toString() ?? '') : ''}
      {form}
      {disabled}
      {required}
      {message}
      editor={ref}
      onReset={reset}
    />{/if}
</div>
