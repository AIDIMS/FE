'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, FileImage, Calendar, Clock } from 'lucide-react';
import { DicomInstanceDto, dicomService } from '@/lib/api/services/dicom.service';
import { AiAnalysis, aiAnalysisService } from '@/lib/api/services/ai-analysis.service';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import dynamic from 'next/dynamic';

const DicomViewer = dynamic(() => import('@/components/technician/dicom-viewer'), {
	ssr: false,
	loading: () => <p>Loading Viewer...</p>,
});

interface DicomFilesCardProps {
	orderId: string;
}

export function DicomFilesCard({ orderId }: DicomFilesCardProps) {
	const [dicomFiles, setDicomFiles] = useState<DicomInstanceDto[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [viewerOpen, setViewerOpen] = useState(false);
	const [viewerAiAnalysis, setViewerAiAnalysis] = useState<AiAnalysis | null>(null);
	const [viewerInstanceId, setViewerInstanceId] = useState<string | null>(null);

	const loadDicomFiles = useCallback(async () => {
		setIsLoading(true);
		try {
			const result = await dicomService.getByOrderId(orderId);
			if (result.isSuccess && result.data) {
				setDicomFiles(result.data);
			}
		} catch (error) {
			console.error('Error loading DICOM files:', error);
		} finally {
			setIsLoading(false);
		}
	}, [orderId]);

	useEffect(() => {
		loadDicomFiles();
	}, [loadDicomFiles]);

	const handleViewFile = async (instance: DicomInstanceDto) => {
		try {
			// Load DICOM file
			const result = await dicomService.downloadInstance(instance.instanceId);
			if (result.isSuccess && result.data) {
				const file = new File([result.data], instance.filename, {
					type: 'application/dicom',
				});
				setSelectedFile(file);
				setViewerInstanceId(instance.instanceId);

				// Load AI analysis
				try {
					const aiResult = await aiAnalysisService.getByInstanceId(instance.instanceId);
					if (aiResult.isSuccess && aiResult.data) {
						setViewerAiAnalysis(aiResult.data);
					} else {
						setViewerAiAnalysis(null);
					}
				} catch (aiError) {
					console.warn('No AI analysis available:', aiError);
					setViewerAiAnalysis(null);
				}

				setViewerOpen(true);
			}
		} catch (error) {
			console.error('Error downloading DICOM file:', error);
			alert('Không thể tải file DICOM');
		}
	};

	const handleDownloadFile = async (instance: DicomInstanceDto) => {
		try {
			const result = await dicomService.downloadInstance(instance.instanceId);
			if (result.isSuccess && result.data) {
				const url = URL.createObjectURL(result.data);
				const a = document.createElement('a');
				a.href = url;
				a.download = instance.filename;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}
		} catch (error) {
			console.error('Error downloading DICOM file:', error);
			alert('Không thể tải xuống file');
		}
	};

	const getModalityColor = (modality: string) => {
		const colors: { [key: string]: string } = {
			XRay: 'bg-blue-100 text-blue-800',
			CT: 'bg-green-100 text-green-800',
			MRI: 'bg-purple-100 text-purple-800',
			Ultrasound: 'bg-yellow-100 text-yellow-800',
			Mammography: 'bg-pink-100 text-pink-800',
			Fluoroscopy: 'bg-orange-100 text-orange-800',
			Nuclear: 'bg-red-100 text-red-800',
		};
		return colors[modality] || 'bg-gray-100 text-gray-800';
	};

	const getDisplayFileName = (filename: string, index: number) => {
		// If filename is too long or looks like an ID, create a friendly name
		if (filename.length > 30 || filename.includes('-')) {
			return `Image ${index + 1}`;
		}
		return filename;
	};

	if (isLoading) {
		return (
			<Card className="border border-slate-200 bg-white shadow-sm">
				<CardHeader className="pb-4 border-b border-slate-200">
					<div className="flex items-center gap-2">
						<FileImage className="h-4 w-4 text-blue-600" />
						<CardTitle className="text-sm font-semibold text-slate-900">Hình ảnh DICOM</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="p-6">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
						<p className="text-sm text-slate-500 mt-2">Đang tải...</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			{viewerOpen && selectedFile && viewerInstanceId && (
				<DicomViewer
					file={selectedFile}
					aiAnalysis={viewerAiAnalysis}
					instanceId={viewerInstanceId}
					onClose={() => {
						setViewerOpen(false);
						setViewerAiAnalysis(null);
						setViewerInstanceId(null);
					}}
				/>
			)}{' '}
			<Card className="border border-slate-200 bg-white shadow-sm">
				<CardHeader className="pb-4 border-b border-slate-200">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<FileImage className="h-4 w-4 text-blue-600" />
							<CardTitle className="text-sm font-semibold text-slate-900">Hình ảnh DICOM</CardTitle>
						</div>
						<Badge variant="secondary" className="text-xs">
							{dicomFiles.length} files
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="p-6">
					{dicomFiles.length === 0 ? (
						<div className="text-center py-8 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
							<FileImage className="h-10 w-10 text-slate-300 mx-auto mb-3" />
							<p className="text-sm text-slate-500 mb-2">Chưa có hình ảnh DICOM</p>
							<p className="text-xs text-slate-400">
								Hình ảnh sẽ xuất hiện sau khi kỹ thuật viên hoàn thành chụp chiếu
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{dicomFiles.map((instance, index) => (
								<div
									key={instance.id}
									className="rounded-lg p-4 border border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 transition-all"
								>
									<div className="flex items-start justify-between">
										<div className="flex items-start gap-3 flex-1">
											<div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
												<FileImage className="h-5 w-5 text-blue-600" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<p
														className="text-sm font-semibold text-slate-900 truncate"
														title={instance.filename}
													>
														{getDisplayFileName(instance.filename, index)}
													</p>
													<Badge
														variant="secondary"
														className={`text-xs ${getModalityColor(instance.modality)} shrink-0`}
													>
														{instance.modality}
													</Badge>
												</div>
												<p className="text-xs text-slate-600 mb-2">{instance.bodyPart}</p>
												<div className="flex items-center gap-4 text-xs text-slate-500">
													<div className="flex items-center gap-1">
														<Calendar className="h-3 w-3" />
														<span>
															{formatDistanceToNow(new Date(instance.uploadedAt), {
																addSuffix: true,
																locale: vi,
															})}
														</span>
													</div>
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2 ml-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleViewFile(instance)}
												className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
											>
												<Eye className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDownloadFile(instance)}
												className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
											>
												<Download className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</>
	);
}
