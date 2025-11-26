'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle2, AlertCircle } from 'lucide-react';
import { OrderHeader } from '@/components/technician/order-header';
import { PatientInfoCard } from '@/components/technician/patient-info-card';
import { OrderDetailsCard } from '@/components/technician/order-details-card';
import { FileUploadZone } from '@/components/technician/file-upload-zone';
import { UploadedFilesList, UploadedFile } from '@/components/technician/uploaded-files-list';

interface ImagingOrder {
	id: string;
	visit_id: string;
	patient_name: string;
	patient_code: string;
	patient_gender: 'male' | 'female' | 'other';
	patient_age: number;
	patient_dob: string;
	modality_requested: string;
	body_part_requested: string;
	reason_for_study: string | null;
	requesting_doctor: string;
	status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
	priority: 'normal' | 'urgent' | 'stat';
	created_at: string;
	scheduled_time?: string;
	notes?: string;
}

export default function TechnicianOrderDetail() {
	const router = useRouter();
	const params = useParams();
	const orderId = params.id as string;

	const [order, setOrder] = useState<ImagingOrder | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);

	useEffect(() => {
		loadOrderDetail();
	}, [orderId]);

	const loadOrderDetail = async () => {
		setIsLoading(true);
		try {
			await new Promise(resolve => setTimeout(resolve, 500));

			// Mock data
			const mockOrder: ImagingOrder = {
				id: orderId,
				visit_id: 'visit1',
				patient_name: 'Nguyễn Văn A',
				patient_code: 'BN001',
				patient_gender: 'male',
				patient_age: 45,
				patient_dob: '1979-03-15',
				modality_requested: 'CT',
				body_part_requested: 'Đầu',
				reason_for_study:
					'Nghi ngờ chấn thương sọ não sau tai nạn giao thông. Bệnh nhân có tiền sử ngã xe, đau đầu, chóng mặt.',
				requesting_doctor: 'BS. Trần Thị B',
				status: 'pending',
				priority: 'urgent',
				created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
				notes: 'Yêu cầu chụp có tiêm thuốc cản quang. Kiểm tra chức năng thận trước khi tiêm.',
			};

			setOrder(mockOrder);

			// Auto-update status to in_progress
			if (mockOrder.status === 'pending') {
				setTimeout(() => {
					setOrder(prev => (prev ? { ...prev, status: 'in_progress' } : null));
				}, 1000);
			}
		} catch (error) {
			console.error('Error loading order:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const files = Array.from(e.dataTransfer.files);
		handleFiles(files);
	}, []);

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const files = Array.from(e.target.files);
			handleFiles(files);
		}
	};

	const handleFiles = (files: File[]) => {
		const newFiles: UploadedFile[] = files.map(file => ({
			id: Math.random().toString(36).substring(7),
			name: file.name,
			size: file.size,
			progress: 0,
			status: 'uploading',
		}));

		setUploadedFiles(prev => [...prev, ...newFiles]);

		// Simulate upload progress
		newFiles.forEach(file => {
			simulateUpload(file.id);
		});
	};

	const simulateUpload = (fileId: string) => {
		const interval = setInterval(() => {
			setUploadedFiles(prev =>
				prev.map(file => {
					if (file.id === fileId) {
						const newProgress = Math.min(file.progress + 10, 100);
						return {
							...file,
							progress: newProgress,
							status: newProgress === 100 ? 'completed' : 'uploading',
						};
					}
					return file;
				})
			);
		}, 200);

		setTimeout(() => clearInterval(interval), 2000);
	};

	const removeFile = (fileId: string) => {
		setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
	};

	const handleComplete = async () => {
		if (uploadedFiles.filter(f => f.status === 'completed').length === 0) {
			alert('Vui lòng upload ít nhất 1 file DICOM');
			return;
		}

		setIsProcessing(true);
		try {
			await new Promise(resolve => setTimeout(resolve, 1500));
			// Update status to completed
			alert('Hoàn thành chỉ định thành công!');
			router.push('/technician/worklist');
		} catch (error) {
			console.error('Error completing order:', error);
		} finally {
			setIsProcessing(false);
		}
	};

	if (isLoading) {
		return (
			<DashboardLayout>
				<div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
					<div className="flex items-center gap-3 text-slate-500">
						<div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
						<span>Đang tải thông tin...</span>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	if (!order) {
		return (
			<DashboardLayout>
				<div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
					<div className="text-center">
						<AlertCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
						<p className="text-slate-600 text-lg">Không tìm thấy chỉ định</p>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
				<div className="px-6 py-8">
					<OrderHeader
						orderId={order.id}
						priority={order.priority}
						modality={order.modality_requested}
						status={order.status}
					/>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Left Column - Patient Info & Order Details */}
						<div className="space-y-6">
							<PatientInfoCard
								patientName={order.patient_name}
								patientCode={order.patient_code}
								patientGender={order.patient_gender}
								patientAge={order.patient_age}
								patientDob={order.patient_dob}
							/>

							<OrderDetailsCard
								modalityRequested={order.modality_requested}
								bodyPartRequested={order.body_part_requested}
								requestingDoctor={order.requesting_doctor}
								createdAt={order.created_at}
								reasonForStudy={order.reason_for_study}
								notes={order.notes}
							/>
						</div>

						{/* Right Column - Upload */}
						<div className="lg:col-span-2">
							<Card className="border border-slate-200 bg-white shadow-lg">
								<CardHeader className="border-b border-slate-200 pb-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Camera className="h-5 w-5 text-blue-600" />
											<CardTitle className="text-base font-semibold text-slate-900">
												Upload ảnh chụp
											</CardTitle>
										</div>
										<div className="text-sm text-slate-500">
											{uploadedFiles.filter(f => f.status === 'completed').length} /{' '}
											{uploadedFiles.length} files
										</div>
									</div>
								</CardHeader>
								<CardContent className="p-6">
									<FileUploadZone
										isDragging={isDragging}
										onDragEnter={handleDragEnter}
										onDragLeave={handleDragLeave}
										onDragOver={handleDragOver}
										onDrop={handleDrop}
										onFileInput={handleFileInput}
									/>

									<UploadedFilesList files={uploadedFiles} onRemoveFile={removeFile} />

									{/* Action Buttons */}
									<div className="mt-8 flex items-center justify-end gap-3">
										<Button
											onClick={() => router.push('/technician/worklist')}
											variant="outline"
											className="border-slate-300 text-slate-700 hover:bg-slate-50"
										>
											Hủy
										</Button>
										<Button
											onClick={handleComplete}
											disabled={
												uploadedFiles.filter(f => f.status === 'completed').length === 0 ||
												isProcessing
											}
											className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg px-8"
										>
											{isProcessing ? (
												<>
													<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
													Đang xử lý...
												</>
											) : (
												<>
													<CheckCircle2 className="h-4 w-4 mr-2" />
													Hoàn thành chỉ định
												</>
											)}
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
