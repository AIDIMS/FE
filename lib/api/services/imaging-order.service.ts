import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResult, PaginatedResult } from '@/lib/types/api';
import { ImagingOrder } from '@/lib/types/patient';

export interface CreateImagingOrderDto {
	visitId: string;
	requestingDoctorId: string;
	modalityRequested: string;
	bodyPartRequested: string;
	reasonForStudy?: string | null;
}

export interface UpdateImagingOrderDto {
	modalityRequested?: string;
	bodyPartRequested?: string;
	reasonForStudy?: string | null;
	status?: string;
}

export class ImagingOrderService {
	async getAll(
		pageNumber: number = 1,
		pageSize: number = 10,
		visitId?: string,
		patientId?: string,
		requestingDoctorId?: string,
		modality?: string,
		bodyPart?: string,
		status?: string,
		fromDate?: string,
		toDate?: string
	): Promise<ApiResult<PaginatedResult<ImagingOrder>>> {
		const params = new URLSearchParams({
			pageNumber: pageNumber.toString(),
			pageSize: pageSize.toString(),
		});

		if (visitId) params.append('visitId', visitId);
		if (patientId) params.append('patientId', patientId);
		if (requestingDoctorId) params.append('requestingDoctorId', requestingDoctorId);
		if (modality) params.append('modality', modality);
		if (bodyPart) params.append('bodyPart', bodyPart);
		if (status) params.append('status', status);
		if (fromDate) params.append('fromDate', fromDate);
		if (toDate) params.append('toDate', toDate);

		return apiClient.get<PaginatedResult<ImagingOrder>>(
			`${API_ENDPOINTS.IMAGING_ORDERS.BASE}?${params.toString()}`
		);
	}

	async getById(id: string): Promise<ApiResult<ImagingOrder>> {
		return apiClient.get<ImagingOrder>(API_ENDPOINTS.IMAGING_ORDERS.BY_ID(id));
	}

	async getByVisitId(
		visitId: string,
		pageNumber: number = 1,
		pageSize: number = 10
	): Promise<ApiResult<PaginatedResult<ImagingOrder>>> {
		return this.getAll(pageNumber, pageSize, visitId);
	}

	async create(orderData: CreateImagingOrderDto): Promise<ApiResult<ImagingOrder>> {
		return apiClient.post<ImagingOrder>(API_ENDPOINTS.IMAGING_ORDERS.BASE, orderData);
	}

	async update(id: string, orderData: UpdateImagingOrderDto): Promise<ApiResult<ImagingOrder>> {
		return apiClient.put<ImagingOrder>(API_ENDPOINTS.IMAGING_ORDERS.BY_ID(id), orderData);
	}

	async delete(id: string): Promise<ApiResult<void>> {
		return apiClient.delete<void>(API_ENDPOINTS.IMAGING_ORDERS.BY_ID(id));
	}

	async updateStatus(id: string, status: string): Promise<ApiResult<ImagingOrder>> {
		return apiClient.patch<ImagingOrder>(API_ENDPOINTS.IMAGING_ORDERS.BY_ID(id), {
			status,
		});
	}
}

// Export singleton instance
export const imagingOrderService = new ImagingOrderService();
