import { beforeEach, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import ScheduleCard from './practitioner-schedule-card.svelte';
import { stores } from '$lib/store/index.svelte';
import { PERMISSIONS } from '$lib/configs/permissions';
import { AppModals } from '$lib/store/app/modal-types';
import '../../../routes/layout.css';

const state = vi.hoisted(() => ({ token: '', permissions: [] as string[], person: 'self' }));
vi.mock('$lib/store/index.svelte', () => ({
	stores: {
		AppStore: { currentTenant: { uid: 'tenant-a' }, toggleModals: vi.fn() },
		AuthStore: {
			get accessToken() {
				return state.token;
			}
		},
		PermissionStore: { can: (permission: string) => state.permissions.includes(permission) },
		PractitionerAvailabilityStore: { loading: false, error: '' }
	}
}));
vi.mock('$lib/hooks/practitioner-availability/use-fetch-practitioner-availability', () => ({
	useFetchPractitionerAvailability: () => ({
		status: 'success',
		isSuccess: true,
		isPending: false,
		isError: false,
		isFetching: false,
		refetch: vi.fn(),
		data: {
			data: [
				{
					uid: 'schedule-a',
					tenant_uid: 'tenant-a',
					branch_uid: 'branch-a',
					practitioner_uid: state.person,
					assignment_uid: 'assignment-a',
					service_name: null,
					branch_healthcare_service_uid: null,
					is_active: true,
					is_effectively_active: true,
					assignment_is_active: true,
					practitioner_is_active: true,
					branch_is_active: true,
					offering_is_active: null,
					catalog_is_active: null,
					availability: null,
					timezone: 'Africa/Lagos'
				}
			],
			meta: { total: 1, page: 1, per_page: 10, total_pages: 1 }
		}
	})
}));
const person = (uid: string) =>
	({
		uid,
		first_name: 'Test',
		last_name: 'Practitioner',
		is_active: true,
		branch_assignments: [
			{
				uid: 'assignment-a',
				branch_uid: 'branch-a',
				user_uid: uid,
				revoked_at: null,
				branch: { uid: 'branch-a', name: 'Main', timezone: 'Africa/Lagos', is_active: true }
			}
		]
	}) as unknown as UserProfileItem;

beforeEach(() => {
	vi.clearAllMocks();
	state.person = 'self';
	state.token = `eyJhbGciOiJub25lIn0.${btoa(JSON.stringify({ user: { uid: 'self', tenant_uid: 'tenant-a', branch_uid: 'branch-a' } }))}.signature`;
	state.permissions = [
		PERMISSIONS.PRACTITIONER_AVAILABILITY_READ,
		PERMISSIONS.PRACTITIONER_AVAILABILITY_CREATE,
		PERMISSIONS.PRACTITIONER_AVAILABILITY_UPDATE
	];
});

it('allows personal editing without management permission and opens the selected branch record', async () => {
	render(ScheduleCard, { practitioner: person('self'), personal: true });
	await expect.element(page.getByText('My Schedule', { exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'Edit schedule', exact: true }).click();
	expect(stores.AppStore.toggleModals).toHaveBeenCalledWith(
		expect.objectContaining({
			name: AppModals.PRACTITIONER_SCHEDULE_MODAL,
			record_uid: 'schedule-a',
			mode: 'form',
			context: expect.objectContaining({
				practitioner_uid: 'self',
				branch_uid: 'branch-a',
				assignment_uid: 'assignment-a'
			})
		})
	);
});

it('shows another practitioner’s details without allowing edits when manage is absent', async () => {
	state.person = 'other';
	render(ScheduleCard, { practitioner: person('other') });
	await expect
		.element(page.getByRole('button', { name: 'Edit schedule', exact: true }))
		.not.toBeInTheDocument();
	await expect
		.element(page.getByRole('button', { name: 'Add schedule', exact: true }))
		.not.toBeInTheDocument();
	await page.getByRole('button', { name: 'View details', exact: true }).click();
	expect(stores.AppStore.toggleModals).toHaveBeenCalledWith(
		expect.objectContaining({
			mode: 'view',
			context: expect.objectContaining({ practitioner_uid: 'other' })
		})
	);
});
