export const API_CONFIG = {
	BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5104/api',
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
	VISITS: {
		BASE: '/PatientVisits',
		BY_ID: (id: string) => `/PatientVisits/${id}`,
		BY_PATIENT: (patientId: string) => `/PatientVisits/patient/${patientId}`,
		UPDATE_STATUS: (id: string) => `/PatientVisits/${id}/status`,
	},
	IMAGING_ORDERS: {
		BASE: '/ImagingOrders',
		BY_ID: (id: string) => `/ImagingOrders/${id}`,
		BY_VISIT: (visitId: string) => `/ImagingOrders/visit/${visitId}`,
		UPDATE_STATUS: (id: string) => `/ImagingOrders/${id}/status`,
	},
	DICOM: {
		UPLOAD: '/Dicom/upload',
		BY_ID: (id: string) => `/Dicom/${id}`,
		BY_ORDER: (orderId: string) => `/Dicom/order/${orderId}`,
		DOWNLOAD: (instanceId: string) => `/Dicom/download/${instanceId}`,
		PREVIEW: (instanceId: string) => `/Dicom/preview/${instanceId}`,
	},
	AI_ANALYSIS: {
		BY_INSTANCE: (instanceId: string) => `/AiAnalysis/instance/${instanceId}`,
		FINDINGS: (analysisId: string) => `/AiAnalysis/${analysisId}/findings`,
	},
} as const;
