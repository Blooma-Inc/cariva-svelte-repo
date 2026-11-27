<script lang="ts" module>
  import type { FieldInputs } from '$lib/types';
  import { type TextareaProps } from '$lib/components/ui/textarea';

  export type TextareaFieldProps = FieldInputs<TextareaProps> & {
    floatingLabel?: boolean;
  };
</script>

<script lang="ts">
  import { Textarea } from '$lib/components/ui/textarea';
  import * as Form from '$lib/components/ui/form';
  import { cn } from '$lib/utils';

  let {
    ref = $bindable(null),
    value = $bindable(),
    floatingLabel = true,
    label,
    description,
    ...props
  }: TextareaFieldProps = $props();

  let focused = $state(false);
  let isFloating = $derived(focused || (value !== undefined && value !== null && value !== ''));
</script>

<div class="relative w-full">
  <Form.Control>
    {#snippet children({ props: controlProps })}
      <div class="relative flex w-full flex-col gap-2">
        {#if label && !floatingLabel}
          <Form.Label>
            {label}
          </Form.Label>
        {/if}
        <div
          class="relative"
          onfocusin={() => (focused = true)}
          onfocusout={() => (focused = false)}
        >
          <Textarea
            bind:ref
            bind:value
            {...controlProps}
            {...props}
            placeholder={floatingLabel && label && !isFloating ? '' : props.placeholder}
            class={cn(floatingLabel && label && isFloating && 'pt-9 pb-4', props.class)}
          />

          {#if floatingLabel && label}
            <Form.Label
              class={cn(
                'text-muted-foreground pointer-events-none absolute left-3 transition-all duration-150 ease-out select-none',
                isFloating
                  ? 'text-foreground top-3 right-3 bg-white py-0.5 text-xs leading-none'
                  : 'top-3 text-sm'
              )}
            >
              {label}
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
