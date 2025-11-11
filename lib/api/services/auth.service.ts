import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResult } from '@/lib/types/api';
import {
	LoginDto,
	RegisterDto,
	AuthResponseDto,
	RefreshTokenDto,
	ChangePasswordDto,
} from '@/lib/types/auth';

export class AuthService {
	/**
	 * Login with username and password
	 */
	async login(credentials: LoginDto): Promise<ApiResult<AuthResponseDto>> {
		const result = await apiClient.post<AuthResponseDto>(API_ENDPOINTS.AUTH.LOGIN, credentials);

		// Save tokens if login successful
		if (result.isSuccess && result.data) {
			apiClient.saveToken(result.data.accessToken);
			apiClient.saveRefreshToken(result.data.refreshToken);

			// Save user data to localStorage
			if (typeof window !== 'undefined') {
				localStorage.setItem('user', JSON.stringify(result.data.user));
			}
		}

		return result;
	}

	/**
	 * Register a new user
	 */
	async register(userData: RegisterDto): Promise<ApiResult<AuthResponseDto>> {
		const result = await apiClient.post<AuthResponseDto>(API_ENDPOINTS.AUTH.REGISTER, userData);

		// Save tokens if registration successful
		if (result.isSuccess && result.data) {
			apiClient.saveToken(result.data.accessToken);
			apiClient.saveRefreshToken(result.data.refreshToken);

			// Save user data to localStorage
			if (typeof window !== 'undefined') {
				localStorage.setItem('user', JSON.stringify(result.data.user));
			}
		}

		return result;
	}

	/**
	 * Refresh access token
	 */
	async refreshToken(refreshToken: string): Promise<ApiResult<AuthResponseDto>> {
		const dto: RefreshTokenDto = { refreshToken };
		const result = await apiClient.post<AuthResponseDto>(API_ENDPOINTS.AUTH.REFRESH, dto);

		// Save new tokens if refresh successful
		if (result.isSuccess && result.data) {
			apiClient.saveToken(result.data.accessToken);
			apiClient.saveRefreshToken(result.data.refreshToken);
		}

		return result;
	}

	/**
	 * Logout user
	 */
	async logout(): Promise<void> {
		try {
			await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			// Clear tokens and user data regardless of API call result
			apiClient.clearTokens();
			if (typeof window !== 'undefined') {
				localStorage.removeItem('user');
			}
		}
	}

	/**
	 * Change password
	 */
	async changePassword(data: ChangePasswordDto): Promise<ApiResult<void>> {
		return apiClient.post<void>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
	}

	/**
	 * Get current user from localStorage
	 */
	getCurrentUser() {
		if (typeof window === 'undefined') return null;
		const userStr = localStorage.getItem('user');
		return userStr ? JSON.parse(userStr) : null;
	}

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated(): boolean {
		if (typeof window === 'undefined') return false;
		return !!localStorage.getItem('accessToken');
	}
}

// Export singleton instance
export const authService = new AuthService();
