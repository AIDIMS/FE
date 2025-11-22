export enum NotificationType {
	INFO = 'info',
	SUCCESS = 'success',
	WARNING = 'warning',
	ERROR = 'error',
}

export interface Notification {
	id: string;
	type: NotificationType;
	title: string;
	message: string;
	timestamp: Date;
	read: boolean;
	action?: {
		label: string;
		onClick: () => void;
	};
}

export interface NotificationDto {
	id: string;
	type: string;
	title: string;
	message: string;
	timestamp: string;
	read: boolean;
}
