'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PatientVisit, ImagingOrder } from '@/lib/types/patient';
import { formatDate } from '@/lib/utils/date';
import {
	ArrowLeft,
	Plus,
	FileText,
	Calendar,
	User,
	Stethoscope,
	Camera,
	Pencil,
	Trash2,
	MoreVertical,
	History,
	ClipboardList,
	Save,
} from 'lucide-react';
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { ImagingOrderForm } from '@/components/patients/imaging-order-form';

interface VisitDetail extends PatientVisit {
	patient_name: string;
	patient_code: string;
	patient_dob: string | null;
	patient_gender: 'male' | 'female' | 'other' | null;
	doctor_name?: string;
}

interface PreviousVisit {
	id: string;
	visit_date: string;
	symptoms: string;
	diagnosis: string;
	status: string;
}

interface ExaminationNote {
	diagnosis: string;
	treatment_plan: string;
	notes: string;
}

export default function VisitDetailPage() {
	const params = useParams();
	const router = useRouter();
	const visitId = params.id as string;

	const [visit, setVisit] = useState<VisitDetail | null>(null);
	const [imagingOrders, setImagingOrders] = useState<ImagingOrder[]>([]);
	const [previousVisits, setPreviousVisits] = useState<PreviousVisit[]>([]);
	const [examinationNote, setExaminationNote] = useState<ExaminationNote>({
		diagnosis: '',
		treatment_plan: '',
		notes: '',
	});
	const [isLoading, setIsLoading] = useState(true);
	const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<ImagingOrder | null>(null);
	const [isSavingNote, setIsSavingNote] = useState(false);

	useEffect(() => {
		loadVisitData();
	}, [visitId]);

	const loadVisitData = async () => {
		setIsLoading(true);
		try {
			// Mock data - sẽ thay thế bằng API call
			await new Promise(resolve => setTimeout(resolve, 500));

			const mockVisit: VisitDetail = {
				id: visitId,
				patient_id: 'patient1',
				patient_name: 'Nguyễn Văn A',
				patient_code: 'BN001',
				patient_dob: '1990-05-15',
				patient_gender: 'male',
				assigned_doctor_id: 'doc1',
				doctor_name: 'BS. Trần Thị B',
				symptoms: 'Đau đầu kéo dài, chóng mặt, buồn nôn',
				status: 'in_progress',
				created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
				created_by: null,
				updated_at: null,
				updated_by: null,
				is_deleted: false,
				deleted_at: null,
				deleted_by: null,
			};

			const mockOrders: ImagingOrder[] = [
				{
					id: 'order1',
					visit_id: visitId,
					requesting_doctor_id: 'doc1',
					modality_requested: 'CT',
					body_part_requested: 'Đầu',
					reason_for_study: 'Nghi ngờ chấn thương sọ não',
					status: 'pending',
					created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
					created_by: 'doc1',
					updated_at: null,
					updated_by: null,
					is_deleted: false,
					deleted_at: null,
					deleted_by: null,
				},
				{
					id: 'order2',
					visit_id: visitId,
					requesting_doctor_id: 'doc1',
					modality_requested: 'X-Ray',
					body_part_requested: 'Ngực',
					reason_for_study: 'Kiểm tra phổi',
					status: 'completed',
					created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
					created_by: 'doc1',
					updated_at: null,
					updated_by: null,
					is_deleted: false,
					deleted_at: null,
					deleted_by: null,
				},
			];

			const mockPreviousVisits: PreviousVisit[] = [
				{
					id: 'prev1',
					visit_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
					symptoms: 'Đau đầu nhẹ',
					diagnosis: 'Căng thẳng thần kinh, thiếu ngủ',
					status: 'completed',
				},
				{
					id: 'prev2',
					visit_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
					symptoms: 'Chóng mặt',
					diagnosis: 'Huyết áp thấp',
					status: 'completed',
				},
			];

			setVisit(mockVisit);
			setImagingOrders(mockOrders);
			setPreviousVisits(mockPreviousVisits);
		} catch (error) {
			console.error('Error loading visit data:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddOrder = () => {
		setSelectedOrder(null);
		setIsOrderFormOpen(true);
	};

	const handleEditOrder = (order: ImagingOrder) => {
		setSelectedOrder(order);
		setIsOrderFormOpen(true);
	};

	const handleDeleteOrder = (order: ImagingOrder) => {
		if (confirm('Bạn có chắc chắn muốn xóa chỉ định này?')) {
			setImagingOrders(prev => prev.filter(o => o.id !== order.id));
		}
	};

	const handleSubmitOrder = async (data: Partial<ImagingOrder>) => {
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 800));

		if (selectedOrder) {
			// Update existing order
			setImagingOrders(prev =>
				prev.map(o =>
					o.id === selectedOrder.id ? { ...o, ...data, updated_at: new Date().toISOString() } : o
				)
			);
		} else {
			// Create new order
			const newOrder: ImagingOrder = {
				id: Math.random().toString(36).substr(2, 9),
				visit_id: visitId,
				requesting_doctor_id: data.requesting_doctor_id || '',
				modality_requested: data.modality_requested || '',
				body_part_requested: data.body_part_requested || '',
				reason_for_study: data.reason_for_study || null,
				status: data.status || 'pending',
				created_at: new Date().toISOString(),
				created_by: data.requesting_doctor_id || null,
				updated_at: null,
				updated_by: null,
				is_deleted: false,
				deleted_at: null,
				deleted_by: null,
			};
			setImagingOrders(prev => [newOrder, ...prev]);
		}

		setIsOrderFormOpen(false);
		setSelectedOrder(null);
	};

	const handleSaveExaminationNote = async () => {
		setIsSavingNote(true);
		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000));
			console.log('Examination note saved:', examinationNote);
			// Show success message
		} catch (error) {
			console.error('Error saving examination note:', error);
		} finally {
			setIsSavingNote(false);
		}
	};

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			pending: { label: 'Chờ thực hiện', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
			in_progress: { label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-800 border-blue-200' },
			completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800 border-green-200' },
			cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800 border-red-200' },
		};
		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
		return (
			<span
				className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold border ${config.color}`}
			>
				{config.label}
			</span>
		);
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

	if (!visit) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="text-center">
						<p className="text-gray-500 mb-4">Không tìm thấy ca khám</p>
						<Button onClick={() => router.back()} variant="outline">
							Quay lại
						</Button>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="w-full min-h-screen bg-slate-50">
				<div className="px-6 py-8">
					{/* Header - Clean Minimal */}
					<div className="mb-8">
						<Button
							variant="ghost"
							onClick={() => router.back()}
							className="mb-6 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
						>
							<ArrowLeft className="h-5 w-5 mr-2" />
							Quay lại
						</Button>

						<div className="flex items-start justify-between mb-6">
							<div>
								<h1 className="text-3xl font-bold text-slate-900 mb-3">{visit.patient_name}</h1>
								<div className="flex items-center gap-4 text-sm">
									<div className="flex items-center gap-2">
										<span className="text-slate-500">Mã BN:</span>
										<span className="font-mono font-semibold text-slate-900">
											{visit.patient_code}
										</span>
									</div>
									<span className="text-slate-300">•</span>
									<span className="text-slate-600">{formatDate(visit.created_at)}</span>
									{visit.doctor_name && (
										<>
											<span className="text-slate-300">•</span>
											<span className="text-slate-600">{visit.doctor_name}</span>
										</>
									)}
								</div>
							</div>
							{getStatusBadge(visit.status)}
						</div>
					</div>

					{/* 3-Column Layout - Minimal Design */}
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
						{/* Left Column - Patient History */}
						<div className="lg:col-span-3 space-y-4">
							{/* Patient Info Card */}
							<Card className="border border-slate-200 bg-white shadow-sm">
								<CardHeader className="pb-3 border-b border-slate-100">
									<div className="flex items-center gap-2">
										<User className="h-4 w-4 text-slate-600" />
										<CardTitle className="text-sm font-semibold text-slate-900">
											Thông tin bệnh nhân
										</CardTitle>
									</div>
								</CardHeader>
								<CardContent className="p-4 space-y-3">
									<div>
										<p className="text-xs text-slate-500 mb-1">Họ và tên</p>
										<p className="text-sm font-semibold text-slate-900">{visit.patient_name}</p>
									</div>
									<div>
										<p className="text-xs text-slate-500 mb-1">Mã bệnh nhân</p>
										<p className="text-sm font-mono text-slate-700">{visit.patient_code}</p>
									</div>
									{visit.patient_dob && (
										<div>
											<p className="text-xs text-slate-500 mb-1">Ngày sinh</p>
											<p className="text-sm text-slate-700">{formatDate(visit.patient_dob)}</p>
										</div>
									)}
									{visit.patient_gender && (
										<div>
											<p className="text-xs text-slate-500 mb-1">Giới tính</p>
											<p className="text-sm text-slate-700">
												{visit.patient_gender === 'male'
													? 'Nam'
													: visit.patient_gender === 'female'
														? 'Nữ'
														: 'Khác'}
											</p>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Previous Visits */}
							<Card className="border border-slate-200 bg-white shadow-sm">
								<CardHeader className="pb-3 border-b border-slate-100">
									<div className="flex items-center gap-2">
										<History className="h-4 w-4 text-slate-600" />
										<CardTitle className="text-sm font-semibold text-slate-900">
											Lịch sử khám
										</CardTitle>
									</div>
								</CardHeader>
								<CardContent className="p-0">
									{previousVisits.length === 0 ? (
										<div className="p-8 text-center">
											<History className="h-8 w-8 text-slate-300 mx-auto mb-2" />
											<p className="text-sm text-slate-500">Chưa có lịch sử</p>
										</div>
									) : (
										<div className="divide-y divide-slate-100">
											{previousVisits.map(pv => (
												<div
													key={pv.id}
													className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
												>
													<div className="flex items-center gap-2 mb-2">
														<Calendar className="h-3.5 w-3.5 text-slate-400" />
														<p className="text-xs font-semibold text-slate-900">
															{formatDate(pv.visit_date)}
														</p>
													</div>
													<p className="text-xs text-slate-600 mb-1">{pv.symptoms}</p>
													<p className="text-xs text-slate-900 font-medium">{pv.diagnosis}</p>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						{/* Center Column - Examination Notes */}
						<div className="lg:col-span-5">
							<Card className="border border-slate-200 bg-white shadow-sm">
								<CardHeader className="pb-4 border-b border-slate-200">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<ClipboardList className="h-4 w-4 text-slate-600" />
											<CardTitle className="text-sm font-semibold text-slate-900">
												Phiếu khám bệnh
											</CardTitle>
										</div>
										<Button
											onClick={handleSaveExaminationNote}
											disabled={isSavingNote}
											size="sm"
											className="bg-blue-600 hover:bg-blue-700 text-white"
										>
											<Save className="h-4 w-4 mr-2" />
											{isSavingNote ? 'Đang lưu...' : 'Lưu'}
										</Button>
									</div>
								</CardHeader>
								<CardContent className="p-6 space-y-6">
									{/* Current Symptoms */}
									<div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
										<div className="flex items-start gap-2">
											<FileText className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
											<div className="flex-1">
												<p className="text-xs font-semibold text-slate-700 mb-1">Lý do khám</p>
												<p className="text-sm text-slate-900 leading-relaxed">{visit.symptoms}</p>
											</div>
										</div>
									</div>

									{/* Diagnosis */}
									<div className="space-y-2">
										<Label htmlFor="diagnosis" className="text-sm font-semibold text-slate-900">
											Chẩn đoán <span className="text-slate-400">*</span>
										</Label>
										<textarea
											id="diagnosis"
											rows={4}
											className="flex w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
											placeholder="Nhập chẩn đoán bệnh..."
											value={examinationNote.diagnosis}
											onChange={e =>
												setExaminationNote({ ...examinationNote, diagnosis: e.target.value })
											}
										/>
									</div>

									{/* Treatment Plan */}
									<div className="space-y-2">
										<Label htmlFor="treatment" className="text-sm font-semibold text-slate-900">
											Phương pháp điều trị <span className="text-slate-400">*</span>
										</Label>
										<textarea
											id="treatment"
											rows={4}
											className="flex w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
											placeholder="Nhập phương pháp điều trị, đơn thuốc..."
											value={examinationNote.treatment_plan}
											onChange={e =>
												setExaminationNote({ ...examinationNote, treatment_plan: e.target.value })
											}
										/>
									</div>

									{/* Additional Notes */}
									<div className="space-y-2">
										<Label htmlFor="notes" className="text-sm font-semibold text-slate-900">
											Ghi chú thêm
										</Label>
										<textarea
											id="notes"
											rows={3}
											className="flex w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
											placeholder="Ghi chú bổ sung..."
											value={examinationNote.notes}
											onChange={e =>
												setExaminationNote({ ...examinationNote, notes: e.target.value })
											}
										/>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Right Column - Imaging Orders */}
						<div className="lg:col-span-4">
							<Card className="border-2 border-blue-600 bg-white shadow-sm">
								<CardHeader className="pb-4 border-b border-slate-200">
									<div className="flex items-center gap-2">
										<Camera className="h-4 w-4 text-blue-600" />
										<CardTitle className="text-sm font-semibold text-slate-900">
											Chỉ định chụp chiếu
										</CardTitle>
									</div>
								</CardHeader>
								<CardContent className="p-4">
									{/* Add Order Button */}
									<Button
										onClick={handleAddOrder}
										className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-4 h-11 font-semibold"
									>
										<Plus className="h-5 w-5 mr-2" />
										Thêm Chỉ Định
									</Button>

									{/* Summary Stats - Minimal */}
									<div className="grid grid-cols-3 gap-2 mb-4">
										<div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
											<p className="text-xl font-bold text-slate-900">{imagingOrders.length}</p>
											<p className="text-xs text-slate-500 mt-1">Tổng</p>
										</div>
										<div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
											<p className="text-xl font-bold text-slate-900">
												{imagingOrders.filter(o => o.status === 'pending').length}
											</p>
											<p className="text-xs text-slate-500 mt-1">Chờ</p>
										</div>
										<div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
											<p className="text-xl font-bold text-slate-900">
												{imagingOrders.filter(o => o.status === 'completed').length}
											</p>
											<p className="text-xs text-slate-500 mt-1">Xong</p>
										</div>
									</div>

									{/* Orders List */}
									{imagingOrders.length === 0 ? (
										<div className="text-center py-10 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
											<Camera className="h-10 w-10 text-slate-300 mx-auto mb-3" />
											<p className="text-sm text-slate-500">Chưa có chỉ định</p>
										</div>
									) : (
										<div className="space-y-2">
											{imagingOrders.map(order => (
												<div
													key={order.id}
													className="bg-white rounded-lg p-4 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group"
												>
													<div className="flex items-start justify-between mb-3">
														<div className="flex items-center gap-3 flex-1">
															<div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
																<Camera className="h-4 w-4 text-slate-600" />
															</div>
															<div>
																<p className="text-sm font-semibold text-slate-900">
																	{order.modality_requested}
																</p>
																<p className="text-xs text-slate-600">
																	{order.body_part_requested}
																</p>
															</div>
														</div>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button
																	variant="ghost"
																	size="icon"
																	className="h-7 w-7 text-slate-400 hover:text-slate-900 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
																>
																	<MoreVertical className="h-4 w-4" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end" className="w-36">
																<DropdownMenuItem
																	onClick={() => handleEditOrder(order)}
																	className="cursor-pointer text-sm"
																>
																	<Pencil className="mr-2 h-3 w-3" />
																	Sửa
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	onClick={() => handleDeleteOrder(order)}
																	className="cursor-pointer text-sm text-red-600"
																>
																	<Trash2 className="mr-2 h-3 w-3" />
																	Xóa
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
													{order.reason_for_study && (
														<p className="text-xs text-slate-600 mb-3 line-clamp-2 pl-12">
															{order.reason_for_study}
														</p>
													)}
													<div className="flex items-center justify-between pl-12">
														{getStatusBadge(order.status)}
														<p className="text-xs text-slate-400">
															{new Date(order.created_at).toLocaleTimeString('vi-VN', {
																hour: '2-digit',
																minute: '2-digit',
															})}
														</p>
													</div>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</div>

					{/* Order Form Dialog */}
					<Dialog open={isOrderFormOpen} onOpenChange={setIsOrderFormOpen}>
						<DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>
									{selectedOrder ? 'Sửa chỉ định chụp chiếu' : 'Thêm chỉ định chụp chiếu mới'}
								</DialogTitle>
								<DialogDescription>
									{selectedOrder
										? 'Cập nhật thông tin chỉ định chụp chiếu'
										: 'Điền thông tin để thêm chỉ định chụp chiếu mới cho ca khám'}
								</DialogDescription>
							</DialogHeader>
							<ImagingOrderForm
								visitId={visitId}
								order={selectedOrder}
								onSubmit={handleSubmitOrder}
								onCancel={() => {
									setIsOrderFormOpen(false);
									setSelectedOrder(null);
								}}
							/>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</DashboardLayout>
	);
}
