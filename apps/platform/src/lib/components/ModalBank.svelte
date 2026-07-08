<script lang="ts">
	import type { Component } from 'svelte';
	import { AppModals } from '$lib/store/app/modalTypes';
	import { stores } from '$lib/store/index.svelte';

	const ModalsMap = {
		[AppModals.DONE]: () => import('$lib/components/modals/Done.svelte'),
		[AppModals.DYNAMIC]: () => import('$lib/components/modals/Dynamic.svelte'),
		[AppModals.ACCOUNT_LOCKED_MODAL]: () =>
			import('$lib/components/modals/AccountLockedModal.svelte'),
		[AppModals.DEACTIVATED_ACCOUNT_MODAL]: () =>
			import('$lib/components/modals/DeactivatedAccountModal.svelte'),
		[AppModals.TFA_VERIFICATION_MODAL]: () =>
			import('$lib/components/modals/TFAVerificationModal.svelte'),
		[AppModals.FORGOT_PWD_MODAL]: () => import('$lib/components/modals/ForgotPwdModal.svelte'),
		[AppModals.SESSION_TIMEOUT_MODAL]: () =>
			import('$lib/components/modals/SessionTimeoutModal.svelte'),
		[AppModals.LOGOUT_MODAL]: () => import('$lib/components/modals/LogoutModal.svelte')
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
