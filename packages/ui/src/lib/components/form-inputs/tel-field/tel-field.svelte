<script lang="ts" module>
  import type { FieldInputs } from '$lib/types';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { cn, type WithElementRef } from '$lib/utils.js';
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
      value: string;
      valid?: boolean;
      initialFormat?: 'international' | 'national';
      required?: boolean;
      floatingLabel?: boolean;
      countryLabel?: string;
      order?: ((a: Country, b: Country) => number) | undefined;
    }
  >;
</script>

<script lang="ts">
  import CountrySelector from './country-selector.svelte';
  import { InputGroup, InputGroupInput } from '$lib/components/ui/input-group';
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
    floatingLabel = true,
    countryLabel = 'Country',
    order = undefined,
    initialFormat = 'international',
    name = undefined,
    label,
    description,
    ...rest
  }: TelFieldProps = $props();

  let rawInput = $state('');
  let focused = $state(false);
  let countryOpen = $state(false);

  let isFloating = $derived(
    focused || countryOpen || !!country || (value !== undefined && value !== null && value !== '')
  );

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
      value = parsed.number;
      valid = parsed.isValid();
      if (parsed.country && parsed.country !== country) {
        country = parsed.country;
      }
    } else {
      value = '';
      valid = false;
    }
  }

  function handleCountryChange() {
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
      {#if label && !floatingLabel}
        <Form.Label>
          {label}
        </Form.Label>
      {/if}

      <div
        class="flex w-full items-start gap-2"
        onfocusin={() => (focused = true)}
        onfocusout={() => (focused = false)}
      >
        <CountrySelector
          {order}
          {countries}
          {disabled}
          bind:selected={country}
          bind:open={countryOpen}
          on:select={handleCountryChange}
          {floatingLabel}
          {isFloating}
          label={countryLabel}
          class="w-28 shrink-0"
        />

        <div class="relative flex-1">
          <InputGroup class={cn(floatingLabel && label && 'h-14 sm:h-16')}>
            <InputGroupInput
              {...controlProps}
              {...rest}
              bind:ref
              bind:value={rawInput}
              oninput={handleInput}
              {readonly}
              {disabled}
              {name}
              type="tel"
              aria-invalid={rawInput.length > 0 && !valid}
              required={rest.required}
              placeholder={floatingLabel && label && !isFloating ? '' : placeholder}
              class={cn(
                floatingLabel && label && 'h-full',
                floatingLabel && label && isFloating && 'pt-7 pb-2',
                className
              )}
            />
          </InputGroup>

          {#if floatingLabel && label}
            <Form.Label
              class={cn(
                'text-muted-foreground pointer-events-none absolute left-3 transition-all duration-150 ease-out select-none',
                isFloating
                  ? 'text-foreground top-3 text-xs leading-none'
                  : 'top-1/2 -translate-y-1/2 text-sm'
              )}
            >
              {label}
            </Form.Label>
          {/if}
        </div>
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
