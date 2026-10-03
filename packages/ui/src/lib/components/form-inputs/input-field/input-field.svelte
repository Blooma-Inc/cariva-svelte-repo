<script lang="ts" module>
  import type { FieldInputs } from '$lib/types';
  import type { InputProps, InputType } from '$lib/components/ui/input';

  export type InputFieldProps = FieldInputs<InputProps> & {
    showClear?: boolean;
    floatingLabel?: boolean;
  };
</script>

<script lang="ts">
  import * as Form from '$lib/components/ui/form';
  import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput
  } from '$lib/components/ui/input-group';
  import { cn } from '$lib/utils';
  import XIcon from '@lucide/svelte/icons/x';
  import EyeIcon from '@lucide/svelte/icons/eye';
  import EyeClosedIcon from '@lucide/svelte/icons/eye-closed';
  import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';

  let {
    ref = $bindable(null),
    value = $bindable(),
    showClear = false,
    floatingLabel = true,
    label,
    description,
    type,
    isLoading,
    ...props
  }: InputFieldProps = $props();

  let showPassword = $state(false);
  let focused = $state(false);

  let derivedType = $derived(
    (type === 'password' ? (showPassword ? 'text' : 'password') : type) as InputType
  );

  let isFloating = $derived(focused || (value !== undefined && value !== null && value !== ''));
</script>

<div class="relative flex w-full flex-col gap-1">
  <Form.Control>
    {#snippet children({ props: controlProps })}
      <div class="relative flex w-full flex-col gap-1">
        {#if label && !floatingLabel}
          <Form.Label>
            {label}
            {#if props.required}
              <small class="text-destructive">*</small>
            {/if}
          </Form.Label>
        {/if}

        <div
          class="relative"
          onfocusin={() => (focused = true)}
          onfocusout={() => (focused = false)}
        >
          <InputGroup>
            <InputGroupInput
              bind:ref
              bind:value
              {...controlProps}
              {...props}
              type={derivedType}
              placeholder={floatingLabel ? '' : props.placeholder}
              class={cn(floatingLabel && 'placeholder:text-transparent', props.class)}
            />
            <InputGroupAddon align="inline-end" class="gap-0.5">
              {#if showClear && value}
                <InputGroupButton
                  size="icon-xs"
                  variant="secondary"
                  onclick={() => {
                    value = '';
                  }}
                >
                  <XIcon class="size-3" />
                </InputGroupButton>
              {/if}

              {#if type === 'password'}
                <InputGroupButton
                  size="icon-xs"
                  variant="secondary"
                  onclick={() => (showPassword = !showPassword)}
                >
                  {#if showPassword}
                    <EyeIcon class="size-3" />
                  {:else}
                    <EyeClosedIcon class="size-3" />
                  {/if}
                </InputGroupButton>
              {/if}

              {#if isLoading}
                <InputGroupButton size="icon-xs" variant="secondary">
                  <LoaderCircleIcon class="text-primary size-3 animate-spin" />
                </InputGroupButton>
              {/if}
            </InputGroupAddon>
          </InputGroup>

          {#if floatingLabel && label}
            <Form.Label
              class={cn(
                'text-muted-foreground pointer-events-none absolute left-3 transition-all duration-150 ease-out select-none',
                isFloating
                  ? 'bg-background text-foreground top-0 -translate-y-1/2 px-1 text-xs'
                  : 'top-1/2 -translate-y-1/2 text-sm'
              )}
            >
              {label}
              {#if props.required}
                <small class="text-destructive">*</small>
              {/if}
            </Form.Label>
          {/if}
        </div>
      </div>
    {/snippet}
  </Form.Control>

  {#if description}
    <Form.Description>
      {#if typeof description === 'string'}
        {description}
      {:else}
        {@render description()}
      {/if}
    </Form.Description>
  {/if}

  <Form.FieldErrors />
</div>
