'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { PatientVisit, ImagingOrder } from '@/lib/types/patient';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, Stethoscope, FileText, Image, Loader2, Eye, ChevronLeft } from 'lucide-react';
import { ImagingOrderForm } from '@/components/patients/imaging-order-form';
import { VisitHeader } from '@/components/visits/visit-header';
import { PatientInfoCard } from '@/components/visits/patient-info-card';
import { PreviousVisitsCard } from '@/components/visits/previous-visits-card';
import { ExaminationNoteCard } from '@/components/visits/examination-note-card';
import { ImagingOrdersCard } from '@/components/visits/imaging-orders-card';
import { DicomFilesCard } from '@/components/visits/dicom-files-card';
import { visitService, imagingOrderService } from '@/lib/api';
import { diagnosisService } from '@/lib/api/services/diagnosis.service';
import { toast } from '@/lib/utils/toast';

interface VisitDetail extends PatientVisit {
	patientName: string;
	patientCode: string;
	patientDob: string | null;
	patientGender: 'male' | 'female' | 'other' | null;
	doctorName?: string;
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

interface PreviousVisitDetail {
	id: string;
	visitDate: string;
	symptoms: string;
	patientName: string;
	doctorName?: string;
	status: string;
	diagnosis?: {
		finalDiagnosis: string;
		treatmentPlan?: string;
		notes?: string;
	};
	imagingOrders: {
		id: string;
		modalityRequested: string;
		bodyPartRequested: string;
		reasonForStudy?: string;
		status: string;
		studyId?: string;
	}[];
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
	const [diagnosisId, setDiagnosisId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<ImagingOrder | null>(null);
	const [isSavingNote, setIsSavingNote] = useState(false);
	const [selectedOrderForImages, setSelectedOrderForImages] = useState<ImagingOrder | null>(null);

	// Previous visit detail dialog
	const [isPreviousVisitDialogOpen, setIsPreviousVisitDialogOpen] = useState(false);
	const [selectedPreviousVisit, setSelectedPreviousVisit] = useState<PreviousVisitDetail | null>(
		null
	);
	const [isLoadingPreviousVisit, setIsLoadingPreviousVisit] = useState(false);
	const [selectedPreviousOrderId, setSelectedPreviousOrderId] = useState<string | null>(null);

	const loadPreviousVisits = useCallback(
		async (patientId: string) => {
			try {
				const result = await visitService.getAll(1, 10);

				if (result.isSuccess && result.data?.items) {
					const doneVisits = result.data.items
						.filter(v => v.patientId === patientId && v.status === 'Done' && v.id !== visitId)
						.map(v => ({
							id: v.id,
							visit_date: v.createdAt,
							symptoms: v.symptoms || '',
							diagnosis: '',
							status: v.status,
						}))
						.sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime());

					setPreviousVisits(doneVisits);
				}
			} catch (error) {
				console.error('Error loading previous visits:', error);
			}
		},
		[visitId]
	);

	const loadPreviousVisitDetail = useCallback(async (previousVisitId: string) => {
		setIsLoadingPreviousVisit(true);
		setIsPreviousVisitDialogOpen(true);
		setSelectedPreviousOrderId(null); // Reset selected order when opening new visit

		try {
			// Load visit details
			const visitResult = await visitService.getById(previousVisitId);

			if (!visitResult.isSuccess || !visitResult.data) {
				toast.error('Lỗi', 'Không thể tải thông tin ca khám');
				return;
			}

			const visitData = visitResult.data;

			// Load imaging orders for this visit
			const ordersResult = await imagingOrderService.getByVisitId(previousVisitId);
			const orders =
				ordersResult.isSuccess && ordersResult.data?.items ? ordersResult.data.items : [];

			// Try to load diagnosis if there's a completed order with studyId
			let diagnosisData: PreviousVisitDetail['diagnosis'] | undefined;
			const completedOrder = orders.find(order => order.status === 'Completed' && order.studyId);

			if (completedOrder?.studyId) {
				const diagResult = await diagnosisService.getByStudyId(completedOrder.studyId);
				if (diagResult.isSuccess && diagResult.data) {
					diagnosisData = {
						finalDiagnosis: diagResult.data.finalDiagnosis,
						treatmentPlan: diagResult.data.treatmentPlan || undefined,
						notes: diagResult.data.notes || undefined,
					};
				}
			}

			setSelectedPreviousVisit({
				id: visitData.id,
				visitDate: visitData.createdAt,
				symptoms: visitData.symptoms || '',
				patientName: visitData.patientName,
				doctorName: visitData.assignedDoctorName || undefined,
				status: visitData.status,
				diagnosis: diagnosisData,
				imagingOrders: orders.map(o => ({
					id: o.id,
					modalityRequested: o.modalityRequested,
					bodyPartRequested: o.bodyPartRequested,
					reasonForStudy: o.reasonForStudy || undefined,
					status: o.status,
					studyId: o.studyId || undefined,
				})),
			});
		} catch (error) {
			console.error('Error loading previous visit detail:', error);
			toast.error('Lỗi', 'Đã xảy ra lỗi khi tải thông tin ca khám');
		} finally {
			setIsLoadingPreviousVisit(false);
		}
	}, []);

	const loadDiagnosis = useCallback(async (studyId: string) => {
		try {
			const result = await diagnosisService.getByStudyId(studyId);
			if (result.isSuccess && result.data) {
				setDiagnosisId(result.data.id);
				setExaminationNote(prev => ({
					...prev,
					diagnosis: result.data!.finalDiagnosis,
					treatment_plan: result.data!.treatmentPlan || '',
					notes: result.data!.notes || '',
				}));
			}
		} catch (error) {
			console.error('Error loading diagnosis:', error);
		}
	}, []);

	const loadImagingOrders = useCallback(
		async (visitId: string) => {
			try {
				const result = await imagingOrderService.getByVisitId(visitId);

				if (result.isSuccess && result.data?.items) {
					console.log('Imaging orders loaded:', result.data.items);
					result.data.items.forEach(order => {
						console.log(`Order ${order.id} status:`, order.status);
					});
					setImagingOrders(result.data.items);

					// Load diagnosis if there's a completed order with studyId
					const completedOrder = result.data.items.find(
						order => order.status === 'Completed' && order.studyId
					);
					if (completedOrder?.studyId) {
						loadDiagnosis(completedOrder.studyId);
					}
				}
			} catch (error) {
				console.error('Error loading imaging orders:', error);
			}
		},
		[loadDiagnosis]
	);

	const loadVisitData = useCallback(async () => {
		setIsLoading(true);
		try {
			const result = await visitService.getById(visitId);

			if (result.isSuccess && result.data) {
				const visitData = result.data;

				const mappedVisit: VisitDetail = {
					id: visitData.id,
					patientId: visitData.patientId,
					patientName: visitData.patientName,
					patientCode: visitData.patientCode,
					patientDob: null,
					patientGender: null,
					assignedDoctorId: visitData.assignedDoctorId,
					assignedDoctorName: visitData.assignedDoctorName,
					doctorName: visitData.assignedDoctorName || undefined,
					symptoms: visitData.symptoms,
					status: visitData.status,
					createdAt: visitData.createdAt,
					createdBy: visitData.createdBy,
					updatedAt: visitData.updatedAt,
					updatedBy: visitData.updatedBy,
					isDeleted: visitData.isDeleted,
					deletedAt: visitData.deletedAt,
					deletedBy: visitData.deletedBy,
				};
				setVisit(mappedVisit);

				// Load previous visits for this patient with status = "Done"
				await loadPreviousVisits(visitData.patientId);

				// Load imaging orders for this visit
				await loadImagingOrders(visitId);
			} else {
				toast.error('Lỗi', result.message || 'Không thể tải thông tin ca khám');
			}
		} catch (error) {
			console.error('Error loading visit data:', error);
			toast.error('Lỗi', 'Đã xảy ra lỗi khi tải thông tin ca khám');
		} finally {
			setIsLoading(false);
		}
	}, [visitId, loadPreviousVisits, loadImagingOrders]);

	useEffect(() => {
		loadVisitData();
	}, [loadVisitData]);

	const handleAddOrder = () => {
		setSelectedOrder(null);
		setIsOrderFormOpen(true);
	};

	const handleEditOrder = (order: ImagingOrder) => {
		setSelectedOrder(order);
		setIsOrderFormOpen(true);
	};

	const handleDeleteOrder = async (order: ImagingOrder) => {
		if (confirm('Bạn có chắc chắn muốn xóa chỉ định này?')) {
			try {
				const result = await imagingOrderService.delete(order.id);
				if (result.isSuccess) {
					setImagingOrders(prev => prev.filter(o => o.id !== order.id));
					toast.success('Thành công', 'Đã xóa chỉ định chụp chiếu');
				} else {
					toast.error('Lỗi', result.message || 'Không thể xóa chỉ định');
				}
			} catch (error) {
				console.error('Error deleting imaging order:', error);
				toast.error('Lỗi', 'Đã xảy ra lỗi khi xóa chỉ định');
			}
		}
	};

	const handleSubmitOrder = async (data: Partial<ImagingOrder>) => {
		try {
			if (selectedOrder) {
				// Update existing order
				const updateData = {
					modalityRequested: data.modalityRequested,
					bodyPartRequested: data.bodyPartRequested,
					reasonForStudy: data.reasonForStudy,
					status: data.status,
				};

				const result = await imagingOrderService.update(selectedOrder.id, updateData);

				if (result.isSuccess && result.data) {
					setImagingOrders(prev => prev.map(o => (o.id === selectedOrder.id ? result.data! : o)));
					toast.success('Thành công', 'Đã cập nhật chỉ định chụp chiếu');
				} else {
					toast.error('Lỗi', result.message || 'Không thể cập nhật chỉ định');
					return;
				}
			} else {
				// Create new order
				const createData = {
					visitId: visitId,
					requestingDoctorId: data.requestingDoctorId || '',
					modalityRequested: data.modalityRequested || '',
					bodyPartRequested: data.bodyPartRequested || '',
					reasonForStudy: data.reasonForStudy || null,
				};

				const result = await imagingOrderService.create(createData);

				if (result.isSuccess && result.data) {
					setImagingOrders(prev => [result.data!, ...prev]);
					toast.success('Thành công', 'Đã tạo chỉ định chụp chiếu mới');
				} else {
					toast.error('Lỗi', result.message || 'Không thể tạo chỉ định');
					return;
				}
			}

			setIsOrderFormOpen(false);
			setSelectedOrder(null);
		} catch (error) {
			console.error('Error submitting imaging order:', error);
			toast.error('Lỗi', 'Đã xảy ra lỗi khi lưu chỉ định');
		}
	};

	const handleViewImages = (order: ImagingOrder) => {
		setSelectedOrderForImages(order);
	};

	const handleSaveExaminationNote = async () => {
		if (!examinationNote.diagnosis.trim()) {
			toast.warning('Cảnh báo', 'Vui lòng nhập chẩn đoán');
			return;
		}

		// Find a completed imaging order to get studyId
		const completedOrder = imagingOrders.find(order => order.status === 'Completed');
		if (!completedOrder?.studyId) {
			toast.warning('Cảnh báo', 'Cần có ít nhất một chỉ định hoàn thành để lưu chẩn đoán');

			return;
		}

		setIsSavingNote(true);
		try {
			if (diagnosisId) {
				// Update existing diagnosis
				const result = await diagnosisService.update(diagnosisId, {
					finalDiagnosis: examinationNote.diagnosis,
					treatmentPlan: examinationNote.treatment_plan,
					notes: examinationNote.notes,
					reportStatus: 'Draft',
				});

				if (result.isSuccess) {
					toast.success('Thành công', 'Đã cập nhật chẩn đoán');
				} else {
					toast.error('Lỗi', result.message || 'Không thể cập nhật chẩn đoán');
				}
			} else {
				// Create new diagnosis
				const result = await diagnosisService.create({
					studyId: completedOrder.studyId,
					finalDiagnosis: examinationNote.diagnosis,
					treatmentPlan: examinationNote.treatment_plan,
					notes: examinationNote.notes,
					reportStatus: 'Draft',
				});

				if (result.isSuccess && result.data) {
					setDiagnosisId(result.data.id);
					toast.success('Thành công', 'Đã lưu chẩn đoán');
				} else {
					toast.error('Lỗi', result.message || 'Không thể lưu chẩn đoán');
				}
			}
		} catch (error) {
			console.error('Error saving examination note:', error);
			toast.error('Lỗi', 'Đã xảy ra lỗi khi lưu chẩn đoán');
		} finally {
			setIsSavingNote(false);
		}
	};

	const getStatusBadge = (status: string) => {
		// Normalize status to lowercase for comparison
		const normalizedStatus = status?.toLowerCase();

		const statusConfig = {
			pending: { label: 'Chờ thực hiện', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
			in_progress: { label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-800 border-blue-200' },
			inprogress: { label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-800 border-blue-200' },
			completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800 border-green-200' },
			cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800 border-red-200' },
		};
		const config =
			statusConfig[normalizedStatus as keyof typeof statusConfig] || statusConfig.pending;
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
					<VisitHeader
						patientName={visit.patientName}
						patientCode={visit.patientCode}
						visitDate={visit.createdAt}
						doctorName={visit.doctorName}
						status={visit.status}
						onBack={() => router.back()}
						getStatusBadge={getStatusBadge}
					/>
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
						{/* Left Column - Patient History */}
						<div className="lg:col-span-3 space-y-4">
							<PatientInfoCard
								patientName={visit.patientName}
								patientCode={visit.patientCode}
								dateOfBirth={visit.patientDob}
								gender={visit.patientGender}
							/>{' '}
							<PreviousVisitsCard
								previousVisits={previousVisits}
								onVisitClick={loadPreviousVisitDetail}
							/>
						</div>

						{/* Center Column - Examination Notes */}
						<div className="lg:col-span-5">
							<ExaminationNoteCard
								symptoms={visit.symptoms || ''}
								examinationNote={examinationNote}
								isSavingNote={isSavingNote}
								onNoteChange={setExaminationNote}
								onSave={handleSaveExaminationNote}
							/>
						</div>
						{/* Right Column - Imaging Orders */}
						<div className="lg:col-span-4 space-y-6">
							<ImagingOrdersCard
								imagingOrders={imagingOrders}
								onAddOrder={handleAddOrder}
								onEditOrder={handleEditOrder}
								onDeleteOrder={handleDeleteOrder}
								onViewImages={handleViewImages}
								getStatusBadge={getStatusBadge}
							/>

							{/* DICOM Files Card - Show when an order is selected */}
							{selectedOrderForImages && <DicomFilesCard orderId={selectedOrderForImages.id} />}
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

					{/* Previous Visit Detail Dialog - Clean Minimal Style */}
					<Dialog
						open={isPreviousVisitDialogOpen}
						onOpenChange={open => {
							setIsPreviousVisitDialogOpen(open);
							if (!open) {
								setSelectedPreviousOrderId(null);
							}
						}}
					>
						<DialogContent className="w-[95vw] max-w-6xl h-[90vh] p-0 overflow-hidden bg-white gap-0">
							{isLoadingPreviousVisit ? (
								<div className="flex flex-col items-center justify-center h-full">
									<div className="relative mb-5">
										<div className="w-12 h-12 border-3 border-slate-200 rounded-full"></div>
										<div className="absolute top-0 left-0 w-12 h-12 border-3 border-slate-800 rounded-full border-t-transparent animate-spin"></div>
									</div>
									<p className="text-slate-600 font-medium">Đang tải...</p>
								</div>
							) : selectedPreviousVisit ? (
								<div className="flex flex-col h-full">
									{/* Clean Header */}
									<div className="border-b border-slate-200 shrink-0">
										<div className="px-8 py-5 flex items-center justify-between">
											<div>
												<h1 className="text-xl font-semibold text-slate-900">Hồ sơ bệnh án</h1>
												<p className="text-sm text-slate-500 mt-0.5">
													Mã:{' '}
													<span className="font-mono text-slate-700">
														{selectedPreviousVisit.id.slice(0, 8).toUpperCase()}
													</span>
												</p>
											</div>
											<div className="flex items-center gap-6 text-sm">
												<div className="text-right">
													<p className="text-slate-500">Ngày khám</p>
													<p className="font-medium text-slate-900">
														{new Date(selectedPreviousVisit.visitDate).toLocaleDateString('vi-VN', {
															day: '2-digit',
															month: '2-digit',
															year: 'numeric',
														})}{' '}
														-{' '}
														{new Date(selectedPreviousVisit.visitDate).toLocaleTimeString('vi-VN', {
															hour: '2-digit',
															minute: '2-digit',
														})}
													</p>
												</div>
												<div className="w-px h-8 bg-slate-200"></div>
												<div className="text-right">
													<p className="text-slate-500">Bác sĩ</p>
													<p className="font-medium text-slate-900">
														{selectedPreviousVisit.doctorName || '—'}
													</p>
												</div>
											</div>
										</div>
										{/* Navigation */}
										{selectedPreviousOrderId && (
											<div className="px-8 py-2 bg-slate-50 border-t border-slate-100">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => setSelectedPreviousOrderId(null)}
													className="h-7 px-2 text-slate-600 hover:text-slate-900"
												>
													<ChevronLeft className="h-4 w-4 mr-1" />
													Quay lại hồ sơ
												</Button>
											</div>
										)}
									</div>

									{/* Content Area */}
									<div className="flex-1 min-h-0 bg-slate-50">
										{selectedPreviousOrderId ? (
											/* DICOM Viewer View */
											<div className="h-full p-6 overflow-y-auto">
												<DicomFilesCard orderId={selectedPreviousOrderId} />
											</div>
										) : (
											/* Medical Record View */
											<div className="h-full overflow-y-auto">
												<div className="p-8">
													<div className="grid grid-cols-12 gap-8">
														{/* Left Column */}
														<div className="col-span-12 lg:col-span-7 space-y-6">
															{/* Symptoms */}
															<section className="bg-white rounded-lg border border-slate-200">
																<div className="px-5 py-4 border-b border-slate-100">
																	<h2 className="font-semibold text-slate-900">Lý do đến khám</h2>
																</div>
																<div className="p-5">
																	<p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
																		{selectedPreviousVisit.symptoms || 'Không có ghi nhận'}
																	</p>
																</div>
															</section>

															{/* Diagnosis */}
															<section className="bg-white rounded-lg border border-slate-200">
																<div className="px-5 py-4 border-b border-slate-100">
																	<h2 className="font-semibold text-slate-900">
																		Kết luận chẩn đoán
																	</h2>
																</div>
																<div className="p-5">
																	{selectedPreviousVisit.diagnosis ? (
																		<div className="space-y-5">
																			<div>
																				<p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
																					Chẩn đoán
																				</p>
																				<p className="text-slate-900 font-medium">
																					{selectedPreviousVisit.diagnosis.finalDiagnosis}
																				</p>
																			</div>
																			{selectedPreviousVisit.diagnosis.treatmentPlan && (
																				<div className="pt-4 border-t border-slate-100">
																					<p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
																						Phác đồ điều trị
																					</p>
																					<p className="text-slate-700 whitespace-pre-wrap">
																						{selectedPreviousVisit.diagnosis.treatmentPlan}
																					</p>
																				</div>
																			)}
																			{selectedPreviousVisit.diagnosis.notes && (
																				<div className="pt-4 border-t border-slate-100">
																					<p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
																						Ghi chú
																					</p>
																					<p className="text-slate-600 whitespace-pre-wrap">
																						{selectedPreviousVisit.diagnosis.notes}
																					</p>
																				</div>
																			)}
																		</div>
																	) : (
																		<p className="text-slate-500 text-center py-6">
																			Chưa có kết luận
																		</p>
																	)}
																</div>
															</section>
														</div>

														{/* Right Column - Imaging */}
														<div className="col-span-12 lg:col-span-5">
															<section className="bg-white rounded-lg border border-slate-200 sticky top-0 max-h-[calc(90vh-180px)] flex flex-col">
																<div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
																	<h2 className="font-semibold text-slate-900">
																		Chẩn đoán hình ảnh
																	</h2>
																	{selectedPreviousVisit.imagingOrders.length > 0 && (
																		<span className="text-sm text-slate-500">
																			{selectedPreviousVisit.imagingOrders.length} chỉ định
																		</span>
																	)}
																</div>
																<div className="p-4 overflow-y-auto flex-1">
																	{selectedPreviousVisit.imagingOrders.length > 0 ? (
																		<div className="space-y-2">
																			{selectedPreviousVisit.imagingOrders.map((order, idx) => {
																				const isCompleted =
																					order.status.toLowerCase() === 'completed';
																				return (
																					<div
																						key={order.id}
																						className={`rounded-lg border p-4 transition-all ${
																							isCompleted
																								? 'border-slate-300 hover:border-slate-400 hover:bg-slate-50 cursor-pointer'
																								: 'border-slate-200 bg-slate-50'
																						}`}
																						onClick={() => {
																							if (isCompleted) {
																								setSelectedPreviousOrderId(order.id);
																							}
																						}}
																					>
																						<div className="flex items-start gap-3">
																							<span className="shrink-0 w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
																								{idx + 1}
																							</span>
																							<div className="flex-1 min-w-0">
																								<div className="flex items-start justify-between gap-2">
																									<div>
																										<p className="font-medium text-slate-900">
																											{order.modalityRequested}
																										</p>
																										<p className="text-sm text-slate-500">
																											{order.bodyPartRequested}
																										</p>
																									</div>
																									{getStatusBadge(order.status)}
																								</div>
																								{order.reasonForStudy && (
																									<p className="text-xs text-slate-500 mt-2 line-clamp-2">
																										{order.reasonForStudy}
																									</p>
																								)}
																								{isCompleted && (
																									<div className="mt-3 pt-2 border-t border-slate-200 flex items-center gap-1.5 text-slate-600">
																										<Eye className="h-3.5 w-3.5" />
																										<span className="text-xs font-medium">
																											Xem hình ảnh
																										</span>
																									</div>
																								)}
																							</div>
																						</div>
																					</div>
																				);
																			})}
																		</div>
																	) : (
																		<p className="text-slate-500 text-center py-8">
																			Không có chỉ định
																		</p>
																	)}
																</div>
															</section>
														</div>
													</div>
												</div>
											</div>
										)}
									</div>
								</div>
							) : (
								<div className="flex flex-col items-center justify-center h-full">
									<FileText className="h-10 w-10 text-slate-300 mb-3" />
									<p className="text-slate-500">Không tìm thấy hồ sơ</p>
								</div>
							)}
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</DashboardLayout>
	);
}
