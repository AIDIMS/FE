import { API_CONFIG } from './config';
import { ApiResult, ApiError } from '../types/api';

export class ApiClient {
	private readonly baseURL: string;
	private readonly timeout: number;

	constructor() {
		this.baseURL = API_CONFIG.BASE_URL;
		this.timeout = API_CONFIG.TIMEOUT;
	}

	/**
	 * Get authorization header with token
	 */
	private getAuthHeader(): HeadersInit {
		const token = this.getToken();
		if (token) {
			return {
				Authorization: `Bearer ${token}`,
			};
		}
		return {};
	}

	/**
	 * Get token from localStorage
	 */
	private getToken(): string | null {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem('accessToken');
	}

	/**
	 * Save token to localStorage and cookie
	 */
	public saveToken(token: string): void {
		if (typeof globalThis.window === 'undefined') return;
		localStorage.setItem('accessToken', token);

		// Also save to cookie for middleware
		document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Strict`;
	}

	/**
	 * Save refresh token to localStorage
	 */
	public saveRefreshToken(token: string): void {
		if (typeof globalThis.window === 'undefined') return;
		localStorage.setItem('refreshToken', token);
	}

	/**
	 * Remove tokens from localStorage and cookie
	 */
	public clearTokens(): void {
		if (typeof globalThis.window === 'undefined') return;
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');

		// Clear cookie
		document.cookie = 'accessToken=; path=/; max-age=0';
	}

	/**
	 * Make a request to the API
	 */
	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResult<T>> {
		const url = `${this.baseURL}${endpoint}`;

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.timeout);

		try {
			const headers: HeadersInit = {
				'Content-Type': 'application/json',
				...this.getAuthHeader(),
				...options.headers,
			};

			const response = await fetch(url, {
				...options,
				headers,
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			const data = await response.json();

			if (!response.ok) {
				// Handle API error response
				const error: ApiError = {
					message: data.message || 'An error occurred',
					errors: data.errors,
					statusCode: response.status,
				};
				throw error;
			}

			return data as ApiResult<T>;
		} catch (error) {
			clearTimeout(timeoutId);

			if (error instanceof Error) {
				if (error.name === 'AbortError') {
					throw {
						message: 'Request timeout',
						statusCode: 408,
					} as ApiError;
				}
			}

			throw error;
		}
	}

	/**
	 * GET request
	 */
	public async get<T>(endpoint: string): Promise<ApiResult<T>> {
		return this.request<T>(endpoint, {
			method: 'GET',
		});
	}

	/**
	 * POST request
	 */
	public async post<T>(endpoint: string, body?: unknown): Promise<ApiResult<T>> {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	/**
	 * PUT request
	 */
	public async put<T>(endpoint: string, body?: unknown): Promise<ApiResult<T>> {
		return this.request<T>(endpoint, {
			method: 'PUT',
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	/**
	 * DELETE request
	 */
	public async delete<T>(endpoint: string): Promise<ApiResult<T>> {
		return this.request<T>(endpoint, {
			method: 'DELETE',
		});
	}

	/**
	 * PATCH request
	 */
	public async patch<T>(endpoint: string, body?: unknown): Promise<ApiResult<T>> {
		return this.request<T>(endpoint, {
			method: 'PATCH',
			body: body ? JSON.stringify(body) : undefined,
		});
	}
}

// Export singleton instance
export const apiClient = new ApiClient();
