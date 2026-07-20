import { getNetworkState, setOffline, setOnline, subscribe } from '$lib/utils/network';

export const useNetworkStatus = () => {
	let networkState = $state(getNetworkState());

	$effect(() => {
		const handleOnline = () => setOnline();
		const handleOffline = () => setOffline('No internet connection');

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		const unsubscribe = subscribe(({ isOnline, isReady, lastError }) => {
			networkState = { isOnline, isReady, lastError: lastError ? lastError : null };
		});

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
			unsubscribe();
		};
	});

	return {
		get isOnline() {
			return networkState.isOnline;
		},
		get isReady() {
			return networkState.isReady;
		},
		get lastError() {
			return networkState.lastError;
		}
	};
};
