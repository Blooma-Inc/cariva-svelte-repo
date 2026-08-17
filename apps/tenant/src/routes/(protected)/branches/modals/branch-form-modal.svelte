<script lang="ts" module>
	import { z } from 'zod';

	export const CreateBranchSchema = z.object({
		name: z.string({ error: 'Main branch name is needed.' }).trim().default('Main branch'),
		address: z.string({ error: 'Office address is needed.' }).trim(),
		city: z.string({ error: 'city is needed.' }).trim(),
		state: z.string({ error: 'State is needed.' }).trim(),
		country: z.string({ error: 'Country is needed.' }).trim()
	});

	export type TCreateBranchSchema = z.infer<typeof CreateBranchSchema>;
</script>

<script lang="ts">
	import CarivaHospitalForm from '$lib/assets/icons/form.png';
	import {
		Item,
		ItemContent,
		ItemDescription,
		ItemMedia,
		ItemTitle
	} from '@cariva/ui/components/ui/item/index.js';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '@cariva/ui/components/ui/card/index.js';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { InputField } from '@cariva/ui/components/form-inputs/input-field/index.js';
	import { TextareaField } from '@cariva/ui/components/form-inputs/textarea-field/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { stores } from '$lib/store/index.svelte.js';
	import SheetModal from '$lib/atoms/parent-modals/sheetModal.svelte';
	import { SheetContent, SheetHeader, SheetFooter } from '@cariva/ui/components/ui/sheet/index.js';
	import { AppModals } from '$lib/store/app/modal-types.js';
	import { Heading } from '@cariva/ui/components/ui/typography/index.js';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { TENANT } from '$lib/constants/api.js';
	import { getChangedFields } from '$lib/utils';
	import { useFetchTenant } from '$lib/hooks/tenant/use-fetch-Tenant';

	const { BranchStore, AppStore } = stores;
	let editableTenant = $state<Partial<TCreateBranchSchema>>({});
	const queryClient = useQueryClient();
	const isEditMode = $state(Boolean(AppStore.branchModal.branch_uid));

	const tenantQuery = useFetchTenant();

	const blankTenant = {
		name: 'Main branch',
		address: '',
		city: '',
		state: '',
		country: ''
	};

	const cbFn = () => {
		queryClient.invalidateQueries({
			predicate: (query) => query.queryKey[0] === TENANT.BRANCHES
		});
		AppStore.toggleModals({});
	};

	function sanitizeFormData(formData: Partial<TCreateBranchSchema>) {
		const payload = structuredClone(formData);
		return payload as TCreateBranchSchema;
	}

	const form = superForm<TCreateBranchSchema>(blankTenant, {
		SPA: true,
		dataType: 'json',
		resetForm: false,
		validators: zod4Client(CreateBranchSchema),
		onUpdated: async ({ form }) => {
			if (AppStore.branchModal.branch_uid) {
				const changedValue = getChangedFields(editableTenant, form.data);
				const branchDetails = JSON.parse(AppStore.branchModal.branch_uid) as TenantBranchItem;
				const payload = sanitizeFormData(changedValue);
				await BranchStore.editBranch(branchDetails.uid, payload);
			} else {
				const payload = sanitizeFormData(form.data);
				await BranchStore.createBranch(payload, cbFn);
			}
		}
	});

	const { form: formData, enhance, reset } = form;

	const changedFields = $derived.by(() => {
		if (!AppStore.branchModal.branch_uid) return $formData;
		return getChangedFields<TCreateBranchSchema>(editableTenant, $formData);
	});
	const hasChanges = $derived(Object.keys(changedFields).length > 0);
	const isLoading = $derived(BranchStore.loaders.isBranchLoading);

	const handleClose = () => {
		AppStore.toggleModals({ name: AppModals.BRANCH_FORM_MODAL, open: false });
	};

	$effect(() => {
		const uid = AppStore.branchModal.branch_uid;

		if (!uid) {
			reset({ data: blankTenant });
			return;
		} else {
			const branchDetails = JSON.parse(uid) as TenantBranchItem;

			const data = {
				name: branchDetails.name,
				address: branchDetails.address,
				city: branchDetails.city,
				state: branchDetails.state,
				country: branchDetails.country
			};

			editableTenant = data;
			reset({
				data
			});
		}
	});
</script>

<SheetModal isOpen={AppStore.isOpen.BRANCH_FORM_MODAL} closeModal={handleClose}>
	<SheetContent
		onEscapeKeydown={(e) => e.preventDefault()}
		onInteractOutside={(e) => e.preventDefault()}
		class="flex h-svh w-full max-w-xl! flex-col overflow-clip "
	>
		<SheetHeader class="border">
			<Heading level="h3">{isEditMode ? 'Edit' : 'Provision'} Branch</Heading>
		</SheetHeader>

		<section class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-2">
			{#if !isEditMode}
				<Item class="bg-primary/20 p-2">
					<ItemMedia class="hidden h-36 w-28 p-1 lg:block">
						<img src={CarivaHospitalForm} alt="form" class="h-full w-full object-cover" />
					</ItemMedia>
					<ItemContent class="gap-2">
						<ItemTitle
							>You're about to add a new branch to {tenantQuery.data ? tenantQuery.data.name : ''}.
							This will create:</ItemTitle
						>

						<ItemContent class="gap-1">
							<div class="flex items-center justify-start gap-2">
								<CircleCheckIcon class="size-3 text-primary" />
								<ItemDescription>A new Branch and admin</ItemDescription>
							</div>
							<div class="flex items-center justify-start gap-2">
								<CircleCheckIcon class="size-3 text-primary" />
								<ItemDescription>A new location if not listed before</ItemDescription>
							</div>
						</ItemContent>

						<ItemTitle class="text-warning">All information can be edited later.</ItemTitle>
					</ItemContent>
				</Item>
			{/if}

			<form id="tenant-form" use:enhance class="flex w-full flex-col gap-4">
				<fieldset disabled={BranchStore.loaders.isBranchLoading} class="grid grid-cols-1 gap-3">
					<Card class="self-start">
						<CardHeader>
							<CardTitle>Hospital Details</CardTitle>
							<CardDescription>Provide full details of your hospital.</CardDescription>
						</CardHeader>

						<CardContent>
							<fieldset class="flex flex-col gap-3">
								<div class="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr_1fr] lg:items-end">
									<FormField {form} name="city">
										<InputField
											label="City"
											placeholder="Select city"
											bind:value={$formData.city}
											required
										/>
									</FormField>
									<FormField {form} name="state">
										<InputField
											label="State"
											placeholder="Select state"
											bind:value={$formData.state}
											required
										/>
									</FormField>
									<FormField {form} name="country">
										<InputField
											label="Country"
											placeholder="Select country"
											bind:value={$formData.country}
											required
										/>
									</FormField>
								</div>

								<FormField {form} name="address">
									<TextareaField
										label="Physical Address (Main branch location)"
										placeholder="123 Medical Avenue, Idi-Araba"
										bind:value={$formData.address}
										required
									/>
								</FormField>
							</fieldset>
						</CardContent>
					</Card>
				</fieldset>
			</form>
		</section>

		<SheetFooter class="border-t p-2">
			<Button
				size="lg"
				type="button"
				class="md:w-fit"
				variant="secondary"
				disabled={isLoading}
				onclick={handleClose}
			>
				Cancel
			</Button>
			<Button
				size="lg"
				type="submit"
				form="tenant-form"
				class="md:w-fit"
				disabled={isLoading || (isEditMode && !hasChanges)}
				{isLoading}
			>
				{isEditMode ? 'Update ' : 'Provision '}Branch
			</Button>
		</SheetFooter>
	</SheetContent>
</SheetModal>
