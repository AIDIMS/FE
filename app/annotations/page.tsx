'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { RoleGuard } from '@/components/auth/role-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, UserX } from 'lucide-react';
import { imageAnnotationService } from '@/lib/api';
import { ImageAnnotationDto, AnnotationData } from '@/lib/api/services/image-annotation.service';
import { useAuth } from '@/lib/contexts/auth-context';
import { AnnotationTable } from '@/components/annotations/annotation-table';
import { UserRole } from '@/lib/types';
import { Pagination } from '@/components/ui/pagination';

function parseAnnotationData(data: string): AnnotationData | null {
	try {
		return JSON.parse(data) as AnnotationData;
	} catch {
		return null;
	}
}

export default function AnnotationsPage() {
	const { user: currentUser } = useAuth();
	const [annotations, setAnnotations] = useState<ImageAnnotationDto[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [pageNumber, setPageNumber] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [totalPages, setTotalPages] = useState(1);

	// Check if current user is admin
	const isAdmin = currentUser?.role === UserRole.Admin;

	const loadAnnotations = useCallback(async () => {
		try {
			setIsLoading(true);
			const result = await imageAnnotationService.getAll(pageNumber, 20);

			if (result.isSuccess && result.data) {
				setAnnotations(result.data.items);
				setTotalCount(result.data.totalCount);
				setTotalPages(result.data.totalPages);
			}
		} catch (error) {
			console.error('Error loading annotations:', error);
		} finally {
			setIsLoading(false);
		}
	}, [pageNumber]);

	useEffect(() => {
		loadAnnotations();
	}, [loadAnnotations]);

	// Filter annotations
	const filteredAnnotations = annotations.filter(annotation => {
		const data = parseAnnotationData(annotation.annotationData);
		const query = searchQuery.toLowerCase();

		const matchesSearch =
			data?.label?.toLowerCase().includes(query) ||
			annotation.instanceSopInstanceUid?.toLowerCase().includes(query) ||
			annotation.annotationType?.toLowerCase().includes(query);

		return matchesSearch;
	});

	// Export to CSV
	const exportToCSV = () => {
		const headers = [
			'ID',
			'Label',
			'Annotation Type',
			'Confidence',
			'xMin',
			'yMin',
			'xMax',
			'yMax',
			'SOP Instance UID',
			'Instance ID',
			'Created At',
		];

		const rows = annotations.map(annotation => {
			const data = parseAnnotationData(annotation.annotationData);
			return [
				annotation.id,
				data?.label || '',
				annotation.annotationType,
				data?.confidence?.toString() || '',
				data?.xMin?.toString() || '',
				data?.yMin?.toString() || '',
				data?.xMax?.toString() || '',
				data?.yMax?.toString() || '',
				annotation.instanceSopInstanceUid || '',
				annotation.instanceId || '',
				annotation.createdAt,
			];
		});

		const csvContent = [
			headers.join(','),
			...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
		].join('\n');

		const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', `annotations_${new Date().toISOString().split('T')[0]}.csv`);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	if (!isAdmin) {
		return (
			<DashboardLayout>
				<div className="container mx-auto px-4 py-6 max-w-7xl">
					<Card className="border-red-200">
						<CardContent className="pt-6">
							<div className="text-center text-red-600">
								<UserX className="h-12 w-12 mx-auto mb-4" />
								<h2 className="text-xl font-semibold mb-2">Không có quyền truy cập</h2>
								<p>Bạn không có quyền truy cập trang quản lý annotations.</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<RoleGuard allowedRoles={[UserRole.Admin]}>
				<div className="container mx-auto px-4 py-6 max-w-7xl">
					{/* Header Section */}
					<div className="mb-8">
						<div className="flex items-center justify-between mb-4">
							<div>
								<h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Annotations</h1>
								<p className="text-sm text-gray-600">
									Quản lý và xuất dữ liệu annotations từ ảnh DICOM
								</p>
							</div>
							<Button
								onClick={exportToCSV}
								className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all h-10 px-4"
								disabled={annotations.length === 0}
							>
								<Download className="h-4 w-4 mr-2" />
								Xuất CSV
							</Button>
						</div>
					</div>

					{/* Search Bar */}
					<div className="mb-6">
						<div className="relative max-w-md w-full">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								placeholder="Tìm kiếm theo label, SOP UID..."
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className="pl-10 bg-white border-gray-300 focus:border-blue-600 focus:ring-blue-600 h-10 shadow-sm"
							/>
						</div>
					</div>

					{/* Annotations Table */}
					<Card className="bg-white border-gray-200 shadow-md overflow-hidden">
						<CardHeader className="border-b border-gray-200 bg-white">
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="text-lg font-semibold text-gray-900">
										Danh sách Annotations
									</CardTitle>
									<CardDescription className="mt-1">
										{filteredAnnotations.length} annotations
										{searchQuery && ` (${filteredAnnotations.length} kết quả tìm thấy)`}
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="p-0">
							<AnnotationTable annotations={filteredAnnotations} isLoading={isLoading} />
						</CardContent>
					</Card>

					{/* Pagination */}
					{totalPages > 1 && (
						<Pagination
							currentPage={pageNumber}
							totalPages={totalPages}
							onPageChange={setPageNumber}
						/>
					)}
				</div>
			</RoleGuard>
		</DashboardLayout>
	);
}
