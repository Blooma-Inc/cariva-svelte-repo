export function useDebounce<T>(getThunkValue: () => T, delay: number = 500) {
	let debouncedValue = $state(getThunkValue());

	$effect(() => {
		const freshValue = getThunkValue();

		const timeoutId = setTimeout(() => {
			debouncedValue = freshValue;
		}, delay);

		return () => timeoutId && clearTimeout(timeoutId);
	});

	return {
		get value() {
			return debouncedValue;
		}
	};
}
