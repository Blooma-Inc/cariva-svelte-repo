<script lang="ts" module>
  import type { FieldInputs } from '$lib/types';
  import { type TextareaProps } from '$lib/components/ui/textarea';

  export type TextareaFieldProps = FieldInputs<TextareaProps>;
</script>

<script lang="ts">
  import { Textarea } from '$lib/components/ui/textarea';
  import * as Form from '$lib/components/ui/form';

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
          <Form.Label>
            {label}
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
