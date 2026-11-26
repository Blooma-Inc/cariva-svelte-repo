import { HEALTHCARE_SERVICES } from '$lib/constants/api';
import server from './index';

export const postHealthcareService = (payload: CreateHealthcareServicePayload) =>
	server.post<CarivaServerResp<HealthcareServiceItem>>(HEALTHCARE_SERVICES.ALL, payload);
export const patchHealthcareService = (uid: string, payload: UpdateHealthcareServicePayload) =>
	server.patch<CarivaServerResp<HealthcareServiceItem>>(
		HEALTHCARE_SERVICES.SINGLE.replace(':uid', uid),
		payload
	);
