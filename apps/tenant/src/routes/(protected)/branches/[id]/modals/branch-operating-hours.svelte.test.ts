import { beforeEach, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import OperatingHours from './branch-operating-hours.svelte';
import { stores } from '$lib/store/index.svelte';
import '../../../../layout.css';

vi.mock('$lib/store/index.svelte', () => ({
	stores: {
		AppStore: {
			branchModal: { branch_uid: 'branch-1', timezone: 'Africa/Lagos', working_hours: '' },
			isOpen: { BRANCH_OPERATING_HOURS_FROM: true },
			toggleModals: vi.fn()
		},
		BranchStore: {
			loaders: { isBranchLoading: false },
			errors: { isBranchLoading: '' },
			editBranch: vi.fn()
		},
		PermissionStore: { can: vi.fn(() => true) }
	}
}));
vi.mock('@tanstack/svelte-query', () => ({
	useQueryClient: () => ({ invalidateQueries: vi.fn() })
}));

beforeEach(() => {
	vi.clearAllMocks();
	stores.AppStore.branchModal.working_hours = JSON.stringify({
		days: [{ week_day: 0, is_enabled: true, open_time: '08:00', close_time: '17:00' }],
		is_emergency_services: false
	});
});

it('restores saved hours on reset without sending a request', async () => {
	await render(OperatingHours);
	const opening = page.getByLabelText('Opening time', { exact: true });
	await opening.fill('10:00');
	await page.getByRole('button', { name: 'Reset changes' }).click();
	await expect.element(opening).toHaveValue('08:00');
	expect(stores.BranchStore.editBranch).not.toHaveBeenCalled();
	await expect.element(page.getByRole('button', { name: 'Save preferences' })).toBeDisabled();
});

it('blocks equal opening and closing times', async () => {
	await render(OperatingHours);
	await page.getByLabelText('Closing time', { exact: true }).fill('08:00');
	await page.getByRole('button', { name: 'Save preferences' }).click();
	await expect
		.element(page.getByText('Choose a different closing time, or select All day.'))
		.toBeVisible();
	expect(stores.BranchStore.editBranch).not.toHaveBeenCalled();
});

it('saves timezone and a complete week, and marks overnight hours', async () => {
	await render(OperatingHours);
	await page.getByLabelText('Opening time', { exact: true }).fill('22:00');
	await page.getByLabelText('Closing time', { exact: true }).fill('06:00');
	await expect.element(page.getByText('Closes the next day.')).toBeVisible();
	await page.getByRole('button', { name: 'Save preferences' }).click();
	await expect.poll(() => vi.mocked(stores.BranchStore.editBranch).mock.calls.length).toBe(1);
	const [branchUid, payload] = vi.mocked(stores.BranchStore.editBranch).mock.calls[0];
	expect(branchUid).toBe('branch-1');
	expect(payload.timezone).toBe('Africa/Lagos');
	expect(payload.operating_hours?.days).toHaveLength(7);
	expect(payload.operating_hours?.days[0]).toMatchObject({
		open_time: '22:00',
		close_time: '06:00'
	});
});
