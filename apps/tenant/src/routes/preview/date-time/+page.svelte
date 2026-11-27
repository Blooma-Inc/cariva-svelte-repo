<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import ScheduleTemporalField from '$lib/components/scheduling/schedule-temporal-field.svelte';
	const nestedForm = superForm({ date: '' }, { SPA: true, validators: false });
	const { form: nestedData } = nestedForm;
	import { CalendarDate, CalendarDateTime, Time } from '@internationalized/date';
	import {
		DateField,
		DateRangeField,
		TimeField,
		DateTimeField,
		DateRangeTimeField
	} from '@cariva/ui/components/date-fields/index.js';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '@cariva/ui/components/ui/card/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import * as Dialog from '@cariva/ui/components/ui/dialog/index.js';
	let submitted = $state('');
	let cancelReset = $state(false);
</script>

<svelte:head><title>Date and time fields · Cariva</title></svelte:head>
<main class="min-h-screen bg-background px-5 py-10 text-foreground sm:px-10">
	<div class="mx-auto flex max-w-6xl flex-col gap-7">
		<div class="flex flex-col gap-3">
			<Badge variant="secondary" class="w-fit">Component preview</Badge>
			<h1 class="text-3xl font-semibold tracking-tight">Dates & times</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Five fields with keyboard-editable segments, calendar selection, and shared Cariva styling.
				All values use local dates and times.
			</p>
		</div>
		<form
			class="grid items-start gap-5 md:grid-cols-2"
			onreset={(event) => {
				if (cancelReset) event.preventDefault();
			}}
			onsubmit={(event) => {
				event.preventDefault();
				submitted = JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)), null, 2);
			}}
		>
			<Card>
				<CardHeader
					><CardTitle>DateField</CardTitle><CardDescription
						>A single date. Jump between months and years from the calendar.</CardDescription
					></CardHeader
				>
				<CardContent class="flex flex-col gap-5">
					<DateField
						label="Visit date"
						name="visitDate"
						description="Day / month / year. Select a segment to type or use arrow keys."
					/>
					<DateField
						label="Date of birth"
						name="birthDate"
						defaultValue={new CalendarDate(1999, 6, 15)}
						floatingLabel={false}
						maxValue={new CalendarDate(2026, 11, 27)}
					/>
				</CardContent>
			</Card>
			<Card>
				<CardHeader
					><CardTitle>TimeField</CardTitle><CardDescription
						>24-hour or explicit AM/PM, with optional seconds.</CardDescription
					></CardHeader
				>
				<CardContent class="flex flex-col gap-5">
					<TimeField
						label="Start time"
						name="startTime"
						hourCycle={12}
						defaultValue={new Time(9, 30)}
						description="12-hour clock with an editable AM/PM segment."
					/>
					<TimeField
						label="Precise time"
						name="preciseTime"
						granularity="second"
						defaultValue={new Time(17, 15, 30)}
					/>
					<TimeField
						label="Office hours"
						name="officeTime"
						minValue={new Time(9)}
						maxValue={new Time(17)}
						description="Available from 09:00 to 17:00."
					/>
				</CardContent>
			</Card>
			<Card>
				<CardHeader
					><CardTitle>DateRangeField</CardTitle><CardDescription
						>Two dates, one field. A partial selection stays visible.</CardDescription
					></CardHeader
				>
				<CardContent
					><DateRangeField
						label="Leave dates"
						startName="leaveStart"
						endName="leaveEnd"
						numberOfMonths={2}
						defaultValue={{
							start: new CalendarDate(2026, 11, 27),
							end: new CalendarDate(2026, 12, 2)
						}}
					/></CardContent
				>
			</Card>
			<Card>
				<CardHeader
					><CardTitle>DateTimeField</CardTitle><CardDescription
						>Date and time stay independent until both are complete.</CardDescription
					></CardHeader
				>
				<CardContent
					><DateTimeField
						label="Appointment"
						name="appointment"
						hourCycle={12}
						defaultValue={new CalendarDateTime(2026, 11, 30, 14, 30)}
						description="Changing the date preserves the entered time."
					/></CardContent
				>
			</Card>
			<Card class="md:col-span-2">
				<CardHeader
					><CardTitle>DateRangeTimeField</CardTitle><CardDescription
						>A date range with a separate time for each endpoint.</CardDescription
					></CardHeader
				>
				<CardContent
					><DateRangeTimeField
						label="Unavailable period"
						startName="unavailableStart"
						endName="unavailableEnd"
						hourCycle={12}
						defaultValue={{
							start: new CalendarDateTime(2026, 11, 30, 9),
							end: new CalendarDateTime(2026, 12, 1, 17)
						}}
						description="For an overnight period, choose a later end date."
					/></CardContent
				>
			</Card>
			<Card>
				<CardHeader
					><CardTitle>Field states</CardTitle><CardDescription
						>Disabled, read-only, required, and error treatments.</CardDescription
					></CardHeader
				>
				<CardContent class="flex flex-col gap-5">
					<DateField label="Disabled date" disabled defaultValue={new CalendarDate(2026, 11, 27)} />
					<TimeField
						label="Read-only time"
						name="readonlyTime"
						readonly
						hourCycle={12}
						defaultValue={new Time(15)}
					/>
					<DateField
						label="Required date"
						name="requiredDate"
						required
						description="Try submitting with this empty to check focus and validation."
					/>
					<TimeField
						label="Example error"
						error="Choose a time within the practitioner’s working hours."
						internal
					/>
					<TimeField label="Loading options" isLoading internal />
				</CardContent>
			</Card>
			<Card>
				<CardHeader
					><CardTitle>Form behavior</CardTitle><CardDescription
						>Inspect serialized values and try native reset.</CardDescription
					></CardHeader
				>
				<CardContent class="flex flex-col gap-4">
					<div class="flex flex-wrap gap-2">
						<Button type="submit">Submit example</Button><Button type="reset" variant="outline"
							>Reset to defaults</Button
						>
					</div>
					<Button
						variant="ghost"
						aria-pressed={cancelReset}
						onclick={() => (cancelReset = !cancelReset)}
						>Cancel reset: {cancelReset ? 'On' : 'Off'}</Button
					>
					<pre class="overflow-auto rounded-xl bg-muted p-3 text-xs"><code
							>{submitted || 'Submitted values will appear here.'}</code
						></pre>
					<Dialog.Root
						><Dialog.Trigger>Try inside a dialog</Dialog.Trigger><Dialog.Content
							><Dialog.Header><Dialog.Title>Choose a visit date</Dialog.Title></Dialog.Header
							><FormField form={nestedForm} name="date"
								><ScheduleTemporalField
									label="Nested datetime"
									type="datetime-local"
									enhanced
									bind:value={$nestedData.date}
								/></FormField
							></Dialog.Content
						></Dialog.Root
					>
				</CardContent>
			</Card>
		</form>
	</div>
</main>
