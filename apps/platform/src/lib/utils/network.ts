type TListener = (state: {
	isOnline: boolean;
	isReady: boolean;
	lastError?: string | null;
}) => void;

let isOnline = true;
let isReady = false;
let lastError: string | null = null;

const listeners = new Set<TListener>();

function emit() {
	listeners.forEach((l) => l({ isOnline, isReady, lastError }));
}

export function getNetworkState() {
	return { isOnline, isReady, lastError };
}

export function initNetworkState() {
	if (typeof navigator !== 'undefined') {
		isOnline = navigator.onLine;
	}
	isReady = true;
	lastError = null;
	emit();
}

export function setOnline() {
	isOnline = true;
	lastError = null;
	emit();
}

export function setOffline(reason = 'No internet connection') {
	isOnline = false;
	lastError = reason;
	emit();
}

export function subscribe(listener: TListener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export const NETWORK_ERR = 'Server is currently unavailable.';
