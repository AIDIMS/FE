export enum NotificationType {
	VisitCreated = 0,
	ImagingOrderAssigned = 1,
	AiAnalysisCompleted = 2,
	DiagnosisCompleted = 3,
	General = 4,
}

export interface Notification {
	id: string;
	userId: string;
	type: NotificationType;
	title: string;
	message: string;
	relatedStudyId?: string;
	relatedVisitId?: string;
	isRead: boolean;
	isSent: boolean;
	createdAt: string;
	updatedAt?: string;
}

export interface NotificationDto {
	id: string;
	userId: string;
	type: NotificationType;
	title: string;
	message: string;
	relatedStudyId?: string;
	relatedVisitId?: string;
	relatedStudyDescription?: string;
	relatedVisitPatientName?: string;
	isRead: boolean;
	isSent: boolean;
	createdAt: string;
	updatedAt?: string;
}

export interface CreateNotificationDto {
	userId: string;
	type: NotificationType;
	title: string;
	message: string;
	relatedStudyId?: string;
	relatedVisitId?: string;
}

export interface NotificationListResponse {
	items: NotificationDto[];
	pageNumber: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
}
