type Enable2FA = {
	secret: string;
	qr_code_url: string;
};

interface SessionItem extends BaseItem {
	user_uid: string;
	ip_address: string;
	user_agent: string;
	device_finger_print: string;
	expires_at: string;
	revoked_at: string;
}

interface UserItem extends BaseItem {
	email: string;
	first_name: string;
	last_name: string;
	middle_name: string;
	phone: string;
	gender: string;
	profile_photo_url: string;
	designation: string;
	is_email_verified: boolean;
	last_login_at: string;
}
