export interface AiFindingDto {
	id: string;
	classification: string;
	confidence: number;
	boundingBoxX: number;
	boundingBoxY: number;
	boundingBoxWidth: number;
	boundingBoxHeight: number;
	description?: string;
	severity?: string;
}

export interface AiAnalysisResponseDto {
	id: string;
	studyId: string;
	status: string;
	analysisDate: string;
	findings: AiFindingDto[];
	accuracy?: number;
	analysisModel?: string;
	processingTime?: number;
}
