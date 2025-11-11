export const API_CONFIG = {
	BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5104/api',
	TIMEOUT: 30000, // 30 seconds
} as const;

export const API_ENDPOINTS = {
	AUTH: {
		LOGIN: '/Auth/login',
		REGISTER: '/Auth/register',
		REFRESH: '/Auth/refresh',
		LOGOUT: '/Auth/logout',
		CHANGE_PASSWORD: '/Auth/change-password',
	},
	USERS: {
		BASE: '/Users',
		BY_ID: (id: string) => `/Users/${id}`,
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
