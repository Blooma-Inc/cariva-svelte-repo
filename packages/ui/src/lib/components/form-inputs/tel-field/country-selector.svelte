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
    /** List of countries */
    countries: Country[];
    disabled?: boolean;
    selected?: CountryCode | null;
    /** Default ordering is alphabetical by country name supply this function to customize the sorting behavior  */
    order?: (a: Country, b: Country) => number;
  }

  let {
    countries,
    disabled = false,
    selected = $bindable(null),
    order = (a, b) => {
      return a.name.localeCompare(b.name);
    }
  }: Props = $props();

  let selectedCountry = $derived(countries.find((a) => a.iso2 == selected));

  let open = $state(false);

  const selectCountry = (country: Country) => {
    selected = country.iso2;
    open = false;
    dispatch('select', selected);
  };
</script>

<Popover.Root bind:open>
  <Popover.Trigger>
    {#snippet child({ props }: { props: ButtonProps })}
      <button {disabled} {...props} class={cn('flex flex-row items-center gap-1', props.class)}>
        <Flag country={selectedCountry} />
        {#if selectedCountry}
          <small>+{selectedCountry.dialCode}</small>
        {/if}
        <ChevronDownIcon class={cn('size-3 opacity-50', disabled ? 'hidden' : 'opacity-100')} />
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
