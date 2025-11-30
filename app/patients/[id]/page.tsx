'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PatientWithDetails, PatientVisit } from '@/lib/types/patient';
import { formatDate, formatGender } from '@/lib/utils/date';
import {
	ArrowLeft,
	Plus,
	Pencil,
	Trash2,
	UserCircle,
	Phone,
	MapPin,
	Cake,
	FileText,
} from 'lucide-react';
import { PatientVisitForm } from '@/components/patients/patient-visit-form';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { patientService } from '@/lib/api/services/patient.service';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';

export default function PatientDetailPage() {
	const params = useParams();
	const router = useRouter();
	const patientId = params.id as string;

	const [patient, setPatient] = useState<PatientWithDetails | null>(null);
	const [visits, setVisits] = useState<PatientVisit[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
	const [selectedVisit, setSelectedVisit] = useState<PatientVisit | null>(null);

	useEffect(() => {
		if (patientId) {
			loadPatientData();
		}
	}, [patientId]);

	const loadPatientData = async () => {
		setIsLoading(true);
		try {
			const result = await patientService.getById(patientId);
			if (result.isSuccess && result.data) {
				const patientData = result.data as PatientWithDetails;
				setPatient(patientData);
				setVisits(patientData.visits || []);
			} else {
				toast.error(result.message || 'Không thể tải dữ liệu bệnh nhân.');
				router.push('/patients');
			}
		} catch (error) {
			console.error('Error loading patient data:', error);
			toast.error('Đã xảy ra lỗi khi tải dữ liệu bệnh nhân.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddVisit = () => {
		setSelectedVisit(null);
		setIsVisitFormOpen(true);
	};

	const handleEditVisit = (visit: PatientVisit) => {
		setSelectedVisit(visit);
		setIsVisitFormOpen(true);
	};

	const handleDeleteVisit = (visit: PatientVisit) => {
		if (confirm('Bạn có chắc chắn muốn xóa ca khám này?')) {
			// Handle delete
			setVisits(prev => prev.filter(v => v.id !== visit.id));
		}
	};

	const handleSubmitVisit = async (data: Partial<PatientVisit>) => {
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 800));

		if (selectedVisit) {
			// Update existing visit
			setVisits(prev =>
				prev.map(v =>
					v.id === selectedVisit.id ? { ...v, ...data, updated_at: new Date().toISOString() } : v
				)
			);
		} else {
			// Create new visit
			const newVisit: PatientVisit = {
				id: Math.random().toString(36).substr(2, 9),
				patientId: patientId,
				patientCode: patient ? patient.patientCode : '',
				patientName: patient ? patient.fullName : '',
				assignedDoctorId: data.assignedDoctorId || null,
				assignedDoctorName: data.assignedDoctorName || null,
				symptoms: data.symptoms || '',
				status: data.status || 'waiting',
				createdAt: new Date().toISOString(),
				createdBy: null,
				updatedAt: null,
				updatedBy: null,
				isDeleted: false,
				deletedAt: null,
				deletedBy: null,
			};
			setVisits(prev => [newVisit, ...prev]);
		}

		setIsVisitFormOpen(false);
		setSelectedVisit(null);
	};

	if (isLoading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="flex items-center gap-2 text-gray-500">
						<svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
								fill="none"
							></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Đang tải...
					</div>
				</div>
			</DashboardLayout>
		);
	}

	if (!patient) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="text-center">
						<p className="text-gray-500 mb-4">Không tìm thấy bệnh nhân</p>
						<Button onClick={() => router.push('/patients')} variant="outline">
							Quay lại danh sách
						</Button>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="w-full px-6 py-6">
				{/* Header */}
				<div className="mb-6">
					<Button
						variant="ghost"
						onClick={() => router.push('/patients')}
						className="mb-4 text-gray-600 hover:text-gray-900"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Quay lại
					</Button>

					<div className="flex items-center justify-between mb-6">
						<div>
							<div className="flex items-center gap-3 mb-1">
								<h1 className="text-2xl font-bold text-gray-900">{patient.fullName}</h1>
								<span className="text-sm text-gray-500">• {visits.length} ca khám</span>
							</div>
							<div className="text-sm text-gray-600">
								<span className="font-mono">{patient.patientCode}</span>
							</div>
						</div>
						<Button onClick={handleAddVisit} className="bg-blue-600 hover:bg-blue-700 text-white">
							<Plus className="h-4 w-4 mr-2" />
							Thêm ca khám
						</Button>
					</div>
				</div>

				{/* Thông tin cơ bản */}
				<Card className="mb-6 border-gray-200">
					<CardHeader className="border-b border-gray-200 pb-4">
						<div className="flex items-center gap-2">
							<UserCircle className="h-5 w-5 text-blue-600" />
							<CardTitle className="text-base font-semibold text-gray-900">
								Thông tin cơ bản
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="p-6">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
							<div>
								<div className="flex items-center gap-2 mb-2 text-gray-500">
									<Cake className="h-4 w-4" />
									<p className="text-xs font-medium uppercase">Ngày sinh</p>
								</div>
								<p className="text-base font-medium text-gray-900">
									{formatDate(patient.dateOfBirth)}
								</p>
							</div>

							<div>
								<div className="flex items-center gap-2 mb-2 text-gray-500">
									<UserCircle className="h-4 w-4" />
									<p className="text-xs font-medium uppercase">Giới tính</p>
								</div>
								<p className="text-base font-medium text-gray-900">
									{formatGender(patient.gender)}
								</p>
							</div>

							<div>
								<div className="flex items-center gap-2 mb-2 text-gray-500">
									<Phone className="h-4 w-4" />
									<p className="text-xs font-medium uppercase">Số điện thoại</p>
								</div>
								<p className="text-base font-medium text-gray-900">{patient.phoneNumber || '—'}</p>
							</div>

							<div className="sm:col-span-2 lg:col-span-1">
								<div className="flex items-center gap-2 mb-2 text-gray-500">
									<MapPin className="h-4 w-4" />
									<p className="text-xs font-medium uppercase">Địa chỉ</p>
								</div>
								<p className="text-base font-medium text-gray-900 break-words">
									{patient.address || '—'}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Danh sách ca khám */}
				<Card className="border-gray-200">
					<CardHeader className="border-b border-gray-200 pb-4">
						<CardTitle className="text-base font-semibold text-gray-900">
							Danh sách ca khám
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						{visits.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-8 px-4 text-center">
								<p className="text-gray-500 text-sm">Chưa có ca khám nào</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow className="border-b border-gray-200 bg-gray-50/50 hover:bg-transparent">
											<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
												Ngày khám
											</TableHead>
											<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
												Triệu chứng
											</TableHead>
											<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
												Trạng thái
											</TableHead>
											<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
												Bác sĩ
											</TableHead>
											<TableHead className="w-12"></TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{visits.map(visit => (
											<TableRow
												key={visit.id}
												className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors group cursor-pointer"
												onClick={() => router.push(`/visits/${visit.id}`)}
											>
												<TableCell className="h-20">
													<div className="flex items-center gap-3">
														<div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
															<Calendar className="h-5 w-5 text-blue-600" />
														</div>
														<div>
															<p className="text-sm font-semibold text-gray-900">
																{formatDate(visit.createdAt)}
															</p>
															<p className="text-xs text-gray-500">
																Ca khám #{visit.id.slice(0, 4)}
															</p>
														</div>
													</div>
												</TableCell>
												<TableCell className="max-w-xs">
													<p className="text-sm text-gray-900 line-clamp-2">
														{visit.symptoms || 'Không có triệu chứng'}
													</p>
													<p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
														{visit.symptoms}
													</p>
												</TableCell>
												<TableCell className="whitespace-nowrap">
													<span
														className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
															visit.status === 'Done'
																? 'bg-gray-100 text-gray-800'
																: visit.status === 'Inprogress'
																	? 'bg-blue-100 text-blue-800'
																	: visit.status === 'Waiting'
																		? 'bg-yellow-100 text-yellow-800'
																		: 'bg-gray-100 text-gray-800'
														}`}
													>
														{visit.status === 'Done'
															? 'Hoàn thành'
															: visit.status === 'Inprogress'
																? 'Đang xử lý'
																: visit.status === 'Waiting'
																	? 'Chờ khám'
																	: visit.status}
													</span>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
															<User className="h-4 w-4 text-purple-600" />
														</div>
														<div className="min-w-0">
															<p className="text-sm font-medium text-gray-900 truncate">
																{visit.assignedDoctorName
																	? `Bác sĩ ${visit.assignedDoctorName}`
																	: 'Chưa chỉ định'}
															</p>
															<p className="text-xs text-gray-500">Điều trị</p>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
																onClick={e => e.stopPropagation()}
															>
																<MoreVertical className="h-4 w-4" />
																<span className="sr-only">Mở menu</span>
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end" className="w-48">
															<DropdownMenuItem
																onClick={e => {
																	e.stopPropagation();
																	router.push(`/visits/${visit.id}`);
																}}
																className="cursor-pointer"
															>
																<FileText className="mr-2 h-4 w-4" />
																Xem chi tiết
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={e => {
																	e.stopPropagation();
																	handleEditVisit(visit);
																}}
																className="cursor-pointer"
															>
																<Pencil className="mr-2 h-4 w-4" />
																Sửa
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																onClick={e => {
																	e.stopPropagation();
																	handleDeleteVisit(visit);
																}}
																className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
															>
																<Trash2 className="mr-2 h-4 w-4" />
																Xóa
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Visit Form Dialog */}
				<Dialog open={isVisitFormOpen} onOpenChange={setIsVisitFormOpen}>
					<DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>{selectedVisit ? 'Sửa ca khám' : 'Thêm ca khám mới'}</DialogTitle>
							<DialogDescription>
								{selectedVisit
									? 'Cập nhật thông tin ca khám'
									: 'Điền thông tin để thêm ca khám mới cho bệnh nhân'}
							</DialogDescription>
						</DialogHeader>
						<PatientVisitForm
							patientId={patientId}
							visit={selectedVisit}
							onSubmit={handleSubmitVisit}
							onCancel={() => {
								setIsVisitFormOpen(false);
								setSelectedVisit(null);
							}}
						/>
					</DialogContent>
				</Dialog>
			</div>
		</DashboardLayout>
	);
}
