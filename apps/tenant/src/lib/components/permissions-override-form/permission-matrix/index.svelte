<script lang="ts" module>
	import { z } from 'zod';

	export const PermissionSchema = z.object({
		permission_uid: z.string(),
		code: z.string(),
		module: z.string(),
		isDefaultPerm: z.boolean(),
		action: z.enum(['grant', 'revoke']).nullable().default(null)
	});

	export const OverridesSchema = z.object({
		overrides: z.array(PermissionSchema)
	});

	export type TPermissionSchema = z.infer<typeof PermissionSchema>;
	export type TOverridesSchema = z.infer<typeof OverridesSchema>;

	interface RolePermissionMatrixProp {
		userUid: string;
		defaultPermissions: PermissionItem[];
		overrides: UserPermissionOverrideItem[];
	}
</script>

<script lang="ts">
	import { createColumns } from './column';
	import { DataTable } from '@cariva/ui/components/data-table/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { useFetchRolePermissionMatrix } from '$lib/hooks/roles/use-fetch-role-permission-matrix';
	import { Paragraph } from '@cariva/ui/components/ui/typography/index.js';
	import { stores } from '$lib/store/index.svelte';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { ROLES } from '$lib/constants/api';
	import { Button } from '@cariva/ui/components/ui/button/index.js';
	import { toTitleCase } from '$lib/utils/strings';
	import { capitalize } from 'lodash';
	import _ from 'lodash';

	let { userUid, defaultPermissions, overrides }: RolePermissionMatrixProp = $props();
	const { PermissionStore } = stores;

	const queryClient = useQueryClient();
	const rpMatrixQuery = useFetchRolePermissionMatrix();
	const permissionMatrix = (data: PermissionItem[]): TPermissionSchema[] => {
		return data.map((rp) => {
			const isDefaultPerm = defaultPermissions.find((d) => d.uid === rp.uid);
			const override = overrides.find((o) => o.permission_uid === rp.uid);
			let action: OverrideAction = null;

			if (isDefaultPerm) {
				if (override) {
					action = override.is_granted ? 'grant' : 'revoke';
				} else {
					action = 'grant';
				}
			} else {
				if (override) {
					action = override.is_granted ? 'grant' : 'revoke';
				}
			}

			return {
				permission_uid: rp.uid,
				code: capitalize(rp.code),
				module: toTitleCase(rp.module),
				isDefaultPerm: isDefaultPerm ? true : false,
				action
			};
		});
	};
	let initialState: TPermissionSchema[] = $derived.by(() => {
		if (rpMatrixQuery.status === 'success' && rpMatrixQuery.data) {
			permissionMatrix(rpMatrixQuery.data);
		}

		return [];
	});
	let getInit = () => initialState;

	const cbFn = () => {
		queryClient.invalidateQueries({
			predicate: (query) => query.queryKey[0] === ROLES.ALL
		});
	};

	const getChangedFields = (original: TPermissionSchema[], current: TPermissionSchema[]) => {
		const originalByUid = _.keyBy(original, 'permission_uid');

		return _.filter(current, (permission) => {
			return !_.isEqual(originalByUid[permission.permission_uid], permission);
		});
	};

	const changedFields = $derived.by(() => {
		return getChangedFields(initialState, $formData.overrides);
	});
	const hasChanges = $derived(Object.keys(changedFields).length > 0);

	const form = superForm<TOverridesSchema>(
		{ overrides: getInit() },
		{
			SPA: true,
			dataType: 'json',
			resetForm: false,
			validators: zod4Client(OverridesSchema),
			onUpdated: async ({ form }) => {
				if (form.valid && hasChanges && changedFields) {
					const payload: UserPermissionsOverridePayload = {
						user_uid: userUid,
						permissions: changedFields.map((m) => ({
							permission_uid: m.permission_uid,
							is_granted: m.action === 'grant'
						}))
					};
					await PermissionStore.overrideUserPermissions(payload, cbFn);
				}
			}
		}
	);

	const { form: formData, enhance, reset } = form;
	const isLoading = $derived(PermissionStore.loaders.isOverridingUserPermissions);
	const columns = $derived(createColumns(form));

	$effect(() => {
		if (rpMatrixQuery.status !== 'success' || !rpMatrixQuery.data) return;

		const mapped = permissionMatrix(rpMatrixQuery.data);
		initialState = mapped;
		reset({ data: { overrides: mapped } });
	});
</script>

{#snippet EmptyRPMatrix()}
	<div>Empty...</div>
{/snippet}

<div class="flex flex-col">
	<div class="flex items-center justify-between border-b pb-1">
		<Paragraph>Edit permission matrix</Paragraph>
	</div>

	{#if rpMatrixQuery.status === 'success' && rpMatrixQuery.data}
		<section class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-2">
			<form
				id="permission-override-form"
				use:enhance
				class="flex max-h-120 w-full flex-col gap-4 py-2"
			>
				<DataTable
					limit={100}
					status={rpMatrixQuery.status}
					{columns}
					getRowId={(row) => row.permission_uid}
					data={$formData.overrides}
					paginationProps={{
						meta: {
							type: 'offset',
							total: 0,
							page: 1,
							perPage: 100,
							totalPages: 1
						},
						isLoading: rpMatrixQuery.isLoading
					}}
					errorDataProps={{
						title: 'Failed to load permissions',
						errorDescription: 'An error occurred while fetching the all permissions.',
						onRetry: rpMatrixQuery.refetch
					}}
					emptyDataNode={EmptyRPMatrix}
				/>
			</form>
		</section>

		<div class="flex w-full flex-col justify-between gap-2 border-t p-2">
			{#if hasChanges}
				<Paragraph size="sm">You have unsaved changes to this scope’s permissions.</Paragraph>
			{/if}

			<div>
				<Button
					size="lg"
					type="button"
					class="md:w-fit"
					variant="secondary"
					onclick={() => reset({ data: { overrides: initialState } })}
					disabled={isLoading || !hasChanges}
				>
					Discard changes
				</Button>
				<Button
					size="lg"
					type="submit"
					form="permission-override-form"
					class="md:w-fit"
					disabled={isLoading || !hasChanges}
					{isLoading}
				>
					Save override
				</Button>
			</div>
		</div>
	{/if}
</div>
