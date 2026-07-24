import { USER } from '$lib/constants/api';
import type { UserProfileType } from '$routes/(protected)/profile/modals/profile-form-modal.svelte';
import server from './index';

export const patchUpdateUser = async (payload: Partial<UserProfileType>) =>
	await server.patch(USER.PROFILE, payload);
