'use client';

import React, { useState, useEffect } from 'react';
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
import { ImagingOrderForm } from '@/components/patients/imaging-order-form';
import { VisitHeader } from '@/components/visits/visit-header';
import { PatientInfoCard } from '@/components/visits/patient-info-card';
import { PreviousVisitsCard } from '@/components/visits/previous-visits-card';
import { ExaminationNoteCard } from '@/components/visits/examination-note-card';
import { ImagingOrdersCard } from '@/components/visits/imaging-orders-card';
import { visitService } from '@/lib/api';
import { useNotification } from '@/lib/contexts';
import { NotificationType } from '@/lib/types/notification';

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

export default function VisitDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { addNotification } = useNotification();
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

				setImagingOrders([]);
			} else {
				addNotification(
					NotificationType.ERROR,
					'Lỗi',
					result.message || 'Không thể tải thông tin ca khám'
				);
			}
		} catch (error) {
			console.error('Error loading visit data:', error);
			addNotification(NotificationType.ERROR, 'Lỗi', 'Đã xảy ra lỗi khi tải thông tin ca khám');
		} finally {
			setIsLoading(false);
		}
	};

	const loadPreviousVisits = async (patientId: string) => {
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
				visitId: visitId,
				patientId: visit?.patientId || '',
				patientName: visit?.patientName || '',
				requestingDoctorId: data.requestingDoctorId || '',
				requestingDoctorName: visit?.doctorName || '',
				modalityRequested: data.modalityRequested || '',
				bodyPartRequested: data.bodyPartRequested || '',
				reasonForStudy: data.reasonForStudy || null,
				status: data.status || 'pending',
				createdAt: new Date().toISOString(),
				createdBy: data.requestingDoctorId || null,
				updatedAt: null,
				updatedBy: null,
				isDeleted: false,
				deletedAt: null,
				deletedBy: null,
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
							<PreviousVisitsCard previousVisits={previousVisits} />
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
						<div className="lg:col-span-4">
							<ImagingOrdersCard
								imagingOrders={imagingOrders}
								onAddOrder={handleAddOrder}
								onEditOrder={handleEditOrder}
								onDeleteOrder={handleDeleteOrder}
								getStatusBadge={getStatusBadge}
							/>
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
