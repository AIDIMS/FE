import { apiClient } from '../client';

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
	createdBy?: string;
}

export class ImageAnnotationService {
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
