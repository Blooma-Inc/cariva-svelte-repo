<script lang="ts" module>
  import type { FieldInputs } from '$lib/types';
  import type { InputProps } from '$lib/components/ui/input';

  export type AmountFieldProps = FieldInputs<InputProps> & {
    currencySymbol?: string;
    locale?: string;
    maxDecimals?: number;
    allowNegative?: boolean;
    floatingLabel?: boolean;
  };
</script>

<script lang="ts">
  import * as Form from '$lib/components/ui/form';
  import { InputGroup, InputGroupAddon, InputGroupInput } from '$lib/components/ui/input-group';
  import { cn } from '$lib/utils';

  let {
    ref = $bindable(null),
    value = $bindable<number | undefined>(),
    label,
    description,
    currencySymbol = '₦',
    locale = 'en-NG',
    maxDecimals = 2,
    allowNegative = false,
    floatingLabel = true,
    ...props
  }: AmountFieldProps = $props();

  let focused = $state(false);
  let displayValue = $state('');
  let isFloating = $derived(focused || (value !== undefined && value !== null && value !== ''));

  const formatter = $derived(
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDecimals
    })
  );

  function formatForDisplay(num: number | undefined): string {
    if (num === undefined || num === null || Number.isNaN(num)) return '';
    return formatter.format(num);
  }

  $effect(() => {
    if (!focused) {
      displayValue = formatForDisplay(value);
    }
  });

  function sanitize(raw: string): string {
    const allowed = allowNegative ? /[^0-9.-]/g : /[^0-9.]/g;
    let cleaned = raw.replace(allowed, '');

    if (allowNegative) {
      const negative = cleaned.startsWith('-');
      cleaned = cleaned.replace(/-/g, '');
      if (negative) cleaned = `-${cleaned}`;
    }

    const dot = cleaned.indexOf('.');
    if (dot !== -1) {
      cleaned = cleaned.slice(0, dot + 1) + cleaned.slice(dot + 1).replace(/\./g, '');
    }

    if (dot !== -1 && maxDecimals >= 0) {
      const [intPart, decPart] = cleaned.split('.');
      cleaned = decPart !== undefined ? `${intPart}.${decPart.slice(0, maxDecimals)}` : intPart;
    }

    return cleaned;
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const cleaned = sanitize(target.value);
    displayValue = cleaned;
    target.value = cleaned;
    value = cleaned === '' || cleaned === '.' || cleaned === '-' ? undefined : Number(cleaned);
  }

  function handleFocus() {
    focused = true;
    displayValue = value !== undefined && !Number.isNaN(value) ? String(value) : '';
  }

  function handleBlur() {
    focused = false;
    displayValue = formatForDisplay(value);
  }
</script>

<div class="relative flex w-full flex-col gap-1">
  <Form.Control>
    {#snippet children({ props: controlProps })}
      <div class="relative flex w-full flex-col">
        {#if label && !floatingLabel}
          <Form.Label>
            {label}
          </Form.Label>
        {/if}

        <div
          class="relative"
          onfocusin={() => (focused = true)}
          onfocusout={() => (focused = false)}
        >
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <span class="text-muted-foreground text-sm">{currencySymbol}</span>
            </InputGroupAddon>
            <div class="relative min-w-0 flex-1">
              <InputGroupInput
                bind:ref
                {...controlProps}
                {...props}
                placeholder={floatingLabel ? '' : props.placeholder}
                class={cn(floatingLabel && 'placeholder:text-transparent', props.class)}
                type="text"
                inputmode="decimal"
                autocomplete="off"
                value={displayValue}
                oninput={handleInput}
                onfocus={handleFocus}
                onblur={handleBlur}
              />

              {#if floatingLabel && label}
                <Form.Label
                  class={cn(
                    'text-muted-foreground pointer-events-none absolute left-3 transition-all duration-150 ease-out select-none',
                    isFloating
                      ? 'bg-background text-foreground top-0 -translate-y-1/2 px-1 text-xs'
                      : 'top-1/2 -translate-y-1/2 text-sm'
                  )}
                >
                  {label}
                </Form.Label>
              {/if}
            </div>
          </InputGroup>
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
