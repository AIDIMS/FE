import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResult } from '@/lib/types/api';

export interface AiFinding {
	id: string;
	label: string; // Changed from findingType to label
	confidenceScore: number; // Changed from confidence to confidenceScore
	// Backend format: XMin, YMin, XMax, YMax
	xMin?: number;
	yMin?: number;
	xMax?: number;
	yMax?: number;
	// Legacy format support
	boundingBox?: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	description?: string;
	severity?: string;
}

export interface AiAnalysis {
	id: string;
	instanceId: string;
	analysisDate: string;
	status: string;
	overallConfidence: number;
	findings: AiFinding[];
}

export class AiAnalysisService {
	async getByInstanceId(instanceId: string): Promise<ApiResult<AiAnalysis>> {
		return apiClient.get<AiAnalysis>(API_ENDPOINTS.AI_ANALYSIS.BY_INSTANCE(instanceId));
	}

	async getFindings(analysisId: string): Promise<ApiResult<AiFinding[]>> {
		return apiClient.get<AiFinding[]>(API_ENDPOINTS.AI_ANALYSIS.FINDINGS(analysisId));
	}
}

export const aiAnalysisService = new AiAnalysisService();
