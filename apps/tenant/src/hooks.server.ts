import { redirect, type Handle } from '@sveltejs/kit';
import { importSPKI, jwtVerify } from 'jose';
import ROUTES from '$lib/configs/routes.svelte';
import logger from '$lib/utils/logger';
import { env } from '$env/dynamic/private';
import { Mangle } from '$lib/constants/mangle';

let cachedKey: CryptoKey;
async function getPublicKey() {
	if (!env.JWT_PUBLIC_KEY) throw new Error('JWT public key is not configured');
	cachedKey ??= await importSPKI(env.JWT_PUBLIC_KEY, 'RS256');
	return cachedKey;
}

function redirectToLogin(event: Parameters<Handle>[0]['event']) {
	const safeRedirect = encodeURIComponent(event.url.pathname + event.url.search);
	return redirect(303, `${ROUTES.LOGIN.path}?r=${safeRedirect}`);
}

export const handle: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;

	if (!event.route.id?.split('/').includes('(protected)')) {
		return resolve(event);
	}

	const token = event.cookies.get(Mangle.SESSION_ASSERTION_KEY);

	if (!token) {
		throw redirectToLogin(event);
	}

	try {
		await jwtVerify(token, await getPublicKey(), { algorithms: ['RS256'] });
		event.locals.hasValidSession = true;
	} catch {
		logger.debug('Terminating Page Req', 'ASSERTION_INVALID_OR_EXPIRED', { pathname });
		event.cookies.delete(Mangle.SESSION_ASSERTION_KEY, { path: '/' });
		throw redirectToLogin(event);
	}

	return resolve(event);
};
