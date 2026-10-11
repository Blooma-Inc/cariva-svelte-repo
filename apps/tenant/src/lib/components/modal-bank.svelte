<script lang="ts">
	import type { Component } from 'svelte';
	import { AppModals } from '$lib/store/app/modal-types';
	import { stores } from '$lib/store/index.svelte';

	const ModalsMap = {
		[AppModals.DONE]: () => import('$lib/components/modals/done-modal.svelte'),
		[AppModals.DYNAMIC]: () => import('$lib/components/modals/dynamic-modal.svelte'),
		[AppModals.ACCOUNT_LOCKED_MODAL]: () =>
			import('$lib/components/modals/account-locked-modal.svelte'),
		[AppModals.RESET_USER_PASSWORD_MODAL]: () =>
			import('$lib/components/modals/reset-user-password-modal.svelte'),
		[AppModals.DEACTIVATED_ACCOUNT_MODAL]: () =>
			import('$lib/components/modals/deactivated-account-modal.svelte'),
		[AppModals.SETUP_TFA_MODAL]: () => import('$lib/components/modals/setup-tfa-modal.svelte'),
		[AppModals.ENABLE_TFA_MODAL]: () => import('$lib/components/modals/enable-tfa-modal.svelte'),
		[AppModals.TFA_BACKUP_CODES]: () =>
			import('$lib/components/modals/tfa-backup-codes-modal.svelte'),
		[AppModals.TFA_VERIFICATION_MODAL]: () =>
			import('$lib/components/modals/tfa-verification-modal.svelte'),
		[AppModals.FORGOT_PWD_MODAL]: () => import('$lib/components/modals/forgot-pwd-modal.svelte'),
		[AppModals.SESSION_TIMEOUT_MODAL]: () =>
			import('$lib/components/modals/session-timeout-modal.svelte'),
		[AppModals.LOGOUT_MODAL]: () => import('$lib/components/modals/logout-modal.svelte'),
		[AppModals.REQUEST_EMAIL_VERIFICATION_MODAL]: () =>
			import('$lib/components/modals/request-email-verification-modal.svelte'),
		[AppModals.WARD_FORM_MODAL]: () =>
			import('$routes/(protected)/wards/modals/ward-form-modal.svelte'),
		[AppModals.BRANCH_FORM_MODAL]: () =>
			import('$routes/(protected)/branches/modals/branch-form-modal.svelte'),
		[AppModals.STAFF_FORM_MODAL]: () =>
			import('$routes/(protected)/staff/modals/staff-form-modal.svelte'),
		[AppModals.PROFILE_FORM_MODAL]: () =>
			import('$routes/(protected)/profile/modals/profile-form-modal.svelte'),
		[AppModals.BRANCH_OPERATING_HOURS_FROM]: () =>
			import('$routes/(protected)/branches/[id]/modals/branch-operating-hours.svelte'),
		[AppModals.STAFF_PERMISSION_OVERRIDE_MODAL]: () =>
			import('$routes/(protected)/staff/modals/staff-permission-override-modal.svelte')
	};

	let { AppStore } = stores;

	const openModalsComponent = $derived.by(() => {
		return Object.entries(ModalsMap).reduce(
			(
				acc: { Render: () => Promise<{ default: Component }>; name: string }[],
				[keyName, modal]
			) => {
				if (AppStore.isOpen[keyName as keyof typeof AppModals]) {
					acc.push({ Render: modal, name: keyName });
				}
				return acc;
			},
			[]
		);
	});
</script>

{#each openModalsComponent as { Render, name }, index (name)}
	{#await Render() then { default: Modal }}
		<Modal key="{name}_{index}" />
	{/await}
{/each}
