<script lang="ts" module>
  import type { FieldInputs } from '$lib/types';
  import type { InputProps, InputType } from '$lib/components/ui/input';

  export type InputFieldProps = FieldInputs<InputProps>;
</script>

<script lang="ts">
  import * as Form from '$lib/components/ui/form';
  import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput
  } from '$lib/components/ui/input-group';
  import { EyeClosedIcon, EyeIcon, LoaderCircleIcon } from '@lucide/svelte';

  let {
    ref = $bindable(null),
    value = $bindable(),
    label,
    description,
    type,
    isLoading,
    ...props
  }: InputFieldProps = $props();
  let showPassword = $state(false);
  let derivedType = $derived(
    (type === 'password' ? (showPassword ? 'text' : 'password') : type) as InputType
  );
</script>

<div class="relative flex w-full flex-col gap-1">
  <Form.Control>
    {#snippet children({ props: controlProps })}
      <div class="relative flex w-full flex-col gap-1">
        {#if label}
          <Form.Label>
            {label}
            {#if props.required}
              <small class="text-destructive">*</small>
            {/if}
          </Form.Label>
        {/if}
        <InputGroup>
          <InputGroupInput bind:ref bind:value {...controlProps} {...props} type={derivedType} />
          {#if type === 'password'}
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                variant="ghost"
                onclick={() => (showPassword = !showPassword)}
              >
                {#if showPassword}
                  <EyeIcon class="size-3" />
                {:else}
                  <EyeClosedIcon class="size-3" />
                {/if}
              </InputGroupButton>
            </InputGroupAddon>
          {/if}

          {#if isLoading}
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" variant="ghost">
                <LoaderCircleIcon class="text-primary size-3 animate-spin" />
              </InputGroupButton>
            </InputGroupAddon>
          {/if}
        </InputGroup>
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
