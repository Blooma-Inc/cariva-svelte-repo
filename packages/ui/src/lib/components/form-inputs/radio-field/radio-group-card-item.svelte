<script lang="ts">
  import { RadioGroup } from 'bits-ui';
  import { cn } from '$lib/utils';

  type Props = {
    value: string;
    label: string;
    description?: string;
    class?: string;
  };

  let { value, label, description, class: className }: Props = $props();
</script>

<div class="relative">
  <RadioGroup.Item {value} id={value} class="peer sr-only" />
  <label
    for={value}
    class={cn(
      'border-border bg-background block cursor-pointer rounded-xl border p-3 transition-colors',
      'hover:border-muted-foreground/50',
      'peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5',
      'peer-focus-visible:ring-ring peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
      className
    )}
  >
    <p class="leading-none font-medium">{label}</p>
    {#if description}
      <p class="text-muted-foreground mt-1">{description}</p>
    {/if}
  </label>
</div>
