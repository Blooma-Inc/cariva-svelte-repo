import { expect, it, vi } from 'vitest';
import { useFetchStaff } from './use-fetch-staff';
const captured = vi.hoisted(() => ({
	options: undefined as undefined | (() => { queryKey: readonly unknown[]; meta: { path: string } })
}));
vi.mock('@tanstack/svelte-query', () => ({
	createQuery: (options: () => { queryKey: readonly unknown[]; meta: { path: string } }) => {
		captured.options = options;
		return {};
	}
}));
it('updates staff identity when navigating between staff profiles', () => {
	let uid = 'staff-a';
	useFetchStaff(() => uid);
	const first = captured.options!();
	uid = 'staff-b';
	const second = captured.options!();
	expect(second.queryKey).not.toEqual(first.queryKey);
	expect(second.meta.path).toContain('staff-b');
	expect(first.meta.path).toContain('staff-a');
});
