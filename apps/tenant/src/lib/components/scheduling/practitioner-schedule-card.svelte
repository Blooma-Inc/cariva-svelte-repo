<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '@cariva/ui/components/ui/card/index.js';
	import { FormField } from '@cariva/ui/components/ui/form/index.js';
	import { SelectField } from '@cariva/ui/components/form-inputs/select-field/index.js';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { Badge } from '@cariva/ui/components/ui/badge/index.js';
	import { Skeleton } from '@cariva/ui/components/ui/skeleton/index.js';
	import { FilterChip } from '@cariva/ui/components/filter-chip/index.js';
	import { stores } from '$lib/store/index.svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { PERMISSIONS } from '$lib/configs/permissions';
	import {
		canReadPractitionerSchedule,
		canActivatePractitionerSchedule,
		canWritePractitionerSchedule
	} from '$lib/utils/practitioner-availability-access';
	import { useFetchPractitionerAvailability } from '$lib/hooks/practitioner-availability/use-fetch-practitioner-availability';
	import { parseError } from '$lib/utils/errorHandler';

	let { practitioner, personal = false }: { practitioner: UserProfileItem; personal?: boolean } =
		$props();
	const { AppStore, PermissionStore, PractitionerAvailabilityStore: serviceStore } = stores;
	const canRead = $derived(PermissionStore.can(PERMISSIONS.PRACTITIONER_AVAILABILITY_READ));
	const branches = $derived(
		practitioner.branch_assignments.filter(
			(assignment, index, all) =>
				all.findIndex((item) => item.branch_uid === assignment.branch_uid) === index &&
				canReadPractitionerSchedule(stores, assignment.branch_uid, practitioner.uid)
		)
	);
	const filters = superForm({ branch_uid: '' }, { SPA: true });
	const { form: filterData } = filters;
	const selectedBranch = $derived(
		branches.find((assignment) => assignment.branch_uid === $filterData.branch_uid)
	);
	const assignment = $derived(
		practitioner.branch_assignments.find(
			(item) => item.branch_uid === selectedBranch?.branch_uid && !item.revoked_at
		) ?? selectedBranch
	);
	let status = $state('all');
	const params = $state<PractitionerAvailabilityQueryParams>({
		practitioner_uid: '',
		limit: 100,
		offset: 0
	});
	$effect(() => {
		if (
			!branches.some((item) => item.branch_uid === $filterData.branch_uid) &&
			$filterData.branch_uid !== (branches[0]?.branch_uid ?? '')
		)
			$filterData.branch_uid = branches[0]?.branch_uid ?? '';
	});
	$effect(() => {
		params.practitioner_uid = practitioner.uid;
		params.is_active = status === 'all' ? undefined : status === 'active';
	});
	const query = useFetchPractitionerAvailability(
		() => selectedBranch?.branch_uid ?? '',
		params,
		true
	);
	const canCreate = $derived(
		assignment &&
			!assignment.revoked_at &&
			practitioner.is_active &&
			canWritePractitionerSchedule(stores, assignment.branch_uid, practitioner.uid, true)
	);
	function open(
		mode: 'view' | 'form',
		record: PractitionerAvailabilityItem | undefined = undefined
	) {
		if (
			!assignment ||
			serviceStore.loading ||
			!canReadPractitionerSchedule(stores, assignment.branch_uid, practitioner.uid)
		)
			return;
		if (
			record &&
			(record.practitioner_uid !== practitioner.uid || record.branch_uid !== assignment.branch_uid)
		)
			return;
		if (
			mode === 'form' &&
			(record
				? !canWritePractitionerSchedule(stores, assignment.branch_uid, practitioner.uid, false) ||
					!record.assignment_is_active ||
					record.assignment_uid !== assignment.uid
				: !canCreate)
		)
			return;
		AppStore.toggleModals({
			name: AppModals.PRACTITIONER_SCHEDULE_MODAL,
			open: true,
			mode,
			record_uid: record?.uid,
			context: {
				branch_uid: assignment.branch_uid,
				branch_name: assignment.branch.name,
				timezone: assignment.branch.timezone ?? '',
				branch_is_active: assignment.branch.is_active,
				practitioner_uid: practitioner.uid,
				practitioner_name: `${practitioner.first_name} ${practitioner.last_name}`,
				practitioner_is_active: practitioner.is_active,
				assignment_uid: assignment.uid,
				assignment_is_active: !assignment.revoked_at
			}
		});
	}
</script>

{#if canRead}
	<Card>
		<CardHeader>
			<CardTitle>{personal ? 'My Schedule' : 'Practitioner Schedule'}</CardTitle>
			<CardDescription
				>Working hours and unavailable periods for each branch assignment.</CardDescription
			>
		</CardHeader>
		<CardContent class="flex min-w-0 flex-col gap-4">
			{#if !branches.length}
				<p class="text-sm text-muted-foreground">
					{practitioner.branch_assignments.length
						? 'No branch schedules are available with your current branch access.'
						: 'No branch assignments. A schedule can be created after assignment to a branch.'}
				</p>
			{:else}
				<FormField form={filters} name="branch_uid"
					><SelectField
						type="single"
						label="Branch"
						placeholder="Select a branch"
						bind:value={$filterData.branch_uid}
						selectables={branches.map((item) => ({
							value: item.branch_uid,
							label: item.branch.name,
							enable: true
						}))}
					/></FormField
				>
				<div class="flex flex-wrap items-center justify-between gap-2">
					<FilterChip
						label="Status"
						value={status === 'all' ? null : status}
						onValueChange={(value) => (status = typeof value === 'string' ? value : 'all')}
						options={[
							{ value: 'active', label: 'Active' },
							{ value: 'inactive', label: 'Inactive' }
						]}
					/>
					{#if canCreate}<Button
							size="sm"
							disabled={serviceStore.loading}
							onclick={() => open('form')}
							>{query.data?.meta.total ? 'Add schedule' : 'Set up schedule'}</Button
						>{/if}
				</div>
				{#if assignment?.revoked_at}<p class="text-sm text-muted-foreground">
						This branch assignment has ended. Previous schedules remain available to view.
					</p>{/if}
				{#if query.isPending}
					<div
						aria-busy="true"
						aria-label="Loading practitioner schedules"
						class="flex flex-col gap-3"
					>
						{#each [1, 2, 3] as row (row)}<div class="flex flex-col gap-2 rounded-lg border p-3">
								<div class="flex items-center justify-between gap-2">
									<Skeleton class="h-5 w-40" /><Skeleton class="h-6 w-16 rounded-full" />
								</div>
								<Skeleton class="h-4 w-48" /><Skeleton class="h-4 w-36" />
								<div class="flex justify-end gap-2">
									<Skeleton class="h-8 w-16" /><Skeleton class="h-8 w-16" />
								</div>
							</div>{/each}
					</div>
				{:else if query.isError}
					<p role="alert">{parseError(query.error)}</p>
					<Button variant="outline" onclick={() => query.refetch()}>Retry schedules</Button>
				{:else if query.data}
					{#if !query.data.data.length}<p class="text-sm text-muted-foreground">
							{status === 'all'
								? 'No schedules configured for this practitioner at this branch.'
								: 'No schedules match this status.'}
						</p>{/if}
					{#each query.data.data as record (record.uid)}
						<div class="flex flex-col gap-2 rounded-lg border p-3">
							<div class="flex flex-wrap items-center justify-between gap-2">
								<Button
									variant="link"
									class="h-auto p-0 text-start"
									onclick={() => open('view', record)}
									>{record.service_name ?? 'General working hours'}</Button
								><Badge variant={record.is_active ? 'default' : 'secondary'}
									>{record.is_active ? 'Active' : 'Inactive'}</Badge
								>
							</div>
							{#if !record.assignment_is_active}<p class="text-xs text-muted-foreground">
									Previous branch assignment
								</p>{/if}
							{#if !canActivatePractitionerSchedule(record)}<p
									class="text-xs text-muted-foreground"
								>
									The practitioner, assignment, branch, or service is inactive.
								</p>{/if}
							{#if record.availability === null}<p class="text-sm text-muted-foreground">
									Working hours are unconfigured.
								</p>
							{:else if !record.availability.available_time.length}<p
									class="text-sm text-muted-foreground"
								>
									No available weekly windows.
								</p>
							{:else}
								{#each record.availability.available_time.slice(0, 2) as window, index (index)}<p
										class="text-sm"
									>
										{window.days_of_week
											.map((day) => day[0].toUpperCase() + day.slice(1))
											.join(', ')} · {window.all_day
											? 'All day'
											: `${window.available_start_time} – ${window.available_end_time}`}
									</p>{/each}
								{#if record.availability.available_time.length > 2}<p
										class="text-xs text-muted-foreground"
									>
										+{record.availability.available_time.length - 2} more window(s)
									</p>{/if}
							{/if}
							<p class="text-xs text-muted-foreground">
								{record.timezone || 'Timezone not configured'} · {record.availability
									?.not_available_time.length ?? 0} unavailable period(s)
							</p>
							<div class="flex justify-end gap-2">
								<Button
									variant="ghost"
									size="sm"
									disabled={serviceStore.loading}
									onclick={() => open('view', record)}>View details</Button
								>{#if record.assignment_is_active && record.assignment_uid === assignment?.uid && canWritePractitionerSchedule(stores, record.branch_uid, practitioner.uid, false)}<Button
										variant="outline"
										size="sm"
										disabled={serviceStore.loading}
										onclick={() => open('form', record)}>Edit schedule</Button
									>{/if}
							</div>
						</div>
					{/each}
				{/if}
			{/if}
		</CardContent>
	</Card>
{/if}
