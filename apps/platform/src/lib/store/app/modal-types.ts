export enum AppModals {
	DONE = 'DONE',
	DYNAMIC = 'DYNAMIC',
	ACCOUNT_LOCKED_MODAL = 'ACCOUNT_LOCKED_MODAL',
	DEACTIVATED_ACCOUNT_MODAL = 'DEACTIVATED_ACCOUNT_MODAL',
	TFA_VERIFICATION_MODAL = 'TFA_VERIFICATION_MODAL',
	FORGOT_PWD_MODAL = 'FORGOT_PWD_MODAL',
	SESSION_TIMEOUT_MODAL = 'SESSION_TIMEOUT_MODAL',
	LOGOUT_MODAL = 'LOGOUT_MODAL',
	PLANS_FORM_MODAL = 'PLANS_FORM_MODAL',
	TENANT_FORM_MODAL = 'TENANT_FORM_MODAL',
	ACTIVATE_TENANT_MODAL = 'ACTIVATE_TENANT_MODAL'
}

export type TAppModalsAction =
	| { name?: undefined }
	| { name: ''; open?: boolean }
	| ({ name: AppModals.DONE } & (
			| { open: true; text: string; subText: string; ctaText?: string; showClose?: boolean }
			| { open?: false }
	  ))
	| ({ name: AppModals.DYNAMIC } & (
			| { open: true; title: string; description?: string; btnText: string; btnFn: () => void }
			| { open?: false }
	  ))
	| ({
			name:
				| AppModals.DEACTIVATED_ACCOUNT_MODAL
				| AppModals.TFA_VERIFICATION_MODAL
				| AppModals.FORGOT_PWD_MODAL
				| AppModals.SESSION_TIMEOUT_MODAL
				| AppModals.LOGOUT_MODAL;
	  } & ({ open: true } | { open?: false }))
	| ({ name: AppModals.ACCOUNT_LOCKED_MODAL } & (
			| {
					open: true;
					remaining_time_in_seconds: number;
			  }
			| { open?: false }
	  ))
	| ({ name: AppModals.PLANS_FORM_MODAL } & (
			| {
					open: true;
					plan_uid: string;
			  }
			| { open?: false }
	  ))
	| ({ name: AppModals.TENANT_FORM_MODAL } & (
			| {
					open: true;
					tenant_uid: string;
			  }
			| { open?: false }
	  ))
	| ({ name: AppModals.ACTIVATE_TENANT_MODAL } & (
			| {
					open: true;
					tenant_uid: string;
					tenant_name: string;
			  }
			| { open?: false }
	  ));
