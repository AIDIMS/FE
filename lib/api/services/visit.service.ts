import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResult, PaginatedResult } from '@/lib/types/api';
import { PatientVisit } from '@/lib/types/patient';

export interface CreateVisitDto {
	patientId: string;
	assignedDoctorId?: string | null;
	symptoms?: string | null;
}

export interface UpdateVisitDto {
	assignedDoctorId?: string | null;
	symptoms?: string | null;
	status?: string;
}

export class VisitService {
	async getAll(
		pageNumber: number = 1,
		pageSize: number = 10
	): Promise<ApiResult<PaginatedResult<PatientVisit>>> {
		return apiClient.get<PaginatedResult<PatientVisit>>(
			`${API_ENDPOINTS.VISITS.BASE}?pageNumber=${pageNumber}&pageSize=${pageSize}`
		);
	}

	async getById(id: string): Promise<ApiResult<PatientVisit>> {
		return apiClient.get<PatientVisit>(API_ENDPOINTS.VISITS.BY_ID(id));
	}

	async getByPatientId(
		patientId: string,
		pageNumber: number = 1,
		pageSize: number = 10
	): Promise<ApiResult<PaginatedResult<PatientVisit>>> {
		return apiClient.get<PaginatedResult<PatientVisit>>(
			`${API_ENDPOINTS.VISITS.BY_PATIENT(patientId)}?pageNumber=${pageNumber}&pageSize=${pageSize}`
		);
	}

	async getByDoctorId(
		doctorId: string,
		pageNumber: number = 1,
		pageSize: number = 10
	): Promise<ApiResult<PaginatedResult<PatientVisit>>> {
		return apiClient.get<PaginatedResult<PatientVisit>>(
			`${API_ENDPOINTS.VISITS.BASE}?assignedDoctorId=${doctorId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
		);
	}

	async create(visitData: CreateVisitDto): Promise<ApiResult<PatientVisit>> {
		return apiClient.post<PatientVisit>(API_ENDPOINTS.VISITS.BASE, visitData);
	}

	async update(id: string, visitData: UpdateVisitDto): Promise<ApiResult<PatientVisit>> {
		return apiClient.put<PatientVisit>(API_ENDPOINTS.VISITS.BY_ID(id), visitData);
	}

	async delete(id: string): Promise<ApiResult<void>> {
		return apiClient.delete<void>(API_ENDPOINTS.VISITS.BY_ID(id));
	}

	async updateStatus(id: string, status: string): Promise<ApiResult<PatientVisit>> {
		return apiClient.patch<PatientVisit>(API_ENDPOINTS.VISITS.UPDATE_STATUS(id), { status });
	}
}

// Export singleton instance
export const visitService = new VisitService();
