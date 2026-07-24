type ScrollOptions = ScrollIntoViewOptions;

export function useScrollActiveTab<T extends string>({
	activeTab,
	refs,
	fallback,
	options = {
		behavior: 'smooth',
		inline: 'center',
		block: 'nearest'
	}
}: {
	activeTab: () => T | null | undefined;
	refs: Record<T, HTMLElement | null | undefined>;
	fallback: T;
	options?: ScrollOptions;
}) {
	$effect(() => {
		const tab = activeTab() ?? fallback;
		const el = refs[tab];

		if (el) {
			el.scrollIntoView(options);
		}
	});
}
