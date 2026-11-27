export enum AppModals {
	APPOINTMENT_FORM_MODAL = 'APPOINTMENT_FORM_MODAL',
	PRACTITIONER_SCHEDULE_MODAL = 'PRACTITIONER_SCHEDULE_MODAL',
	BRANCH_HEALTHCARE_SERVICE_MODAL = 'BRANCH_HEALTHCARE_SERVICE_MODAL',
	HEALTHCARE_SERVICE_MODAL = 'HEALTHCARE_SERVICE_MODAL',
	ENCOUNTER_FORM_MODAL = 'ENCOUNTER_FORM_MODAL',
	PATIENT_PROFILE_MODAL = 'PATIENT_PROFILE_MODAL',
	DONE = 'DONE',
	DYNAMIC = 'DYNAMIC',
	ACCOUNT_LOCKED_MODAL = 'ACCOUNT_LOCKED_MODAL',
	RESET_USER_PASSWORD_MODAL = 'RESET_USER_PASSWORD_MODAL',
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
	WARD_FORM_MODAL = 'WARD_FORM_MODAL',
	STAFF_FORM_MODAL = 'STAFF_FORM_MODAL',
	BRANCH_OPERATING_HOURS_FROM = 'BRANCH_OPERATING_HOURS_FROM',
	STAFF_PERMISSION_OVERRIDE_MODAL = 'STAFF_PERMISSION_OVERRIDE_MODAL'
}

export type TAppModalsAction =
	| ({ name: AppModals.APPOINTMENT_FORM_MODAL } & (
			| { open: true; patient?: { uid: string; label: string } }
			| { open?: false }
	  ))
	| ({ name: AppModals.PRACTITIONER_SCHEDULE_MODAL } & (
			| {
					open: true;
					context: PractitionerScheduleContext;
					record_uid?: string;
					mode: 'view' | 'form';
			  }
			| { open?: false }
	  ))
	| ({ name: AppModals.BRANCH_HEALTHCARE_SERVICE_MODAL } & (
			| {
					open: true;
					branch_uid: string;
					branch_name: string;
					timezone: string;
					branch_is_active: boolean;
					service_uid?: string;
					mode: 'view' | 'form' | 'status';
			  }
			| { open?: false }
	  ))
	| ({ name: AppModals.HEALTHCARE_SERVICE_MODAL } & (
			| { open: true; service_uid?: string; mode: 'view' | 'form' | 'status' }
			| { open?: false }
	  ))
	| ({ name: AppModals.ENCOUNTER_FORM_MODAL } & (
			| { open: true; patient_uid: string; branch_uid?: string; branch_name?: string }
			| { open?: false }
	  ))
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
	| ({ name: AppModals.PATIENT_PROFILE_MODAL } & (
			| { open: true; patient_uid: string }
			| { open?: false }
	  ))
	| ({ name: AppModals.WARD_FORM_MODAL } & (
			| { open: true; branch_uid: string; branch_name: string; ward?: WardItem }
			| { open?: false }
	  ))
	| ({ name: AppModals.BRANCH_FORM_MODAL } & (
			| {
					open: true;
					branch_uid: string;
			  }
			| { open?: false }
	  ))
	| ({
			name:
				| AppModals.STAFF_FORM_MODAL
				| AppModals.STAFF_PERMISSION_OVERRIDE_MODAL
				| AppModals.RESET_USER_PASSWORD_MODAL;
	  } & (
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
					timezone: string;
			  }
			| { open?: false }
	  ));
