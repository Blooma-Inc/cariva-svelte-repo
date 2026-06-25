type TIsAuthenticated = { ttl: number; token?: string; email?: string };

type TResendTokenState = 'idle' | 'resending' | 'sent' | 'failed';

interface IJwtPayloadExt extends jwt.JwtPayload {
	authorization: boolean;
	exp: number;
	userID: number;
	email: string;
	firstName: string;
	is_interested: boolean;
	is_vendor: boolean;
	lastName: string;
	pics: string;
	business_handle: string;
	user_uuid: string;
	vendor_id: string;
}

interface GnLApiError {
	errors: string;
	message: string;
	status: number;
}
