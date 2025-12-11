import { apiClient } from '../client';
import type { ApiResult } from '@/lib/types/api';

export interface DiagnosisDto {
	id: string;
	studyId: string;
	finalDiagnosis: string;
	treatmentPlan?: string;
	notes?: string;
	reportStatus: 'Draft' | 'Finalized' | 'Approved';
	createdAt: string;
	updatedAt: string;
	studyDescription?: string;
	patientName?: string;
	doctorName?: string;
}

export interface CreateDiagnosisDto {
	studyId: string;
	finalDiagnosis: string;
	treatmentPlan?: string;
	notes?: string;
	reportStatus?: 'Draft' | 'Finalized' | 'Approved';
}

export interface UpdateDiagnosisDto {
	finalDiagnosis: string;
	treatmentPlan?: string;
	notes?: string;
	reportStatus: 'Draft' | 'Finalized' | 'Approved';
}

export class DiagnosisService {
	/**
	 * Create a new diagnosis
	 */
	async create(dto: CreateDiagnosisDto): Promise<ApiResult<DiagnosisDto>> {
		return apiClient.post<DiagnosisDto>('/Diagnoses', {
			...dto,
			reportStatus: dto.reportStatus || 'Draft',
		});
	}

	/**
	 * Get diagnosis by ID
	 */
	async getById(id: string): Promise<ApiResult<DiagnosisDto>> {
		return apiClient.get<DiagnosisDto>(`/Diagnoses/${id}`);
	}

	/**
	 * Get diagnosis by Study ID
	 */
	async getByStudyId(studyId: string): Promise<ApiResult<DiagnosisDto>> {
		return apiClient.get<DiagnosisDto>(`/Diagnoses/study/${studyId}`);
	}

	/**
	 * Update an existing diagnosis
	 */
	async update(id: string, dto: UpdateDiagnosisDto): Promise<ApiResult<DiagnosisDto>> {
		return apiClient.put<DiagnosisDto>(`/Diagnoses/${id}`, dto);
	}

	/**
	 * Delete a diagnosis
	 */
	async delete(id: string): Promise<ApiResult<void>> {
		return apiClient.delete(`/Diagnoses/${id}`);
	}

	/**
	 * Get all diagnoses with filters
	 */
	async getAll(params?: {
		studyId?: string;
		reportStatus?: string;
		patientId?: string;
		doctorId?: string;
		pageNumber?: number;
		pageSize?: number;
	}): Promise<
		ApiResult<{
			items: DiagnosisDto[];
			pageNumber: number;
			pageSize: number;
			totalCount: number;
		}>
	> {
		const queryParams = new URLSearchParams();
		if (params?.studyId) queryParams.append('studyId', params.studyId);
		if (params?.reportStatus) queryParams.append('reportStatus', params.reportStatus);
		if (params?.patientId) queryParams.append('patientId', params.patientId);
		if (params?.doctorId) queryParams.append('doctorId', params.doctorId);
		if (params?.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
		if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

		const queryString = queryParams.toString();
		return apiClient.get(`/Diagnoses${queryString ? `?${queryString}` : ''}`);
	}
}

export const diagnosisService = new DiagnosisService();
