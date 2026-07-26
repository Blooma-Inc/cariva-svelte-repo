import type { RootStore } from '../index.svelte';
import initializer from '$lib/utils/initializers';
import { AppModals, type TAppModalsAction } from './modal-types';

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
}

export default AppStore;
