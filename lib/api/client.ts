import { API_CONFIG } from './config';
import { ApiResult, ApiError } from '../types/api';

export class ApiClient {
	private readonly baseURL: string;
	private readonly timeout: number;
	private isRefreshing = false;
	private readonly failedQueue: Array<{
		resolve: (value?: unknown) => void;
		reject: (reason?: unknown) => void;
	}> = [];

	constructor() {
		this.baseURL = API_CONFIG.BASE_URL || '';
		this.timeout = API_CONFIG.TIMEOUT;
	}

	private decodeToken(token: string): { exp: number } | null {
		try {
			const base64Url = token.split('.')[1];
			const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			const jsonPayload = decodeURIComponent(
				atob(base64)
					.split('')
					.map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
					.join('')
			);
			return JSON.parse(jsonPayload);
		} catch {
			return null;
		}
	}

	private isTokenExpired(token: string): boolean {
		const decoded = this.decodeToken(token);
		if (!decoded || !decoded.exp) {
			return true;
		}

		// Check if token will expire in the next 60 seconds (buffer time)
		const expirationTime = decoded.exp * 1000; // Convert to milliseconds
		const currentTime = Date.now();
		const bufferTime = 60 * 1000; // 60 seconds buffer

		return expirationTime - currentTime < bufferTime;
	}

	private getAuthHeader(): HeadersInit {
		const token = this.getToken();
		if (token) {
			return {
				Authorization: `Bearer ${token}`,
			};
		}
		return {};
	}

	private getToken(): string | null {
		if (globalThis.window === undefined) return null;
		return localStorage.getItem('accessToken');
	}

	public saveToken(token: string): void {
		if (globalThis.window === undefined) return;
		localStorage.setItem('accessToken', token);

		// Also save to cookie for middleware
		document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Strict`;
	}

	public clearTokens(): void {
		if (globalThis.window === undefined) return;
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');

		// Clear cookies
		document.cookie = 'accessToken=; path=/; max-age=0';
		document.cookie = 'refreshToken=; path=/; max-age=0';
	}

	private processQueue(error: Error | null, token: string | null = null): void {
		for (const prom of this.failedQueue) {
			if (error) {
				prom.reject(error);
			} else {
				prom.resolve(token);
			}
		}

		this.failedQueue.length = 0;
	}

	private async handleRefreshToken(): Promise<string> {
		try {
			// Refresh token is now sent via cookie, so no need to send in body
			const response = await fetch(`${this.baseURL}/Auth/refresh-token`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include', // Important: send cookies
				body: JSON.stringify({}),
			});

			if (!response.ok) {
				throw new Error('Failed to refresh token');
			}

			const result = await response.json();

			if (result.isSuccess && result.data) {
				this.saveToken(result.data.accessToken);

				// Update user data if available
				if (result.data.user && globalThis.window !== undefined) {
					localStorage.setItem('user', JSON.stringify(result.data.user));
				}

				return result.data.accessToken;
			}

			throw new Error('Invalid refresh token response');
		} catch (error) {
			// Clear tokens and redirect to login
			this.clearTokens();
			if (globalThis.window !== undefined) {
				localStorage.removeItem('user');
				globalThis.window.location.href = '/auth/login?session=expired';
			}
			throw error;
		}
	}

	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResult<T>> {
		const url = `${this.baseURL}${endpoint}`;

		// Check if token is expired before making request
		const token = this.getToken();
		if (token && this.isTokenExpired(token)) {
			// Token is expired or about to expire, refresh it first
			if (this.isRefreshing) {
				// Wait for ongoing refresh
				await new Promise((resolve, reject) => {
					this.failedQueue.push({ resolve, reject });
				});
			} else {
				// Start refresh process
				this.isRefreshing = true;
				try {
					const newToken = await this.handleRefreshToken();
					this.processQueue(null, newToken);
				} catch (refreshError) {
					this.processQueue(refreshError as Error, null);
					throw refreshError;
				} finally {
					this.isRefreshing = false;
				}
			}
		}

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
				credentials: 'include', // Always include cookies for refresh token
			});

			clearTimeout(timeoutId);

			// Check if response has content before parsing JSON
			const contentType = response.headers.get('content-type');
			const hasJsonContent = contentType?.includes('application/json');

			// Handle empty responses (204 No Content, etc.)
			let data: T | null = null;
			if (hasJsonContent) {
				const text = await response.text();
				data = text ? JSON.parse(text) : null;
			}

			if (!response.ok) {
				// Handle API error response
				const apiErrorData = data as unknown as { message?: string; errors?: string[] };
				const error: ApiError = {
					message: apiErrorData?.message || 'An error occurred',
					errors: apiErrorData?.errors,
					statusCode: response.status,
				};
				throw error;
			}

			return data as ApiResult<T>;
		} catch (error) {
			clearTimeout(timeoutId);

			if (error instanceof Error) {
				if (error.name === 'AbortError') {
					const timeoutError = new Error('Request timeout') as ApiError;
					timeoutError.statusCode = 408;
					throw timeoutError;
				}
			}

			throw error;
		}
	}

	public async get<T>(endpoint: string): Promise<ApiResult<T>> {
		return this.request<T>(endpoint, {
			method: 'GET',
		});
	}

	public async post<T>(endpoint: string, body?: unknown): Promise<ApiResult<T>> {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	public async put<T>(endpoint: string, body?: unknown): Promise<ApiResult<T>> {
		return this.request<T>(endpoint, {
			method: 'PUT',
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	public async delete<T>(endpoint: string): Promise<ApiResult<T>> {
		return this.request<T>(endpoint, {
			method: 'DELETE',
		});
	}

	public async patch<T>(endpoint: string, body?: unknown): Promise<ApiResult<T>> {
		return this.request<T>(endpoint, {
			method: 'PATCH',
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	public async uploadFile<T>(endpoint: string, data: UploadDicomDto): Promise<ApiResult<T>> {
		const url = `${this.baseURL}${endpoint}`;
		const token = this.getToken();

		if (!token) {
			return {
				isSuccess: false,
				message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập lại.',
				errors: ['Unauthorized'],
			};
		}

		const formData = new FormData();
		formData.append('file', data.file);
		formData.append('orderId', data.orderId);
		formData.append('patientId', data.patientId);

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					accept: 'text/plain',
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			if (!response.ok) {
				const errorText = await response.text();
				return {
					isSuccess: false,
					message: `Upload failed: ${response.status} ${response.statusText}`,
					errors: [errorText],
				};
			}

			return {
				isSuccess: true,
				message: 'Upload thành công',
			} as ApiResult<T>;
		} catch (error) {
			return {
				isSuccess: false,
				message: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi upload file',
				errors: [error instanceof Error ? error.message : 'Unknown error'],
			};
		}
	}

	public async getFile<T>(endpoint: string): Promise<ApiResult<T>> {
		const url = `${this.baseURL}${endpoint}`;
		const token = this.getToken();

		if (!token) {
			return {
				isSuccess: false,
				message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập lại.',
				errors: ['Unauthorized'],
			};
		}

		try {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				const errorText = await response.text();
				return {
					isSuccess: false,
					message: `Failed to get file: ${response.status} ${response.statusText}`,
					errors: [errorText],
				};
			}

			const blob = await response.blob();
			return {
				isSuccess: true,
				data: blob as T,
				message: 'Lấy file thành công',
			};
		} catch (error) {
			return {
				isSuccess: false,
				message: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi lấy file',
				errors: [error instanceof Error ? error.message : 'Unknown error'],
			};
		}
	}
}

// Export interface for upload
export interface UploadDicomDto {
	file: File;
	orderId: string;
	patientId: string;
}

// Export singleton instance
export const apiClient = new ApiClient();
