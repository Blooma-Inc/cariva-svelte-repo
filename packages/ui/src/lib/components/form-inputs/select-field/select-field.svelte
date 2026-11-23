<script lang="ts" module>
  import { Select as SelectPrimitive } from 'bits-ui';
  import type { Snippet } from 'svelte';

  export type Selectables = Array<{ label: string; value: string; enable: boolean }>;
  export type SelectFieldProps = SelectPrimitive.RootProps & {
    label: string;
    placeholder: string;
    selectables: Selectables;
    description?: Snippet | string;
    floatingLabel?: boolean;
  };
</script>

<script lang="ts">
  import * as Form from '$lib/components/ui/form';
  import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';

  let {
    open = $bindable(false),
    value = $bindable(),
    floatingLabel = true,
    label,
    placeholder,
    description,
    selectables,
    ...props
  }: SelectFieldProps = $props();

  const triggerContent = $derived(selectables.find((f) => f.value === value)?.label ?? placeholder);
</script>

<div class="flex w-full flex-col gap-1">
  <Form.Control>
    {#snippet children({ props: controlProps })}
      <div class="flex min-w-full flex-col gap-1">
        {#if label && !floatingLabel}
          <Form.Label>
            {label}
          </Form.Label>
        {/if}
        <Select {...controlProps} {...props} bind:value={value as never} bind:open>
          <SelectTrigger {floatingLabel} {label}>
            {triggerContent}
          </SelectTrigger>
          <SelectContent class="max-h-60">
            {#each selectables as selectables (selectables.value)}
              <SelectItem
                disabled={!selectables.enable}
                value={selectables.value}
                label={selectables.label}
              >
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
