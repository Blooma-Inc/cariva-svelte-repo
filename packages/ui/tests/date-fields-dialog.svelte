<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { parseDateTime } from '@internationalized/date';
  import { DateTimeField } from '../src/lib/components/date-fields/index.js';
  import { FormField, FormControl } from '../src/lib/components/ui/form/index.js';
  import * as Dialog from '../src/lib/components/ui/dialog/index.js';
  const form = superForm({ date: '' }, { SPA: true, validators: false });
  const { form: data } = form;
</script>

<Dialog.Root open>
  <Dialog.Content>
    <Dialog.Header
      ><Dialog.Title>Schedule editor</Dialog.Title><Dialog.Description
        >Choose a local date and time.</Dialog.Description
      ></Dialog.Header
    >
    <FormField {form} name="date">
      <FormControl>
        {#snippet children({ props })}
          <DateTimeField
            {...props}
            label="Exception starts"
            placeholder={undefined}
            value={$data.date ? parseDateTime($data.date) : undefined}
            onValueChange={(next) => ($data.date = next?.toString() ?? '')}
          />
        {/snippet}
      </FormControl>
    </FormField>
  </Dialog.Content>
</Dialog.Root>
