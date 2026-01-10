'use client';

import React from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ImageAnnotationDto, AnnotationData } from '@/lib/api/services/image-annotation.service';
import { Box } from 'lucide-react';

interface AnnotationTableProps {
	annotations: ImageAnnotationDto[];
	isLoading: boolean;
}

function parseAnnotationData(data: string): AnnotationData | null {
	try {
		return JSON.parse(data) as AnnotationData;
	} catch {
		return null;
	}
}

export function AnnotationTable({ annotations, isLoading }: AnnotationTableProps) {
	if (isLoading) {
		return (
			<div className="text-center py-16">
				<div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
				<p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
			</div>
		);
	}

	if (annotations.length === 0) {
		return (
			<div className="text-center py-16">
				<div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
					<Box className="h-8 w-8 text-gray-400" />
				</div>
				<p className="text-gray-900 font-semibold text-lg mb-1">Không tìm thấy annotation</p>
				<p className="text-gray-500 text-sm">Chưa có annotation nào trong hệ thống</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow className="border-b border-gray-200 bg-gray-50/50 hover:bg-transparent">
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider pl-6">
							Label
						</TableHead>
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
							Loại
						</TableHead>
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
							Confidence
						</TableHead>
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider text-right">
							xMin
						</TableHead>
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider text-right">
							yMin
						</TableHead>
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider text-right">
							xMax
						</TableHead>
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider text-right">
							yMax
						</TableHead>
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
							SOP Instance UID
						</TableHead>
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider pr-6">
							Ngày tạo
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{annotations.map(annotation => {
						const data = parseAnnotationData(annotation.annotationData);
						return (
							<TableRow key={annotation.id} className="border-b border-gray-100 group">
								<TableCell className="py-4 pl-6">
									<p className="font-semibold text-gray-900 text-sm">{data?.label || 'N/A'}</p>
								</TableCell>
								<TableCell className="py-4">
									<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
										{annotation.annotationType}
									</span>
								</TableCell>
								<TableCell className="py-4">
									<p className="text-sm text-gray-700">
										{data?.confidence !== undefined
											? `${(data.confidence * 100).toFixed(1)}%`
											: 'N/A'}
									</p>
								</TableCell>
								<TableCell className="py-4 text-right">
									<p className="text-xs text-gray-700 font-mono">
										{data?.xMin !== undefined ? data.xMin.toFixed(2) : 'N/A'}
									</p>
								</TableCell>
								<TableCell className="py-4 text-right">
									<p className="text-xs text-gray-700 font-mono">
										{data?.yMin !== undefined ? data.yMin.toFixed(2) : 'N/A'}
									</p>
								</TableCell>
								<TableCell className="py-4 text-right">
									<p className="text-xs text-gray-700 font-mono">
										{data?.xMax !== undefined ? data.xMax.toFixed(2) : 'N/A'}
									</p>
								</TableCell>
								<TableCell className="py-4 text-right">
									<p className="text-xs text-gray-700 font-mono">
										{data?.yMax !== undefined ? data.yMax.toFixed(2) : 'N/A'}
									</p>
								</TableCell>
								<TableCell className="py-4">
									<p
										className="text-xs text-gray-600 font-mono truncate max-w-[200px]"
										title={annotation.instanceSopInstanceUid}
									>
										{annotation.instanceSopInstanceUid
											? `...${annotation.instanceSopInstanceUid.slice(-20)}`
											: 'N/A'}
									</p>
								</TableCell>
								<TableCell className="py-4 pr-6">
									<p className="text-sm text-gray-700">
										{format(new Date(annotation.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
									</p>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
