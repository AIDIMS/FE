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
		pageSize: number = 10
	): Promise<ApiResult<PaginatedResult<ImagingOrder>>> {
		return apiClient.get<PaginatedResult<ImagingOrder>>(
			`${API_ENDPOINTS.IMAGING_ORDERS.BASE}?pageNumber=${pageNumber}&pageSize=${pageSize}`
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
		return apiClient.get<PaginatedResult<ImagingOrder>>(
			`${API_ENDPOINTS.IMAGING_ORDERS.BY_VISIT(visitId)}?pageNumber=${pageNumber}&pageSize=${pageSize}`
		);
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
		return apiClient.patch<ImagingOrder>(API_ENDPOINTS.IMAGING_ORDERS.UPDATE_STATUS(id), {
			status,
		});
	}
}

// Export singleton instance
export const imagingOrderService = new ImagingOrderService();
