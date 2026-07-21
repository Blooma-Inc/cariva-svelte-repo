import { stores } from '$lib/store/index.svelte';

export const createCountdown = (value: number) => {
	let counter = $state(value);
	const { AppStore } = stores;

	const minutesLeft = $derived(Math.floor(counter / 60));
	const secondsLeft = $derived(counter % 60);
	const timeToCodeResend = $derived(`${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`);
	const resendCodeActive = $derived(counter === 0);

	$effect(() => {
		if (counter <= 0) {
			AppStore.resendingTokenState = 'idle';
			return;
		}

		const interval = setInterval(() => {
			counter--;
		}, 1000);

		return () => clearInterval(interval);
	});

	return {
		get timeToCodeResend() {
			return timeToCodeResend;
		},
		get resendCodeActive() {
			return resendCodeActive;
		},
		get counter() {
			return counter;
		}
	};
};
