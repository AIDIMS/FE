import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResult } from '@/lib/types/api';
import { LoginDto, AuthResponseDto, RefreshTokenDto, ChangePasswordDto } from '@/lib/types/auth';

export class AuthService {
	async login(credentials: LoginDto): Promise<ApiResult<AuthResponseDto>> {
		const result = await apiClient.post<AuthResponseDto>(API_ENDPOINTS.AUTH.LOGIN, credentials);

		// Save access token if login successful (refresh token is in cookie)
		if (result.isSuccess && result.data) {
			apiClient.saveToken(result.data.accessToken);

			// Save user data to localStorage
			if (globalThis.window !== undefined) {
				localStorage.setItem('user', JSON.stringify(result.data.user));
			}
		}

		return result;
	}

	async refreshToken(refreshToken: string): Promise<ApiResult<AuthResponseDto>> {
		const dto: RefreshTokenDto = { refreshToken };

		// Direct fetch to avoid interceptor loop
		const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5104/api'}${API_ENDPOINTS.AUTH.REFRESH}`;

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include', // Send cookies
				body: JSON.stringify(dto),
			});

			const result = await response.json();

			// Save new tokens if refresh successful
			if (result.isSuccess && result.data) {
				apiClient.saveToken(result.data.accessToken);

				// Update user data
				if (globalThis.window !== undefined && result.data.user) {
					localStorage.setItem('user', JSON.stringify(result.data.user));
				}
			}

			return result;
		} catch (error) {
			console.error('Refresh token error:', error);
			throw error;
		}
	}

	async logout(): Promise<void> {
		try {
			// Call logout endpoint to revoke refresh tokens
			await apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT, {});
		} catch (error) {
			console.error('Logout API error:', error);
		} finally {
			// Clear tokens and user data regardless of API call result
			apiClient.clearTokens();
			if (globalThis.window !== undefined) {
				localStorage.removeItem('user');
			}
		}
	}

	async changePassword(data: ChangePasswordDto): Promise<ApiResult<void>> {
		return apiClient.post<void>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
	}

	getCurrentUser() {
		if (globalThis.window === undefined) return null;
		const userStr = localStorage.getItem('user');
		return userStr ? JSON.parse(userStr) : null;
	}

	isAuthenticated(): boolean {
		if (globalThis.window === undefined) return false;
		return !!localStorage.getItem('accessToken');
	}
}

// Export singleton instance
export const authService = new AuthService();
