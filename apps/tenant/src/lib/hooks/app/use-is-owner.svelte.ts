import { stores } from '$lib/store/index.svelte';

export function UseIsOwner(userUid: () => string) {
	const { AuthStore } = stores;

	const isOwner = $derived.by(() => {
		if (AuthStore.user?.uid) {
			return AuthStore.user.uid === userUid();
		}
		return false;
	});

	return {
		get isOwner() {
			return isOwner;
		}
	};
}
