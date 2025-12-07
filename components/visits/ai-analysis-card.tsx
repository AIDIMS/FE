'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { AiAnalysis, AiFinding, aiAnalysisService } from '@/lib/api/services/ai-analysis.service';

interface AiAnalysisCardProps {
	instanceId: string;
	selectedFinding?: AiFinding | null;
	onFindingSelect?: (finding: AiFinding | null) => void;
}

export function AiAnalysisCard({
	instanceId,
	selectedFinding: externalSelectedFinding,
	onFindingSelect,
}: AiAnalysisCardProps) {
	const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedFinding, setSelectedFinding] = useState<AiFinding | null>(null);

	// Sync external selected finding with internal state
	useEffect(() => {
		setSelectedFinding(externalSelectedFinding || null);
	}, [externalSelectedFinding]);

	useEffect(() => {
		loadAnalysis();
	}, [instanceId]);

	const loadAnalysis = async () => {
		setIsLoading(true);
		try {
			// Call real API to get AI analysis
			const result = await aiAnalysisService.getByInstanceId(instanceId);
			if (result.isSuccess && result.data) {
				setAnalysis(result.data);
			} else {
				console.warn('No AI analysis found for instance:', instanceId);
			}
		} catch (error) {
			console.error('Error loading AI analysis:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleFindingClick = (finding: AiFinding) => {
		const newSelected = selectedFinding?.id === finding.id ? null : finding;
		setSelectedFinding(newSelected);
		onFindingSelect?.(newSelected);
	};

	const getSeverityColor = (severity: string = '') => {
		const colors: { [key: string]: string } = {
			high: 'bg-red-100 text-red-800 border-red-200',
			medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
			low: 'bg-green-100 text-green-800 border-green-200',
			normal: 'bg-blue-100 text-blue-800 border-blue-200',
		};
		return colors[severity.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
	};

	const getConfidenceColor = (confidence: number) => {
		if (confidence >= 0.8) return 'text-green-600';
		if (confidence >= 0.6) return 'text-yellow-600';
		return 'text-red-600';
	};

	if (isLoading) {
		return (
			<Card className="border border-slate-200 bg-white shadow-sm">
				<CardHeader className="pb-4 border-b border-slate-200">
					<div className="flex items-center gap-2">
						<Brain className="h-4 w-4 text-purple-600" />
						<CardTitle className="text-sm font-semibold text-slate-900">AI Analysis</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="p-6">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
						<p className="text-sm text-slate-500 mt-2">Đang tải phân tích AI...</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!analysis) {
		return (
			<Card className="border border-slate-200 bg-white shadow-sm">
				<CardHeader className="pb-4 border-b border-slate-200">
					<div className="flex items-center gap-2">
						<Brain className="h-4 w-4 text-purple-600" />
						<CardTitle className="text-sm font-semibold text-slate-900">AI Analysis</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="p-6">
					<div className="text-center py-8 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
						<Clock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
						<p className="text-sm text-slate-500 mb-2">Chưa có phân tích AI</p>
						<p className="text-xs text-slate-400">
							Phân tích AI sẽ xuất hiện sau khi xử lý hoàn tất
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border border-slate-200 bg-white shadow-sm">
			<CardHeader className="pb-4 border-b border-slate-200">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Brain className="h-4 w-4 text-purple-600" />
						<CardTitle className="text-sm font-semibold text-slate-900">AI Analysis</CardTitle>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="secondary" className="text-xs">
							{analysis.findings.length} findings
						</Badge>
						<span
							className={`text-xs font-medium ${getConfidenceColor(analysis.overallConfidence)}`}
						>
							{Math.round(analysis.overallConfidence * 100)}% confidence
						</span>
					</div>
				</div>
			</CardHeader>
			<CardContent className="p-6">
				{analysis.findings.length === 0 ? (
					<div className="text-center py-6 px-4 bg-green-50 rounded-lg border border-green-200">
						<CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
						<p className="text-sm text-green-800 font-medium mb-1">Không phát hiện bất thường</p>
						<p className="text-xs text-green-600">
							AI không tìm thấy dấu hiệu bệnh lý trong ảnh này
						</p>
					</div>
				) : (
					<div className="space-y-3">
						<div className="text-xs text-slate-600 mb-3">
							Click vào finding để xem vị trí trên ảnh
						</div>
						{analysis.findings.map(finding => (
							<div
								key={finding.id}
								onClick={() => handleFindingClick(finding)}
								className={`
									p-4 rounded-lg border cursor-pointer transition-all
									${
										selectedFinding?.id === finding.id
											? 'border-purple-300 bg-purple-50'
											: 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
									}
								`}
							>
								<div className="flex items-start justify-between mb-2">
									<div className="flex items-center gap-2">
										<AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
										<div>
											<p className="text-sm font-semibold text-slate-900">{finding.label}</p>
											{finding.description && (
												<p className="text-xs text-slate-600 mt-1">{finding.description}</p>
											)}
										</div>
									</div>
									<div className="flex flex-col items-end gap-1">
										<span
											className={`text-xs font-medium ${getConfidenceColor(finding.confidenceScore)}`}
										>
											{Math.round(finding.confidenceScore * 100)}%
										</span>
										{finding.severity && (
											<Badge
												variant="secondary"
												className={`text-xs ${getSeverityColor(finding.severity)}`}
											>
												{finding.severity}
											</Badge>
										)}
									</div>
								</div>
								{(finding.boundingBox ||
									(finding.xMin !== undefined && finding.yMin !== undefined)) && (
									<div className="text-xs text-slate-500">
										{finding.boundingBox ? (
											<>
												Position: ({finding.boundingBox.x}, {finding.boundingBox.y}) Size:{' '}
												{finding.boundingBox.width}×{finding.boundingBox.height}
											</>
										) : (
											<>
												Bbox: ({finding.xMin?.toFixed(2)}, {finding.yMin?.toFixed(2)}) - (
												{finding.xMax?.toFixed(2)}, {finding.yMax?.toFixed(2)})
											</>
										)}
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
