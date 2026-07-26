interface MenuItem {
	title: string;
	url?: Pathname;
	icon: LucideIcon;
	isNestable?: boolean;
	submenu?: Array<{
		title: string;
		url: Pathname;
		isNestable?: boolean;
	}>;
}

interface RoleMenuItem extends MenuItem {
	roles: EnumRole[];
}

type TIsAuthenticated = { ttl: number; token?: string; email?: string };

type TResendTokenState = 'idle' | 'resending' | 'sent' | 'failed';

interface AccessTokenUserModel {
	uid: string;
	email: string;
	first_name: string;
	last_name: string;
	roles: string[];
	scope: string;
	is_email_verified: boolean;
}

interface TokenModel {
	exp: number;
	jti: string;
	refresh: boolean;
	user: AccessTokenUserModel;
}

interface OffsetPagination {
	total: number;
	page: number;
	per_page: number;
	total_pages: number;
}

interface CarivaServerResp<D, M = null> {
	data: D;
	meta: M;
	message: string;
	status: string;
}

interface CarivaApiError {
	errors: string;
	message: string;
	status: number;
}

interface QueryHookResponse<D> {
	data: D;
	isLoading: boolean;
	error: unknown;
	status: 'error' | 'success' | 'pending';
	refetch: (
		options?: RefetchOptions
	) => Promise<QueryObserverResult<CarivaServerResp<SubscriptionItem[], null>, Error>>;
}

interface CarivaBaseQuery {
	q?: string;
	limit?: number;
	offset?: number;
}
