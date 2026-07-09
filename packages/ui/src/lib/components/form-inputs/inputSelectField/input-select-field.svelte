<script lang="ts" module>
  import { Select as SelectPrimitive } from 'bits-ui';
  import type { Snippet } from 'svelte';

  export type TSelectables = Array<{ label: string; value: string }>;
  export type TInputSelectFieldProps = SelectPrimitive.RootProps & {
    label: string;
    placeholder: string;
    selectables: TSelectables;
    description?: Snippet | string;
  };
</script>

<script lang="ts">
  import * as Form from '$lib/components/ui/form';
  import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';

  let {
    open = $bindable(false),
    value = $bindable(),
    label,
    placeholder,
    description,
    selectables,
    ...props
  }: TInputSelectFieldProps = $props();

  const triggerContent = $derived(selectables.find((f) => f.value === value)?.label ?? placeholder);
</script>

<div class="flex w-full flex-col gap-1">
  <Form.Control>
    {#snippet children({ props: controlProps })}
      <div class="flex min-w-full flex-col gap-1">
        {#if label}
          <Form.Label>
            {label}
            {#if props.required}
              <small class="text-destructive">*</small>
            {/if}
          </Form.Label>
        {/if}
        <Select {...controlProps} {...props} bind:value={value as never} bind:open>
          <SelectTrigger>
            {triggerContent}
          </SelectTrigger>
          <SelectContent>
            {#each selectables as selectables (selectables.value)}
              <SelectItem value={selectables.value} label={selectables.label}>
                {selectables.label}
              </SelectItem>
            {/each}
          </SelectContent>
        </Select>
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
