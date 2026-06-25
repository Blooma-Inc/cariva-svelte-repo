<script lang="ts">
  import type { FieldInputs } from '$lib/types';
  import { Textarea, type TextareaProps } from '$lib/components/ui/textarea';
  import * as Form from '$lib/components/ui/form';

  type TextareaFieldProps = FieldInputs<TextareaProps>;

  let {
    ref = $bindable(null),
    value = $bindable(),
    label,
    description,
    ...props
  }: TextareaFieldProps = $props();
</script>

<div class="relative w-full">
  <Form.Control>
    {#snippet children({ props: controlProps })}
      <div class="relative flex w-full flex-col gap-2">
        {#if label}
          <Form.Label class="flex items-center justify-start space-x-1">
            <p>{label}</p>
            {#if props.required}
              <small class="text-destructive">*</small>
            {/if}
          </Form.Label>
        {/if}
        <Textarea bind:ref bind:value {...controlProps} {...props} />
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
