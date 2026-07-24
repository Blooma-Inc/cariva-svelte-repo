<script lang="ts" module>
  import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';

  export interface RadioItemDataProps {
    label: string;
    description?: string;
    value: string;
  }
  export interface RadioFieldProps extends RadioGroupPrimitive.RootProps {
    items: Array<RadioItemDataProps>;
  }
</script>

<script lang="ts">
  import { RadioGroup } from 'bits-ui';
  import RadioGroupCardItem from './radio-group-card-item.svelte';

  let {
    ref = $bindable(null),
    value = $bindable(''),
    items,
    ...restProps
  }: RadioFieldProps = $props();
</script>

<RadioGroup.Root bind:ref bind:value {...restProps}>
  {#each items as item (item.value)}
    <RadioGroupCardItem
      value={item.value}
      label={item.label}
      description={item.description ?? ''}
    />
  {/each}
</RadioGroup.Root>
