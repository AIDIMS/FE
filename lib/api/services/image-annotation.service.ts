import { apiClient } from '../client';
import { ApiResult, PaginatedResult } from '@/lib/types';

export interface CreateImageAnnotationDto {
	instanceId: string; // OrthancInstanceId or SopInstanceUid
	annotationType: string;
	annotationData: string;
}

export interface ImageAnnotationDto {
	id: string;
	instanceId: string;
	annotationType: string;
	annotationData: string;
	createdAt: string;
	updatedAt: string;
	createdBy?: string;
	instanceSopInstanceUid?: string;
}

export interface AnnotationData {
	xMin: number;
	yMin: number;
	xMax: number;
	yMax: number;
	label: string;
	confidence: number;
}

export class ImageAnnotationService {
	/**
	 * Get all annotations with pagination
	 */
	async getAll(
		pageNumber: number = 1,
		pageSize: number = 10
	): Promise<ApiResult<PaginatedResult<ImageAnnotationDto>>> {
		const response = await apiClient.get<PaginatedResult<ImageAnnotationDto>>(
			`/ImageAnnotations?PageNumber=${pageNumber}&PageSize=${pageSize}`
		);
		return response;
	}

	/**
	 * Create a new image annotation (label or bounding box)
	 */
	async create(dto: CreateImageAnnotationDto): Promise<ImageAnnotationDto> {
		const response = await apiClient.post<ImageAnnotationDto>('/ImageAnnotations', dto);
		if (!response?.data) {
			throw new Error('Failed to create annotation: No data in response');
		}
		return response.data;
	}

	/**
	 * Get annotations by instance ID
	 */
	async getByInstanceId(instanceId: string): Promise<ImageAnnotationDto[]> {
		const response = await apiClient.get<ImageAnnotationDto[]>(
			`/ImageAnnotations/instance/${instanceId}`
		);
		if (!response?.data) {
			throw new Error('Failed to get annotations: No data in response');
		}
		return response.data;
	}

	/**
	 * Update an existing annotation
	 */
	async update(id: string, dto: Partial<CreateImageAnnotationDto>): Promise<ImageAnnotationDto> {
		const response = await apiClient.put<ImageAnnotationDto>(`/ImageAnnotations/${id}`, dto);
		if (!response?.data) {
			throw new Error('Failed to update annotation: No data in response');
		}
		return response.data;
	}

	/**
	 * Delete an annotation
	 */
	async delete(id: string): Promise<void> {
		await apiClient.delete(`/ImageAnnotations/${id}`);
	}
}

export const imageAnnotationService = new ImageAnnotationService();
