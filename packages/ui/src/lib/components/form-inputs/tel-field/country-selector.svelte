<script lang="ts">
  import * as Popover from '$lib/components/ui/popover';
  import { type ButtonProps } from '$lib/components/ui/button';
  import * as Command from '$lib/components/ui/command';
  import { ScrollArea } from '$lib/components/ui/scroll-area';
  import { CircleCheckIcon, ChevronDownIcon } from '@lucide/svelte';
  import { cn } from '$lib/utils';
  import Flag from './flag.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { Country, CountryCode } from 'svelte-tel-input/types';
  import 'svelte-tel-input/styles/flags.css';

  const dispatch = createEventDispatcher();

  interface Props {
    countries: Country[];
    disabled?: boolean;
    selected?: CountryCode | null;
    order?: (a: Country, b: Country) => number;
    label?: string;
    floatingLabel?: boolean;
    isFloating?: boolean;
    open?: boolean;
    class?: string;
  }

  let {
    countries,
    disabled = false,
    selected = $bindable(null),
    order = (a, b) => {
      return a.name.localeCompare(b.name);
    },
    label = 'Country',
    floatingLabel = true,
    isFloating = false,
    open = $bindable(false),
    class: className = undefined
  }: Props = $props();

  let selectedCountry = $derived(countries.find((a) => a.iso2 == selected));

  const selectCountry = (country: Country) => {
    selected = country.iso2;
    open = false;
    dispatch('select', selected);
  };
</script>

<div
  class={cn(
    'relative flex items-center gap-1',
    floatingLabel && 'border-border bg-background h-14 rounded-xl border px-3 sm:h-16',
    className
  )}
>
  <Popover.Root bind:open>
    <Popover.Trigger>
      {#snippet child({ props }: { props: ButtonProps })}
        <button
          {disabled}
          {...props}
          class={cn(
            'focus-visible:ring-ring flex h-full min-w-0 flex-1 flex-row items-center gap-1 outline-none focus-visible:ring-2',
            props.class
          )}
        >
          <span
            class={cn(
              'flex min-w-0 flex-1 items-center gap-1',
              floatingLabel && isFloating && 'pt-7 pb-2'
            )}
          >
            <Flag country={selectedCountry} />
            {#if selectedCountry}
              <small>+{selectedCountry.dialCode}</small>
            {/if}
          </span>
          <span
            aria-hidden="true"
            class={cn(
              'bg-secondary text-secondary-foreground -mr-1 flex size-6 shrink-0 items-center justify-center rounded-xl',
              disabled && 'hidden'
            )}
          >
            <ChevronDownIcon class="size-3" />
          </span>
        </button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-75 p-0">
      <Command.Root>
        <Command.Input placeholder="Search country..." class="border-none!" />
        <Command.List>
          <ScrollArea class="h-72">
            <Command.Empty>No country found.</Command.Empty>
            <Command.Group>
              {#each countries.sort(order) as country (country.id)}
                <Command.Item
                  class="gap-2"
                  value={country.name}
                  onSelect={() => selectCountry(country)}
                >
                  <Flag {country} />
                  <span class="flex-1 text-sm">{country.name}</span>
                  <span class="text-foreground/50 text-sm">
                    +{country.dialCode}
                  </span>
                  <div class="w-4">
                    {#if country.iso2 == selected}
                      <CircleCheckIcon class="size-3" />
                    {/if}
                  </div>
                </Command.Item>
              {/each}
            </Command.Group>
          </ScrollArea>
        </Command.List>
      </Command.Root>
    </Popover.Content>
  </Popover.Root>

  {#if floatingLabel && label}
    <span
      class={cn(
        'text-muted-foreground pointer-events-none absolute left-3 transition-all duration-150 ease-out select-none',
        isFloating
          ? 'text-foreground top-3 text-xs leading-none'
          : 'top-1/2 -translate-y-1/2 text-sm'
      )}
    >
      {label}
    </span>
  {/if}
</div>
