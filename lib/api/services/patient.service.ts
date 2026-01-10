import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResult, PaginatedResult } from '@/lib/types/api';
import { CreatePatientDto, UpdatePatientDto, Patient } from '@/lib/types/patient';

export class PatientService {
	async getAll(
		pageNumber: number = 1,
		pageSize: number = 10,
		fullName?: string,
		phoneNumber?: string
	): Promise<ApiResult<PaginatedResult<Patient>>> {
		const params = new URLSearchParams({
			pageNumber: pageNumber.toString(),
			pageSize: pageSize.toString(),
		});

		if (fullName) {
			params.append('fullName', fullName);
		}
		if (phoneNumber) {
			params.append('phoneNumber', phoneNumber);
		}

		return apiClient.get<PaginatedResult<Patient>>(
			`${API_ENDPOINTS.PATIENTS.BASE}?${params.toString()}`
		);
	}

	async getById(id: string): Promise<ApiResult<Patient>> {
		return apiClient.get<Patient>(API_ENDPOINTS.PATIENTS.BY_ID(id));
	}

	async create(patientData: CreatePatientDto): Promise<ApiResult<Patient>> {
		return apiClient.post<Patient>(API_ENDPOINTS.PATIENTS.BASE, patientData);
	}

	async update(id: string, patientData: UpdatePatientDto): Promise<ApiResult<Patient>> {
		return apiClient.put<Patient>(API_ENDPOINTS.PATIENTS.BY_ID(id), patientData);
	}

	async delete(id: string): Promise<ApiResult<void>> {
		return apiClient.delete<void>(API_ENDPOINTS.PATIENTS.BY_ID(id));
	}
}

// Export singleton instance
export const patientService = new PatientService();
