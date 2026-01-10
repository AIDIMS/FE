import { apiClient } from '../client';
import { ApiResult } from '@/lib/types/api';
import type {
	DashboardData,
	DashboardStatistics,
	DepartmentStatistics,
	WeeklyActivity,
} from '@/lib/types/dashboard';

export class DashboardService {
	private readonly baseUrl = '/Dashboard';

	async getAll(
		includeStatistics = true,
		includeDepartments = true,
		includeWeeklyActivity = true
	): Promise<ApiResult<DashboardData>> {
		return apiClient.get<DashboardData>(
			`${this.baseUrl}?includeStatistics=${includeStatistics}&includeDepartments=${includeDepartments}&includeWeeklyActivity=${includeWeeklyActivity}`
		);
	}

	async getStatistics(): Promise<ApiResult<DashboardStatistics>> {
		return apiClient.get<DashboardStatistics>(`${this.baseUrl}/statistics`);
	}

	async getDepartmentStatistics(): Promise<ApiResult<DepartmentStatistics>> {
		return apiClient.get<DepartmentStatistics>(`${this.baseUrl}/department-statistics`);
	}

	async getWeeklyActivity(weekOffset = 0): Promise<ApiResult<WeeklyActivity>> {
		return apiClient.get<WeeklyActivity>(
			`${this.baseUrl}/weekly-activity?weekOffset=${weekOffset}`
		);
	}
}

export const dashboardService = new DashboardService();
