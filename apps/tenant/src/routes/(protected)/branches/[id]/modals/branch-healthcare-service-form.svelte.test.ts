import { beforeEach, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import BranchServiceForm from './branch-healthcare-service-form.svelte';
import { stores } from '$lib/store/index.svelte';
import '../../../../layout.css';

vi.mock('$lib/store/index.svelte', () => ({
	stores: {
		AppStore: { currentTenant: { uid: 'tenant-a' } },
		AuthStore: { accessToken: '' },
		PermissionStore: { can: () => true },
		BranchHealthcareServiceStore: { loading: false, error: '', save: vi.fn() }
	}
}));
vi.mock('$lib/hooks/healthcare-services/use-fetch-healthcare-services', () => ({
	useFetchHealthcareServices: () => ({
		isPending: false,
		isError: false,
		isFetching: false,
		data: {
			data: [{ uid: 'catalog-a', name: 'Therapy', is_active: true }],
			meta: { total: 1, page: 1, total_pages: 1 }
		}
	})
}));

beforeEach(() => {
	vi.clearAllMocks();
	stores.AuthStore.accessToken = `eyJhbGciOiJub25lIn0.${btoa(JSON.stringify({ user: { tenant_uid: 'tenant-a', branch_uid: 'branch-a' } }))}.signature`;
	stores.BranchHealthcareServiceStore.error = '';
});

it('assigns a catalogue service without inventing availability', async () => {
	render(BranchServiceForm, {
		branchUid: 'branch-a',
		timezone: 'Africa/Lagos',
		branchIsActive: true,
		onSuccess: vi.fn()
	});
	await page.getByRole('combobox').click();
	await page.getByRole('option', { name: 'Therapy', exact: true }).click();
	await page.getByRole('button', { name: 'Assign service', exact: true }).click();
	await expect
		.poll(() => vi.mocked(stores.BranchHealthcareServiceStore.save).mock.calls.length)
		.toBe(1);
	expect(stores.BranchHealthcareServiceStore.save).toHaveBeenCalledWith(
		'branch-a',
		'catalog-a',
		true,
		{ is_active: true, availability: null },
		expect.any(Function)
	);
});

it('saves a new dated exception while preserving weekly windows', async () => {
	const service = {
		uid: 'offering-a',
		healthcare_service_uid: 'catalog-a',
		branch_uid: 'branch-a',
		name: 'Therapy',
		is_active: true,
		catalog_is_active: true,
		branch_is_active: true,
		availability: {
			available_time: [
				{
					days_of_week: ['mon'],
					all_day: false,
					available_start_time: '09:00',
					available_end_time: '17:00'
				}
			],
			not_available_time: []
		}
	} as unknown as BranchHealthcareServiceItem;
	render(BranchServiceForm, {
		branchUid: 'branch-a',
		timezone: 'Africa/Lagos',
		branchIsActive: true,
		service,
		onSuccess: vi.fn()
	});
	await page.getByRole('button', { name: 'Add exception', exact: true }).click();
	await page.getByLabelText('Starts at', { exact: true }).fill('2026-12-01T09:00');
	await page.getByLabelText('Ends at', { exact: true }).fill('2026-12-01T10:00');
	await page.getByRole('button', { name: 'Save configuration', exact: true }).click();
	await expect
		.poll(() => vi.mocked(stores.BranchHealthcareServiceStore.save).mock.calls.length)
		.toBe(1);
	const [, , create, payload] = vi.mocked(stores.BranchHealthcareServiceStore.save).mock.calls[0];
	expect(create).toBe(false);
	expect(payload).toEqual({
		availability: {
			available_time: service.availability!.available_time,
			not_available_time: [
				{
					description: null,
					during: { start: '2026-12-01T08:00:00Z', end: '2026-12-01T09:00:00Z' }
				}
			]
		}
	});
});
