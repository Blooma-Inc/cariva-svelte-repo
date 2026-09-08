export enum AppModals {
	DONE = 'DONE',
	DYNAMIC = 'DYNAMIC',
	ACCOUNT_LOCKED_MODAL = 'ACCOUNT_LOCKED_MODAL',
	DEACTIVATED_ACCOUNT_MODAL = 'DEACTIVATED_ACCOUNT_MODAL',
	SETUP_TFA_MODAL = 'SETUP_TFA_MODAL',
	ENABLE_TFA_MODAL = 'ENABLE_TFA_MODAL',
	TFA_BACKUP_CODES = 'TFA_BACKUP_CODES',
	TFA_VERIFICATION_MODAL = 'TFA_VERIFICATION_MODAL',
	FORGOT_PWD_MODAL = 'FORGOT_PWD_MODAL',
	SESSION_TIMEOUT_MODAL = 'SESSION_TIMEOUT_MODAL',
	LOGOUT_MODAL = 'LOGOUT_MODAL',
	PROFILE_FORM_MODAL = 'PROFILE_FORM_MODAL',
	REQUEST_EMAIL_VERIFICATION_MODAL = 'REQUEST_EMAIL_VERIFICATION_MODAL',
	BRANCH_FORM_MODAL = 'BRANCH_FORM_MODAL',
	STAFF_FORM_MODAL = 'STAFF_FORM_MODAL',
	BRANCH_OPERATING_HOURS_FROM = 'BRANCH_OPERATING_HOURS_FROM'
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
				| AppModals.LOGOUT_MODAL
				| AppModals.PROFILE_FORM_MODAL
				| AppModals.ENABLE_TFA_MODAL
				| AppModals.REQUEST_EMAIL_VERIFICATION_MODAL;
	  } & ({ open: true } | { open?: false }))
	| ({ name: AppModals.ACCOUNT_LOCKED_MODAL } & (
			| {
					open: true;
					remaining_time_in_seconds: number;
			  }
			| { open?: false }
	  ))
	| ({ name: AppModals.SETUP_TFA_MODAL } & (
			| {
					open: true;
					qr_code_url: string;
			  }
			| { open?: false }
	  ))
	| ({ name: AppModals.TFA_BACKUP_CODES } & (
			| {
					open: true;
					codes: string;
			  }
			| { open?: false }
	  ))
	| ({ name: AppModals.BRANCH_FORM_MODAL } & (
			| {
					open: true;
					branch_uid: string;
			  }
			| { open?: false }
	  ))
	| ({ name: AppModals.STAFF_FORM_MODAL } & (
			| {
					open: true;
					user_uid: string;
			  }
			| { open?: false }
	  ))
	| ({ name: AppModals.BRANCH_OPERATING_HOURS_FROM } & (
			| {
					open: true;
					branch_uid: string;
					working_hours: string;
			  }
			| { open?: false }
	  ));
