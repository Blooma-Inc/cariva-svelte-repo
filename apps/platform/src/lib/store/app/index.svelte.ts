import type { RootStore } from '../index.svelte';
import initializer from '$lib/utils/initializers';
import { AppModals, type TAppModalsAction } from './modal-types';
import type { PlanSchemaType } from '$routes/(protected)/system-settings/components/subscriptions/modals/plans-form-modal.svelte';
import { toast } from '@cariva/ui/components/toast/index.js';
import { parseError } from '$lib/utils/errorHandler';
import { putEditPlan } from '$lib/requests/sub_plan';

const INIT_IS_OPEN = initializer(AppModals, false);

const INIT_IS_LOADING = {
	editSubPlan: false
};

class AppStore {
	rootStore: RootStore;

	nonce = 0;
	resendingTokenState: TResendTokenState = $state('idle');
	isLoading = $state({ ...INIT_IS_LOADING });
	errors = $state(initializer(this.isLoading, ''));
	isOpen = $state({ ...INIT_IS_OPEN });

	doneModal = $state({
		text: '',
		subText: '',
		ctaText: '',
		showClose: true
	});

	dynamicModal = $state({
		title: '',
		description: '',
		btnText: '',
		btnFn: () => {}
	});

	accountLockedModal = $state({
		remaining_time_in_seconds: 0
	});

	plansFormModal = $state({
		plan_uid: ''
	});

	tenantLifecycleModal = $state<{
		tenant_uid: string;
		tenant_name: string;
		status: string;
		action: TenantLifecycleAction;
	}>({ tenant_uid: '', tenant_name: '', status: '', action: 'activate' });

	tenantModal = $state({
		tenant_uid: '',
		tenant_name: ''
	});

	tfaModal = $state({
		qr_code_url: '',
		codes: ''
	});

	loadingSubPlanUid: string | null = $state(null);

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	setModalOpenState(name: AppModals, open?: boolean) {
		this.isOpen[name] = typeof open === 'undefined' ? !this.isOpen[name] : open;
	}

	/**
	 * @param modal optional options to be passed to the modal, use the enum `AppModals` to specify
	 * the modal name, if no options are passed, all modals will be closed
	 */
	toggleModals(modal: TAppModalsAction = {}) {
		switch (modal.name) {
			case '':
				break;
			case AppModals.DONE:
				if (modal.open) {
					this.doneModal = {
						text: modal.text,
						subText: modal.subText,
						ctaText: modal.ctaText ?? 'Got it',
						showClose: modal.showClose ?? true
					};
				}
				break;
			case AppModals.DYNAMIC:
				if (modal.open) {
					this.dynamicModal = {
						title: modal.title,
						description: modal.description ?? '',
						btnText: modal.btnText,
						btnFn: modal.btnFn
					};
				}
				break;
			case AppModals.ACCOUNT_LOCKED_MODAL:
				if (modal.open) {
					this.accountLockedModal = {
						remaining_time_in_seconds: modal.remaining_time_in_seconds
					};
				}
				break;
			case AppModals.PLANS_FORM_MODAL:
				if (modal.open) {
					this.plansFormModal = {
						plan_uid: modal.plan_uid
					};
				}
				break;
			case AppModals.TENANT_LIFECYCLE_MODAL:
				if (modal.open)
					this.tenantLifecycleModal = {
						tenant_uid: modal.tenant_uid,
						tenant_name: modal.tenant_name,
						status: modal.status,
						action: modal.action
					};
				break;
			case AppModals.TENANT_FORM_MODAL:
				if (modal.open) {
					this.tenantModal.tenant_uid = modal.tenant_uid;
				}
				break;
			case AppModals.ACTIVATE_TENANT_MODAL:
				if (modal.open) {
					this.tenantModal = {
						tenant_uid: modal.tenant_uid,
						tenant_name: modal.tenant_name
					};
				}
				break;
			case AppModals.SETUP_TFA_MODAL:
				if (modal.open) {
					this.tfaModal.qr_code_url = modal.qr_code_url;
				}
				break;
			case AppModals.TFA_BACKUP_CODES:
				if (modal.open) {
					this.tfaModal.codes = modal.codes;
				}
				break;
			default:
				if (!modal.name) {
					this.isOpen = { ...INIT_IS_OPEN };
				}
				break;
		}
		if (modal.name && AppModals[modal.name] !== undefined) {
			this.setModalOpenState(modal.name, modal.open);
		}

		this.nonce = Date.now() + Math.random();
	}

	async updateSubPlan(subscription_uid: string, payload: Partial<PlanSchemaType>, cb?: () => void) {
		this.isLoading.editSubPlan = true;
		this.loadingSubPlanUid = subscription_uid;
		try {
			const { data } = (await putEditPlan(subscription_uid, payload)) as {
				data: CarivaServerResp<boolean>;
			};

			toast.success(data.message);
			cb?.();
		} catch (error) {
			toast.error(parseError(error));
		} finally {
			this.isLoading.editSubPlan = false;
			this.loadingSubPlanUid = null;
		}
	}
}

export default AppStore;
