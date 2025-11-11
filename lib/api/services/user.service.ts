import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResult, PaginatedResult } from '@/lib/types/api';
import { CreateUserDto, UpdateUserDto, UserListDto } from '@/lib/types/user';

export class UserService {
	/**
	 * Get all users with pagination
	 */
	async getAll(
		pageNumber: number = 1,
		pageSize: number = 10
	): Promise<ApiResult<PaginatedResult<UserListDto>>> {
		return apiClient.get<PaginatedResult<UserListDto>>(
			`${API_ENDPOINTS.USERS.BASE}?pageNumber=${pageNumber}&pageSize=${pageSize}`
		);
	}

	/**
	 * Get user by ID
	 */
	async getById(id: string): Promise<ApiResult<UserListDto>> {
		return apiClient.get<UserListDto>(API_ENDPOINTS.USERS.BY_ID(id));
	}

	/**
	 * Create a new user
	 */
	async create(userData: CreateUserDto): Promise<ApiResult<UserListDto>> {
		return apiClient.post<UserListDto>(API_ENDPOINTS.USERS.BASE, userData);
	}

	/**
	 * Update an existing user
	 */
	async update(id: string, userData: UpdateUserDto): Promise<ApiResult<UserListDto>> {
		return apiClient.put<UserListDto>(API_ENDPOINTS.USERS.BY_ID(id), userData);
	}

	/**
	 * Delete a user
	 */
	async delete(id: string): Promise<ApiResult<void>> {
		return apiClient.delete<void>(API_ENDPOINTS.USERS.BY_ID(id));
	}
}

// Export singleton instance
export const userService = new UserService();
