<script lang="ts" module>
	import { z } from 'zod';
	import { SvelteDate } from 'svelte/reactivity';
	import { type Selectables } from '@cariva/ui/components/form-inputs/select-field/index.js';

	export const profileGender: Selectables = [
		{ label: 'Male', value: 'male', enable: true },
		{ label: 'Female', value: 'female', enable: true }
	];

	export const userProfileSchema = z
		.object({
			first_name: z.string({ error: 'First Name is required.' }).trim(),
			middle_name: z.string().trim().optional(),
			last_name: z.string({ error: 'First Name is required.' }).trim(),
			prefered_name: z.string().trim().optional(),
			gender: z.string({ error: 'Email is required.' }).trim(),
			phone: z.string({ error: 'Phone number is required.' }).trim(),
			alternative_phone: z.string({ error: 'Phone number is required.' }).trim(),
			dob: z
				.date()
				.optional()
				.transform((args) => {
					if (args) return new SvelteDate(args);
				})
		})
		.superRefine((data, ctx) => {
			const { phone, alternative_phone } = data;

			if (alternative_phone) {
				if (alternative_phone === phone) {
					ctx.addIssue({
						code: 'custom',
						path: ['alternative_phone'],
						message: 'Optional phone must be different from phone number.'
					});
				}
			}
		});

	export type UserProfileType = z.infer<typeof userProfileSchema>;
</script>

<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '@cariva/ui/components/ui/avatar/index.js';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/input-field/index.js';
	import { SelectField } from '@cariva/ui/components/form-inputs/select-field/index.js';
	import { DateField } from '@cariva/ui/components/form-inputs/date-field/index.js';
	import { TelField } from '@cariva/ui/components/form-inputs/tel-field/index.js';
	import { stores } from '$lib/store/index.svelte.js';
	import SheetModal from '$lib/atoms/modals/sheetModal.svelte';
	import { SheetContent, SheetHeader, SheetFooter } from '@cariva/ui/components/ui/sheet/index.js';
	import { AppModals } from '$lib/store/app/modal-types.js';
	import { Heading, Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { useFetchUserProfile } from '$lib/hooks/user/use-fetch-profile';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { AUTH } from '$lib/constants/api';
	import { getChangedFields } from '$lib/utils';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { svelteDateToYearMonthDay } from '$lib/utils/date';
	import { getInitials } from '$lib/utils/strings';

	const { AppStore, AuthStore } = stores;
	const queryClient = useQueryClient();
	const userProfileQuery = useFetchUserProfile();

	const profile = $derived.by(() => {
		if (!userProfileQuery.isLoading && userProfileQuery.data != undefined) {
			return {
				first_name: userProfileQuery.data.first_name,
				middle_name: userProfileQuery.data.middle_name ?? '',
				last_name: userProfileQuery.data.last_name,
				prefered_name: userProfileQuery.data.prefered_name ?? '',
				gender: userProfileQuery.data.gender ?? '',
				phone: userProfileQuery.data.phone ?? '',
				alternative_phone: userProfileQuery.data.alternative_phone ?? '',
				dob: userProfileQuery.data?.dob ? new SvelteDate(userProfileQuery.data.dob) : undefined
			};
		}
		return {
			first_name: '',
			middle_name: '',
			last_name: '',
			prefered_name: '',
			gender: '',
			phone: '',
			alternative_phone: '',
			dob: undefined
		};
	});

	function sanitizeFormData(formData: Partial<UserProfileType>) {
		const payload = structuredClone(formData);
		if (payload?.dob) {
			payload.dob = svelteDateToYearMonthDay(payload.dob) as unknown as SvelteDate;
		}

		return payload as UserProfileType;
	}

	const getProfile = () => profile;

	const form = superForm<UserProfileType>(getProfile(), {
		SPA: true,
		dataType: 'json',
		resetForm: false,
		validators: zod4Client(userProfileSchema),
		onUpdated: async ({ form }) => {
			if (form.valid) {
				const changedValue = getChangedFields<UserProfileType>(profile, form.data);
				const payload = sanitizeFormData(changedValue);
				await AuthStore.updateUser(payload, cbFn);
			}
		}
	});

	const { form: formData, enhance } = form;

	const cbFn = () => {
		queryClient.invalidateQueries({
			predicate: (query) => query.queryKey[0] === AUTH.CURRENT_USER
		});
		AppStore.toggleModals({});
	};

	const changedFields = $derived.by(() => {
		return getChangedFields<UserProfileType>(profile, $formData);
	});
	const hasChanges = $derived(Object.keys(changedFields).length > 0);
	const isLoading = $derived(userProfileQuery.isLoading || AuthStore.loaders.isUpdatingProfile);

	const handleClose = () => {
		AppStore.toggleModals({ name: AppModals.PROFILE_FORM_MODAL, open: false });
	};
</script>

<SheetModal isOpen={AppStore.isOpen.PROFILE_FORM_MODAL} closeModal={handleClose}>
	<SheetContent
		onEscapeKeydown={(e) => e.preventDefault()}
		onInteractOutside={(e) => e.preventDefault()}
		class="flex h-svh w-full max-w-xl! flex-col overflow-clip"
	>
		<SheetHeader class="border">
			<Heading level="h3">Edit Profile</Heading>
		</SheetHeader>

		<section class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-2">
			{#if userProfileQuery.status === 'success' && userProfileQuery.data}
				<div class="flex items-center gap-3">
					<Avatar class="size-28" loadingStatus="loading">
						<AvatarImage src={userProfileQuery.data.profile_photo_url} alt="@shadcn" />
						<AvatarFallback class="text-4xl"
							>{getInitials(
								`${userProfileQuery.data.first_name} ${userProfileQuery.data.last_name}`
							)}</AvatarFallback
						>
					</Avatar>

					<div class="flex flex-col gap-1">
						<div class="flex divide-y-2">
							<Button size="xs" variant="secondary">Upload</Button>
							<Button
								size="xs"
								variant="destructive"
								disabled={!!userProfileQuery.data?.profile_photo_url}>Remove</Button
							>
						</div>
						<Paragraph size="sm" muted>Recommended: 400x400px, JPG or PNG, max 5MB</Paragraph>
					</div>
				</div>
			{/if}

			<form id="profile-form" use:enhance class="flex w-full flex-col gap-4">
				<fieldset disabled={isLoading} class="flex flex-col gap-3">
					<div class="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr] lg:items-end">
						<FormField {form} name="first_name">
							<InputField
								label="First Name"
								placeholder="First Name"
								bind:value={$formData.first_name}
								required
							/>
						</FormField>
						<FormField {form} name="last_name">
							<InputField
								label="Last Name"
								placeholder=""
								bind:value={$formData.last_name}
								required
							/>
						</FormField>
					</div>

					<div class="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr] lg:items-end">
						<FormField {form} name="middle_name">
							<InputField
								label="Middle Name (optional)"
								placeholder="Middle Name"
								bind:value={$formData.middle_name}
							/>
						</FormField>
						<FormField {form} name="prefered_name">
							<InputField
								label="Prefered Name (optional)"
								placeholder="First Name"
								bind:value={$formData.prefered_name}
							/>
						</FormField>
					</div>

					<div class="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr] lg:items-end">
						<FormField {form} name="gender">
							<SelectField
								label="Gender"
								type="single"
								placeholder="Select gender"
								selectables={profileGender}
								bind:value={$formData.gender}
								required
							/>
						</FormField>

						<FormField {form} name="dob">
							<DateField
								label="Date of Birth (optional)"
								placeholder="January 01 2001"
								bind:value={$formData.dob}
								max={new SvelteDate()}
							/>
						</FormField>
					</div>

					<div class="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr] lg:items-start">
						<FormField {form} name="phone">
							<TelField
								label="Phone number"
								defaultCountry="NG"
								placeholder="08123456789"
								bind:value={$formData.phone}
								required
							/>
						</FormField>
						<FormField {form} name="alternative_phone">
							<TelField
								label="Alternative Phone (optional)"
								defaultCountry="NG"
								placeholder="08123456789"
								bind:value={$formData.alternative_phone}
							/>
						</FormField>
					</div>
				</fieldset>
			</form>
		</section>

		<SheetFooter class="border-t p-2">
			<Button
				size="lg"
				type="button"
				class="md:w-fit"
				variant="secondary"
				onclick={handleClose}
				disabled={isLoading}
			>
				Cancel
			</Button>
			<Button
				size="lg"
				type="submit"
				form="profile-form"
				class="md:w-fit"
				disabled={isLoading || !hasChanges}
				{isLoading}>Update Profile</Button
			>
		</SheetFooter>
	</SheetContent>
</SheetModal>
