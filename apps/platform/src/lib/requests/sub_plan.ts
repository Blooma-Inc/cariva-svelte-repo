import { SUBSCRIPTION } from '$lib/constants/api';
import { ccyConverter } from '$lib/utils/numbers';
import type { PlanSchemaType } from '$routes/(protected)/system-settings/components/subscriptions/modals/plans-form-modal.svelte';
import server from './index';

export const postNewPlan = async (args: PlanSchemaType) => {
	const payload = {
		...args,
		amount: ccyConverter(args.amount, 'kobo'),
		duration_days: Number(args.duration_days),
		is_active: args.is_active == 'true'
	};
	await server.post(SUBSCRIPTION.CREATE, payload);
};

export const putEditPlan = async (subscription_uid: string, args: Partial<PlanSchemaType>) => {
	const payload: Record<string, unknown> = { ...args };

	if ('amount' in args && args.amount != null) {
		payload.amount = ccyConverter(args.amount, 'kobo');
	}

	if ('duration_days' in args && args.duration_days != null) {
		payload.duration_days = Number(args.duration_days);
	}

	if ('is_active' in args && args.is_active != null) {
		payload.is_active = args.is_active === 'true';
	}

	return await server.put<CarivaServerResp<boolean>>(
		SUBSCRIPTION.UPDATE.replace(':uid', subscription_uid),
		payload
	);
};
