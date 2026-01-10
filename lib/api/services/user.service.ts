import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResult, PaginatedResult } from '@/lib/types/api';
import {
	CreateUserDto,
	UpdateUserDto,
	UserListDto,
	UpdateUserByIdentifyDto,
} from '@/lib/types/user';

export class UserService {
	async getAll(
		pageNumber: number = 1,
		pageSize: number = 10,
		role?: number
	): Promise<ApiResult<PaginatedResult<UserListDto>>> {
		const params = new URLSearchParams({
			pageNumber: pageNumber.toString(),
			pageSize: pageSize.toString(),
		});

		if (role !== undefined) {
			params.append('role', role.toString());
		}

		return apiClient.get<PaginatedResult<UserListDto>>(
			`${API_ENDPOINTS.USERS.BASE}?${params.toString()}`
		);
	}

	async getById(id: string): Promise<ApiResult<UserListDto>> {
		return apiClient.get<UserListDto>(API_ENDPOINTS.USERS.BY_ID(id));
	}

	async create(userData: CreateUserDto): Promise<ApiResult<UserListDto>> {
		return apiClient.post<UserListDto>(API_ENDPOINTS.USERS.BASE, userData);
	}

	async update(id: string, userData: UpdateUserDto): Promise<ApiResult<UserListDto>> {
		return apiClient.put<UserListDto>(API_ENDPOINTS.USERS.BY_ID(id), userData);
	}

	async identifyAndUpdate(
		id: string,
		userData: UpdateUserByIdentifyDto
	): Promise<ApiResult<UserListDto>> {
		return apiClient.put<UserListDto>(API_ENDPOINTS.USERS.IDENTIFY(id), userData);
	}

	async delete(id: string): Promise<ApiResult<void>> {
		return apiClient.delete<void>(API_ENDPOINTS.USERS.BY_ID(id));
	}
}

// Export singleton instance
export const userService = new UserService();
