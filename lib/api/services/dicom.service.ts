import { API_CONFIG } from '../config';
import { API_ENDPOINTS } from '../config';
import { ApiResult } from '@/lib/types/api';
import { apiClient } from '../client';

export interface UploadDicomDto {
	file: File;
	orderId: string;
	patientId: string;
}

export class DicomService {
	/**
	 * Upload DICOM file to server
	 * @param data - Upload data containing file, orderId, and patientId
	 * @returns ApiResult with success status
	 */
	async upload(data: UploadDicomDto): Promise<ApiResult<void>> {
		try {
			// Get token from apiClient
			const token = this.getToken();
			if (!token) {
				return {
					isSuccess: false,
					message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập lại.',
					errors: ['Unauthorized'],
				};
			}

			// Create FormData
			const formData = new FormData();
			formData.append('file', data.file);
			formData.append('orderId', data.orderId);
			formData.append('patientId', data.patientId);

			// Build URL
			const baseURL = API_CONFIG.BASE_URL || 'http://localhost:5104/api';
			const url = `${baseURL}${API_ENDPOINTS.DICOM.UPLOAD}`;

			// Make request
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					accept: 'text/plain',
					Authorization: `Bearer ${token}`,
					// Don't set Content-Type, browser will set it automatically with boundary for FormData
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

			// Response is text/plain, not JSON
			return {
				isSuccess: true,
				message: 'Upload thành công',
			};
		} catch (error) {
			console.error('Error uploading DICOM file:', error);
			return {
				isSuccess: false,
				message: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi upload file',
				errors: [error instanceof Error ? error.message : 'Unknown error'],
			};
		}
	}

	/**
	 * Get DICOM file by ID
	 * @param id - DICOM file ID
	 * @returns ApiResult with DICOM file data
	 */
	async getById(id: string): Promise<ApiResult<Blob>> {
		try {
			const token = this.getToken();
			if (!token) {
				return {
					isSuccess: false,
					message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập lại.',
					errors: ['Unauthorized'],
				};
			}

			const baseURL = API_CONFIG.BASE_URL || 'http://localhost:5104/api';
			const url = `${baseURL}${API_ENDPOINTS.DICOM.BY_ID(id)}`;

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
					message: `Failed to get DICOM file: ${response.status} ${response.statusText}`,
					errors: [errorText],
				};
			}

			const blob = await response.blob();
			return {
				isSuccess: true,
				data: blob,
				message: 'Lấy file DICOM thành công',
			};
		} catch (error) {
			console.error('Error getting DICOM file:', error);
			return {
				isSuccess: false,
				message: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi lấy file',
				errors: [error instanceof Error ? error.message : 'Unknown error'],
			};
		}
	}

	/**
	 * Get token from localStorage (same as apiClient)
	 */
	private getToken(): string | null {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem('accessToken');
	}
}

// Export singleton instance
export const dicomService = new DicomService();
