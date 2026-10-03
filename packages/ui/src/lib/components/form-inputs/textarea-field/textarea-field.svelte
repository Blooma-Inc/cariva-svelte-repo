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
          <Textarea
            bind:ref
            bind:value
            {...controlProps}
            {...props}
            placeholder={floatingLabel ? '' : props.placeholder}
            class={cn(floatingLabel && 'placeholder:text-transparent', props.class)}
          />

          {#if floatingLabel && label}
            <Form.Label
              class={cn(
                'text-muted-foreground pointer-events-none absolute left-3 transition-all duration-150 ease-out select-none',
                isFloating
                  ? 'bg-background text-foreground top-0 -translate-y-1/2 px-1 text-xs'
                  : 'top-16 -translate-y-10 text-sm'
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
