import { apiClient, UploadDicomDto } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResult } from '@/lib/types/api';

export class DicomService {
	async upload(data: UploadDicomDto): Promise<ApiResult<void>> {
		return apiClient.uploadFile<void>(API_ENDPOINTS.DICOM.UPLOAD, data);
	}

	async getById(id: string): Promise<ApiResult<Blob>> {
		return apiClient.getFile<Blob>(API_ENDPOINTS.DICOM.BY_ID(id));
	}
}

export type { UploadDicomDto };

// Export singleton instance
export const dicomService = new DicomService();
