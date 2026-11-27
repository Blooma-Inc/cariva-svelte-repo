import { beforeEach, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import Workspace from './appointment-workspace.svelte';
import { stores } from '$lib/store/index.svelte';
import { PERMISSIONS } from '$lib/configs/permissions';
import { AppModals } from '$lib/store/app/modal-types';
import '../../../routes/layout.css';
const state = vi.hoisted(() => ({
	permissions: [] as string[],
	params: null as (() => AppointmentListParams) | null
}));
vi.mock('@tanstack/svelte-query', () => ({
	useQueryClient: () => ({ invalidateQueries: vi.fn() })
}));
vi.mock('$lib/store/index.svelte', () => ({
	stores: {
		AppStore: { currentTenant: { uid: 'tenant-a' }, toggleModals: vi.fn() },
		AuthStore: {
			accessToken: `eyJhbGciOiJub25lIn0.${btoa(JSON.stringify({ user: { uid: 'reader', tenant_uid: 'tenant-a', branch_uid: 'branch-a' } }))}.signature`,
			user: {
				branch_assignments: [
					{
						revoked_at: null,
						branch: { uid: 'branch-a', name: 'Main', timezone: 'Africa/Lagos', is_active: true }
					}
				]
			}
		},
		PermissionStore: { can: (permission: string) => state.permissions.includes(permission) },
		AppointmentStore: { actionLoading: false, actionError: '', perform: vi.fn() }
	}
}));
vi.mock('$lib/hooks/appointments/use-appointment-booking', () => ({
	useAppointmentBookingContext: () => ({
		isPending: false,
		isError: false,
		data: {
			branch: {
				uid: 'branch-a',
				name: 'Main branch',
				timezone: 'Africa/Lagos',
				is_active: true,
				operating_hours: null
			}
		}
	})
}));
vi.mock('$lib/hooks/appointments/use-appointment-workspace', () => ({
	useAppointmentList: (_branch: unknown, params: () => AppointmentListParams) => {
		state.params = params;
		return {
			isPending: false,
			isFetching: false,
			isError: false,
			get data() {
				return {
					data: params().q
						? []
						: [
								{
									uid: 'appointment-a',
									branch_uid: 'branch-a',
									tenant_uid: 'tenant-a',
									status: 'booked',
									starts_at: '2030-01-02T09:00:00Z',
									ends_at: '2030-01-02T09:30:00Z',
									allowed_actions: ['arrive'],
									patient: { display_name: 'Ada Test', patient_no: 'TEST-001' },
									practitioner: null,
									service: { name: 'Therapy' }
								}
							],
					meta: { total: params().q ? 0 : 1, page: 1, per_page: 10, total_pages: 1 }
				};
			}
		};
	},
	useAppointmentWeek: (_branch: unknown, params: () => AppointmentWeekParams) => ({
		isPending: false,
		isFetching: false,
		isError: false,
		get data() {
			return [
				{
					uid: 'appointment-week',
					branch_uid: 'branch-a',
					tenant_uid: 'tenant-a',
					status: 'booked',
					starts_at: new Date(Date.parse(params().period_start) + 10 * 3600000).toISOString(),
					ends_at: new Date(Date.parse(params().period_start) + 10.5 * 3600000).toISOString(),
					allowed_actions: [],
					patient: { display_name: 'Ada Test', patient_no: 'TEST-001' },
					practitioner: null,
					service: { name: 'Therapy' }
				}
			];
		}
	}),
	useAppointmentSummary: () => ({
		isPending: false,
		isFetching: false,
		isError: false,
		data: {
			data: {
				total: 42,
				counts_by_status: { booked: 10, arrived: 2, 'checked-in': 2 },
				next_expected: null
			}
		}
	})
}));
beforeEach(() => {
	vi.clearAllMocks();
	state.permissions = [PERMISSIONS.APPOINTMENTS_READ];
	state.params = null;
});
it('renders server totals separately from the page and opens appointment details for read-only users', async () => {
	render(Workspace, {
		context: { branch_uid: 'branch-a', branch_name: 'Main', timezone: 'Africa/Lagos' }
	});
	await expect.element(page.getByText('Ada Test', { exact: true })).toBeVisible();
	await expect.element(page.getByText('42', { exact: true })).toBeVisible();
	await expect
		.element(page.getByRole('button', { name: 'Book appointment', exact: true }))
		.not.toBeInTheDocument();
	await expect
		.element(page.getByRole('button', { name: 'Mark arrived', exact: true }))
		.not.toBeInTheDocument();
	await page.getByRole('button', { name: 'View', exact: true }).click();
	expect(stores.AppStore.toggleModals).toHaveBeenCalledWith({
		name: AppModals.APPOINTMENT_DETAILS_MODAL,
		open: true,
		branch_uid: 'branch-a',
		appointment_uid: 'appointment-a'
	});
});
it('searches the full worklist and shows a filtered empty state', async () => {
	render(Workspace, {
		context: { branch_uid: 'branch-a', branch_name: 'Main', timezone: 'Africa/Lagos' }
	});
	await page.getByRole('searchbox', { name: 'Search appointments' }).fill('missing patient');
	await expect.element(page.getByText('No matching appointments', { exact: true })).toBeVisible();
	expect(state.params?.().q).toBe('missing patient');
	await page.getByRole('button', { name: 'Clear filters', exact: true }).first().click();
	await expect.element(page.getByText('Ada Test', { exact: true })).toBeVisible();
});

it('opens the full-width week calendar and reuses the central appointment details sheet', async () => {
	render(Workspace, {
		context: { branch_uid: 'branch-a', branch_name: 'Main', timezone: 'Africa/Lagos' }
	});
	await page.getByRole('tab', { name: 'Week', exact: true }).click();
	await expect.element(page.getByRole('button', { name: 'Next week', exact: true })).toBeVisible();
	await page.getByRole('button', { name: /Ada Test.*Therapy/ }).click();
	expect(stores.AppStore.toggleModals).toHaveBeenCalledWith({
		name: AppModals.APPOINTMENT_DETAILS_MODAL,
		open: true,
		branch_uid: 'branch-a',
		appointment_uid: 'appointment-week'
	});
});
