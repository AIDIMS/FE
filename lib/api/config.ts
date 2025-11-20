export const API_CONFIG = {
	BASE_URL: process.env.NEXT_PUBLIC_API_URL,
	TIMEOUT: 30000,
} as const;

export const API_ENDPOINTS = {
	AUTH: {
		LOGIN: '/Auth/login',
		LOGOUT: '/Auth/logout',
		REFRESH: '/Auth/refresh-token',
		CHANGE_PASSWORD: '/Auth/change-password',
		PROFILE: '/Auth/me',
		VALIDATE_TOKEN: '/Auth/validate-token',
	},
	USERS: {
		BASE: '/Users',
		BY_ID: (id: string) => `/Users/${id}`,
		IDENTIFY: (id: string) => `/Users/identify/${id}`,
	},
	PATIENTS: {
		BASE: '/Patients',
		BY_ID: (id: string) => `/Patients/${id}`,
	},
	DICOM: {
		UPLOAD: '/Dicom/upload',
		BY_ID: (id: string) => `/Dicom/${id}`,
	},
} as const;
