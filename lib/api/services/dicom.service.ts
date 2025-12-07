import { apiClient, UploadDicomDto } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResult } from '@/lib/types/api';

export interface DicomInstanceDto {
	id: string;
	instanceId: string;
	studyId: string;
	seriesId: string;
	filename: string;
	uploadedAt: string;
	modality: string;
	bodyPart: string;
}

export class DicomService {
	async upload(data: UploadDicomDto): Promise<ApiResult<void>> {
		return apiClient.uploadFile<void>(API_ENDPOINTS.DICOM.UPLOAD, data);
	}

	async getById(id: string): Promise<ApiResult<Blob>> {
		return apiClient.getFile<Blob>(API_ENDPOINTS.DICOM.BY_ID(id));
	}

	async getByOrderId(orderId: string): Promise<ApiResult<DicomInstanceDto[]>> {
		return apiClient.get<DicomInstanceDto[]>(API_ENDPOINTS.DICOM.BY_ORDER(orderId));
	}

	async downloadInstance(instanceId: string): Promise<ApiResult<Blob>> {
		return apiClient.getFile<Blob>(API_ENDPOINTS.DICOM.DOWNLOAD(instanceId));
	}

	async getPreview(instanceId: string): Promise<ApiResult<Blob>> {
		return apiClient.getFile<Blob>(API_ENDPOINTS.DICOM.PREVIEW(instanceId));
	}
}

export type { UploadDicomDto };

// Export singleton instance
export const dicomService = new DicomService();
