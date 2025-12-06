'use client';

import React from 'react';
import { Monitor, Settings2, MousePointer2, Scroll, User, Stethoscope } from 'lucide-react';
import { DicomMetadata } from './dicom-viewer';

interface DicomInfoPanelProps {
	show: boolean;
	metadata: DicomMetadata | null;
	windowLevel: { window: number; level: number };
	zoomLevel: number;
}

// Helper function để format date
const formatDate = (dateStr?: string): string => {
	if (!dateStr) return '';
	try {
		// DICOM date format: YYYYMMDD
		if (dateStr.length === 8) {
			const year = dateStr.substring(0, 4);
			const month = dateStr.substring(4, 6);
			const day = dateStr.substring(6, 8);
			return `${day}/${month}/${year}`;
		}
		return dateStr;
	} catch {
		return dateStr || '';
	}
};

// Helper function để format time
const formatTime = (timeStr?: string): string => {
	if (!timeStr) return '';
	try {
		// DICOM time format: HHMMSS.ffffff
		if (timeStr.length >= 6) {
			const hour = timeStr.substring(0, 2);
			const minute = timeStr.substring(2, 4);
			const second = timeStr.substring(4, 6);
			return `${hour}:${minute}:${second}`;
		}
		return timeStr;
	} catch {
		return timeStr || '';
	}
};

export default function DicomInfoPanel({
	show,
	metadata,
	windowLevel,
	zoomLevel,
}: DicomInfoPanelProps) {
	if (!show) return null;

	return (
		<div className="absolute top-4 left-4 right-4 flex gap-4 z-20 pointer-events-none">
			{/* Left Info Panel - Patient & Study Info */}
			<div className="bg-black/80 backdrop-blur-md rounded-lg p-4 border border-slate-700/50 shadow-2xl pointer-events-auto max-w-sm">
				<div className="space-y-3">
					{/* Patient Information */}
					{metadata && (metadata.patientName || metadata.patientId) && (
						<div className="mb-3">
							<div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700">
								<User className="h-4 w-4 text-blue-400" />
								<h3 className="text-sm font-semibold text-white">Thông tin bệnh nhân</h3>
							</div>
							<div className="space-y-2 text-xs">
								{metadata.patientName && (
									<div>
										<span className="text-slate-400">Tên bệnh nhân:</span>
										<span className="text-white ml-2">{metadata.patientName}</span>
									</div>
								)}
								{metadata.patientId && (
									<div>
										<span className="text-slate-400">Mã bệnh nhân:</span>
										<span className="text-white ml-2 font-mono">{metadata.patientId}</span>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Study Information */}
					{metadata && (metadata.studyDate || metadata.modality || metadata.studyDescription) && (
						<div className="mb-3">
							<div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700">
								<Stethoscope className="h-4 w-4 text-green-400" />
								<h3 className="text-sm font-semibold text-white">Thông tin ca chụp</h3>
							</div>
							<div className="space-y-2 text-xs">
								{metadata.studyDate && (
									<div>
										<span className="text-slate-400">Ngày chụp:</span>
										<span className="text-white ml-2">{formatDate(metadata.studyDate)}</span>
										{metadata.studyTime && (
											<span className="text-white ml-2">({formatTime(metadata.studyTime)})</span>
										)}
									</div>
								)}
								{metadata.modality && (
									<div>
										<span className="text-slate-400">Phương thức:</span>
										<span className="text-white ml-2 font-semibold">{metadata.modality}</span>
									</div>
								)}
								{metadata.studyDescription && (
									<div>
										<span className="text-slate-400">Mô tả ca chụp:</span>
										<span className="text-white ml-2">{metadata.studyDescription}</span>
									</div>
								)}
								{metadata.seriesDescription && (
									<div>
										<span className="text-slate-400">Mô tả series:</span>
										<span className="text-white ml-2">{metadata.seriesDescription}</span>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Image Technical Information */}
					<div>
						<div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700">
							<Monitor className="h-4 w-4 text-purple-400" />
							<h3 className="text-sm font-semibold text-white">Thông tin kỹ thuật</h3>
						</div>
						{metadata && (
							<div className="space-y-2 text-xs">
								{metadata.rows && metadata.columns && (
									<div>
										<span className="text-slate-400">Kích thước:</span>
										<span className="text-white ml-2 font-mono">
											{metadata.columns} × {metadata.rows}
										</span>
									</div>
								)}
								{metadata.pixelSpacing && (
									<div>
										<span className="text-slate-400">Khoảng cách pixel:</span>
										<span className="text-white ml-2 font-mono">
											{metadata.pixelSpacing[0]?.toFixed(2)} ×{' '}
											{metadata.pixelSpacing[1]?.toFixed(2)} mm
										</span>
									</div>
								)}
							</div>
						)}
					</div>

					<div className="pt-2 border-t border-slate-700">
						<div className="text-xs space-y-1">
							<div className="flex justify-between">
								<span className="text-slate-400">Window:</span>
								<span className="text-white font-mono">{Math.round(windowLevel.window)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-slate-400">Level:</span>
								<span className="text-white font-mono">{Math.round(windowLevel.level)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-slate-400">Zoom:</span>
								<span className="text-white font-mono">{(1 / (zoomLevel || 1)).toFixed(2)}×</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Right Controls Panel */}
			<div className="ml-auto bg-black/80 backdrop-blur-md rounded-lg p-4 border border-slate-700/50 shadow-2xl pointer-events-auto">
				<div className="space-y-3">
					<div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
						<Settings2 className="h-4 w-4 text-blue-400" />
						<h3 className="text-sm font-semibold text-white">Controls</h3>
					</div>

					<div className="text-xs space-y-2 text-slate-300">
						<div className="flex items-center gap-2">
							<MousePointer2 className="h-3.5 w-3.5 text-slate-500" />
							<span>Left Click: Window/Level</span>
						</div>
						<div className="flex items-center gap-2">
							<MousePointer2 className="h-3.5 w-3.5 text-slate-500" />
							<span>Right Click: Zoom</span>
						</div>
						<div className="flex items-center gap-2">
							<MousePointer2 className="h-3.5 w-3.5 text-slate-500" />
							<span>Middle Click: Pan</span>
						</div>
						<div className="flex items-center gap-2">
							<Scroll className="h-3.5 w-3.5 text-slate-500" />
							<span>Wheel: Scroll</span>
						</div>
						<div className="pt-2 border-t border-slate-700 mt-2">
							<div className="text-slate-400 mb-1">Shortcuts:</div>
							<div className="space-y-1">
								<div>
									<kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">B</kbd> Bounding Box
								</div>
								<div>
									<kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">N</kbd> Note
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
