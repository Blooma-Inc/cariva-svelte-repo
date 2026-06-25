export enum AppModals {
	RETAIL_USER = 'RETAIL_USER',
	DONE = 'DONE',
	DYNAMIC = 'DYNAMIC'
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
	  ));
