import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { ApiResult } from '@/lib/types/api';
import {
	NotificationDto,
	NotificationListResponse,
	CreateNotificationDto,
} from '@/lib/types/notification';

export class NotificationService {
	private readonly baseUrl = `${API_CONFIG.BASE_URL}/notifications`;

	async getMyNotifications(
		pageNumber = 1,
		pageSize = 20
	): Promise<ApiResult<NotificationListResponse>> {
		return apiClient.get<NotificationListResponse>(
			`${this.baseUrl}/my-notifications?pageNumber=${pageNumber}&pageSize=${pageSize}`
		);
	}

	async getUnread(): Promise<ApiResult<NotificationDto[]>> {
		return apiClient.get<NotificationDto[]>(`${this.baseUrl}/unread`);
	}

	async getUnreadCount(): Promise<ApiResult<number>> {
		return apiClient.get<number>(`${this.baseUrl}/unread-count`);
	}

	async markAsRead(notificationId: string): Promise<ApiResult<void>> {
		return apiClient.put<void>(`${this.baseUrl}/${notificationId}/mark-read`, {});
	}

	async markAllAsRead(): Promise<ApiResult<void>> {
		return apiClient.put<void>(`${this.baseUrl}/mark-all-read`, {});
	}

	async create(dto: CreateNotificationDto): Promise<ApiResult<NotificationDto>> {
		return apiClient.post<NotificationDto>(this.baseUrl, dto);
	}
}

// Export singleton instance
export const notificationService = new NotificationService();
