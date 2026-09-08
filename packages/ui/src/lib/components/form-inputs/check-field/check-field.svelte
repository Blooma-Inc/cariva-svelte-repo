<script lang="ts" module>
  import { Checkbox as CheckboxPrimitive } from 'bits-ui';
  import { type Snippet } from 'svelte';

  export type CheckFieldProps = CheckboxPrimitive.RootProps & {
    label?: string;
    description?: Snippet | string;
  };
</script>

<script lang="ts">
  import * as Form from '$lib/components/ui/form';
  import { Checkbox } from '$lib/components/ui/checkbox/index.js';

  let {
    ref = $bindable(null),
    checked = $bindable(false),
    id,
    label,
    description,
    ...props
  }: CheckFieldProps = $props();
</script>

<div class="relative flex w-full flex-col gap-1">
  <Form.Control>
    {#snippet children({ props: controlProps })}
      <div class="relative flex w-full flex-col gap-1">
        <div class="flex items-center gap-3">
          <Checkbox bind:ref bind:checked {...controlProps} {...props} />

          <div class="grid gap-2">
            {#if label}
              <Form.Label for={id}>
                {label}
              </Form.Label>
            {/if}

            {#if description}
              <Form.Description>
                {#if typeof description === 'string'}
                  {description}
                {:else}
                  {@render description()}
                {/if}
              </Form.Description>
            {/if}
          </div>
        </div>
      </div>
    {/snippet}
  </Form.Control>
  <Form.FieldErrors />
</div>
