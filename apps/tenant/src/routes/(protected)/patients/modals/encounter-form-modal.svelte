<script lang="ts" module>
	import { z } from 'zod';

	export const EncounterFormSchema = z.object({
		branch_uid: z.uuid('Select a branch.'),
		encounter_class: z.enum(['outpatient', 'emergency']),
		encounter_types: z.array(z.string()),
		reason_for_visit: z.string().trim()
	});

	export type TEncounterFormSchema = z.infer<typeof EncounterFormSchema>;
</script>

<script lang="ts">
	import { EmptyState } from '@cariva/ui/components/empty-state/index.js';
	import { useQueryClient } from '@tanstack/svelte-query';
	import * as Dialog from '@cariva/ui/components/ui/dialog/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { SelectField } from '@cariva/ui/components/form-inputs/select-field/index.js';
	import { CheckField } from '@cariva/ui/components/form-inputs/check-field/index.js';
	import { TextareaField } from '@cariva/ui/components/form-inputs/textarea-field/index.js';
	import { useFetchTenantBranchPages } from '$lib/hooks/tenant/use-fetch-tenant-branch-pages';
	import { useFetchEncounterTypes } from '$lib/hooks/encounters/use-fetch-encounter-types';
	import { encounters } from '$lib/hooks/encounters/fetch-key-factory';
	import { AppModals } from '$lib/store/app/modal-types';
	import DialogModal from '$lib/atoms/parent-modals/dialogModal.svelte';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import { stores } from '$lib/store/index.svelte';
	import { parseError } from '$lib/utils/errorHandler';

	const { AppStore, EncounterStore, PermissionStore } = stores;
	const context = $state.snapshot(AppStore.encounterModal);
	const assignment = stores.AuthStore.user.branch_assignments?.find((item) => !item.revoked_at);
	const initialBranchUid = context.branch_uid || assignment?.branch.uid || '';
	const branchName = context.branch_name || assignment?.branch.name || '';
	const branchesQuery = useFetchTenantBranchPages(
		() => !initialBranchUid && PermissionStore.can(PERMISSIONS.BRANCHES_READ)
	);
	const branchOptions = $derived(
		branchesQuery.data?.pages.flatMap((result) =>
			result.data.map((branch) => ({
				value: branch.uid,
				label: branch.name,
				enable: branch.is_active
			}))
		) ?? []
	);
	const saving = $derived(EncounterStore.loaders.isEncounterLoading);
	const canWrite = $derived(PermissionStore.can(PERMISSIONS.ENCOUNTERS_CREATE));
	const client = useQueryClient();
	const types = useFetchEncounterTypes(() => AppStore.isOpen.ENCOUNTER_FORM_MODAL);
	const careSettings = [
		{ value: 'outpatient', label: 'Outpatient', enable: true },
		{ value: 'emergency', label: 'Emergency', enable: true }
	];
	EncounterStore.errors.isEncounterLoading = '';

	function handleClose() {
		if (saving) return;
		AppStore.toggleModals({ name: AppModals.ENCOUNTER_FORM_MODAL, open: false });
	}

	const form = superForm<TEncounterFormSchema>(
		{
			branch_uid: initialBranchUid,
			encounter_class: 'outpatient',
			encounter_types: [],
			reason_for_visit: ''
		},
		{
			SPA: true,
			dataType: 'json',
			resetForm: false,
			validators: zod4Client(EncounterFormSchema),
			onUpdated: async ({ form: updated }) => {
				if (!updated.valid || !canWrite) return;
				const tenantUid = stores.AuthStore.user.tenant_uid;
				const branch = updated.data.branch_uid;
				const patient = context.patient_uid;
				await EncounterStore.createEncounter(
					branch,
					{
						patient_uid: patient,
						encounter_class: updated.data.encounter_class,
						encounter_types: PermissionStore.can(PERMISSIONS.ENCOUNTERS_READ)
							? [...updated.data.encounter_types]
							: [],
						reason_for_visit: updated.data.reason_for_visit.trim() || null
					},
					() => {
						void client.invalidateQueries({
							queryKey: encounters.getPatientEncounters(tenantUid, branch, patient).keys()
						});
						AppStore.toggleModals({ name: AppModals.ENCOUNTER_FORM_MODAL, open: false });
					}
				);
			}
		}
	);
	const { form: formData, enhance } = form;
</script>

<DialogModal isOpen={AppStore.isOpen.ENCOUNTER_FORM_MODAL} closeModal={handleClose}>
	<Dialog.Content
		class="max-h-[calc(100dvh-2rem)] overflow-y-auto"
		showCloseButton={!saving}
		onInteractOutside={(event) => {
			if (saving) event.preventDefault();
		}}
		onEscapeKeydown={(event) => {
			if (saving) event.preventDefault();
		}}
	>
		<Dialog.Header
			><Dialog.Title>Create encounter</Dialog.Title><Dialog.Description
				>{branchName
					? `Start a visit at ${branchName}.`
					: 'Choose a branch to start a visit.'}</Dialog.Description
			></Dialog.Header
		>
		<form use:enhance class="flex flex-col gap-5">
			<fieldset disabled={saving || !canWrite} class="flex flex-col gap-5">
				{#if !initialBranchUid}
					{#if PermissionStore.can(PERMISSIONS.BRANCHES_READ)}
						<FormField {form} name="branch_uid">
							<SelectField
								label="Branch"
								placeholder="Select branch"
								type="single"
								selectables={branchOptions}
								bind:value={$formData.branch_uid}
								disabled={branchesQuery.status !== 'success'}
								required
							/>
						</FormField>
						{#if branchesQuery.status === 'pending'}
							<Paragraph size="sm" muted>Loading branches…</Paragraph>
						{:else if branchesQuery.status === 'error'}
							<EmptyState
								compact
								kind="error"
								title="Couldn’t load branches"
								description={parseError(branchesQuery.error)}
								onAction={() => {
									void branchesQuery.refetch();
								}}
							/>
						{:else if !branchOptions.length}
							<EmptyState
								compact
								title="No branches available"
								description="No branches are available for encounter creation with your current access."
							/>
						{/if}
						{#if branchesQuery.hasNextPage}
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={branchesQuery.isFetching}
								onclick={() => branchesQuery.fetchNextPage()}>Load more branches</Button
							>
						{/if}
					{:else}
						<Paragraph size="sm"
							>Ask your administrator to assign you to a branch to create encounters.</Paragraph
						>
					{/if}
				{/if}
				<FormField {form} name="encounter_class">
					<SelectField
						label="Care setting"
						placeholder="Select care setting"
						type="single"
						selectables={careSettings}
						bind:value={$formData.encounter_class}
						required
					/>
				</FormField>
				{#if stores.PermissionStore.can(PERMISSIONS.ENCOUNTERS_READ)}
					<fieldset disabled={saving} class="space-y-2">
						<legend class="mb-2 text-sm font-medium"
							>Encounter types <span class="font-normal text-muted-foreground">(optional)</span
							></legend
						>
						{#if types.status === 'pending'}<Paragraph size="sm" muted
								>Loading encounter types…</Paragraph
							>
						{:else if types.status === 'error'}<EmptyState
								compact
								kind="error"
								title="Couldn’t load encounter types"
								description={parseError(types.error)}
								onAction={() => {
									void types.refetch();
								}}
							/>
						{:else}
							<div class="grid max-h-48 gap-2 overflow-y-auto sm:grid-cols-2">
								{#each types.data ?? [] as item (item.value)}
									<FormField {form} name="encounter_types">
										<CheckField
											label={item.label}
											aria-label={item.label}
											bind:checked={
												() => $formData.encounter_types.includes(item.value),
												(checked: boolean) => {
													$formData.encounter_types = checked
														? [...$formData.encounter_types, item.value]
														: $formData.encounter_types.filter((value) => value !== item.value);
												}
											}
										/>
									</FormField>
								{/each}
							</div>
						{/if}
					</fieldset>
				{/if}
				<FormField {form} name="reason_for_visit">
					<TextareaField
						label="Reason for visit (optional)"
						bind:value={$formData.reason_for_visit}
						rows={3}
					/>
				</FormField>
			</fieldset>
			{#if EncounterStore.errors.isEncounterLoading}
				<p role="alert" class="text-sm text-destructive">
					{EncounterStore.errors.isEncounterLoading}
				</p>
			{/if}
			<Dialog.Footer
				><Button type="button" variant="outline" disabled={saving} onclick={handleClose}
					>Cancel</Button
				><Button
					type="submit"
					disabled={saving || !canWrite || !$formData.branch_uid}
					isLoading={saving}>Start encounter</Button
				></Dialog.Footer
			>
		</form>
	</Dialog.Content>
</DialogModal>
