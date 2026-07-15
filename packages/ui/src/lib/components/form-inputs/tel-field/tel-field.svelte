<script lang="ts" module>
  import type { FieldInputs } from '$lib/types';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { type WithElementRef } from '$lib/utils.js';
  import type { CountryCode, Country } from 'svelte-tel-input/types';

  export type TelFieldProps = FieldInputs<
    WithElementRef<HTMLInputAttributes> & {
      country?: CountryCode | null;
      defaultCountry?: CountryCode | null;
      el?: HTMLInputElement;
      name?: string;
      placeholder?: string;
      disabled?: boolean;
      readonly?: boolean;
      class?: string;
      value: string; // stored as E.164
      valid?: boolean;
      initialFormat?: 'international' | 'national';
      required?: boolean;
      order?: ((a: Country, b: Country) => number) | undefined;
    }
  >;
</script>

<script lang="ts">
  import CountrySelector from './country-selector.svelte';
  import { InputGroup, InputGroupAddon, InputGroupInput } from '$lib/components/ui/input-group';
  import * as Form from '$lib/components/ui/form';
  import { countries } from 'svelte-tel-input/assets';
  import { AsYouType, parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';

  let {
    ref = $bindable(null),
    class: className = undefined,
    defaultCountry = null,
    country = $bindable(defaultCountry),
    placeholder = $bindable(undefined),
    readonly = $bindable(false),
    disabled = $bindable(false),
    value = $bindable(''),
    valid = $bindable(false),
    order = undefined,
    initialFormat = 'international',
    name = undefined,
    label,
    description,
    ...rest
  }: TelFieldProps = $props();

  let rawInput = $state(''); // what the user actually sees/types

  // Seed the visible field from an incoming E.164 value (edit mode / re-seeded forms)
  $effect(() => {
    if (value && !rawInput) {
      const parsed = parsePhoneNumberFromString(value);
      if (parsed) {
        country = parsed.country ?? country;
        rawInput =
          initialFormat === 'national' ? parsed.formatNational() : parsed.formatInternational();
      }
    }
  });

  function handleInput(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const formatter = new AsYouType(country ?? undefined);
    const formatted = formatter.input(input.value);
    rawInput = formatted;

    const parsed = formatter.getNumber();
    if (parsed) {
      value = parsed.number; // E.164
      valid = parsed.isValid();
      // AsYouType infers country from the number itself (e.g. a typed +234...)
      if (parsed.country && parsed.country !== country) {
        country = parsed.country;
      }
    } else {
      value = '';
      valid = false;
    }
  }

  function handleCountryChange() {
    // Re-validate against the newly selected country without discarding what's typed
    if (rawInput) {
      const formatter = new AsYouType(country ?? undefined);
      rawInput = formatter.input(rawInput);
      const parsed = formatter.getNumber();
      value = parsed?.number ?? '';
      valid = parsed ? isValidPhoneNumber(parsed.number) : false;
    }
  }
</script>

<div class="relative flex w-full flex-col gap-1">
  <Form.Control>
    {#snippet children({ props: controlProps })}
      {#if label}
        <Form.Label>
          {label}
          {#if rest.required}
            <small class="text-destructive">*</small>
          {/if}
        </Form.Label>
      {/if}

      <InputGroup>
        <InputGroupAddon align="inline-start">
          <CountrySelector
            {order}
            {countries}
            bind:selected={country}
            on:select={handleCountryChange}
          />
        </InputGroupAddon>
        <InputGroupInput
          {...controlProps}
          {...rest}
          bind:ref
          bind:value={rawInput}
          oninput={handleInput}
          {readonly}
          {disabled}
          {placeholder}
          {name}
          type="tel"
          class={className}
          required={rest.required}
        />
      </InputGroup>
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
