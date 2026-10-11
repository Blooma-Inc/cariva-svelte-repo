import type { RootStore } from '../index.svelte';
import initializer from '$lib/utils/initializers';
import { AppModals, type TAppModalsAction } from './modal-types';

const INIT_IS_OPEN = initializer(AppModals, false);

const INIT_IS_LOADING = {
	editSubPlan: false
};

class AppStore {
	rootStore: RootStore;

	currentTenant: Partial<CurrentTenant> = $state({});
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

	branchModal = $state({
		branch_uid: '',
		branch_name: '',
		working_hours: ''
	});

	wardModal = $state<{ branch_uid: string; branch_name: string; ward: WardItem | null }>({
		branch_uid: '',
		branch_name: '',
		ward: null
	});

	tfaModal = $state({
		qr_code_url: '',
		codes: ''
	});

	userModal = $state({
		user_uid: ''
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
			case AppModals.WARD_FORM_MODAL:
				if (modal.open) {
					this.wardModal = {
						branch_uid: modal.branch_uid,
						branch_name: modal.branch_name,
						ward: modal.ward ?? null
					};
				}
				break;
			case AppModals.BRANCH_FORM_MODAL:
				if (modal.open) {
					this.branchModal.branch_uid = modal.branch_uid;
				}
				break;
			case AppModals.BRANCH_OPERATING_HOURS_FROM:
				if (modal.open) {
					this.branchModal.branch_uid = modal.branch_uid;
					this.branchModal.working_hours = modal.working_hours;
				}
				break;
			case AppModals.STAFF_FORM_MODAL:
			case AppModals.STAFF_PERMISSION_OVERRIDE_MODAL:
			case AppModals.RESET_USER_PASSWORD_MODAL:
				if (modal.open) {
					this.userModal.user_uid = modal.user_uid;
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
}

export default AppStore;
