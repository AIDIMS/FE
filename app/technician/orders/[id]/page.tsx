'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle2 } from 'lucide-react';
import { OrderHeader } from '@/components/technician/order-header';
import { PatientInfoCard } from '@/components/technician/patient-info-card';
import { OrderDetailsCard } from '@/components/technician/order-details-card';
import { FileUploadZone } from '@/components/technician/file-upload-zone';
import { UploadedFilesList, UploadedFile } from '@/components/technician/uploaded-files-list';
import { imagingOrderService } from '@/lib/api/services/imaging-order.service';
import { patientService } from '@/lib/api/services/patient.service';
import { dicomService } from '@/lib/api/services/dicom.service';
import { TechnicianImagingOrder } from '@/lib/types/patient';
import dynamic from 'next/dynamic';

const DicomViewer = dynamic(() => import('@/components/technician/dicom-viewer'), {
	ssr: false,
	loading: () => <p>Loading Viewer...</p>,
});

export default function TechnicianOrderDetail() {
	const router = useRouter();
	const params = useParams();
	const orderId = params.id as string;

	const [order, setOrder] = useState<TechnicianImagingOrder | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [previewFile, setPreviewFile] = useState<File | null>(null);

	const loadOrderDetail = useCallback(async () => {
		setIsLoading(true);
		try {
			// Gọi API để lấy chi tiết order
			const result = await imagingOrderService.getById(orderId);

			if (!result.isSuccess || !result.data) {
				alert(result.message || 'Không thể tải thông tin chỉ định');
				router.push('/technician/worklist');
				return;
			}

			const orderData = result.data;

			let patientData = null;
			if (orderData.patientId) {
				try {
					const patientResult = await patientService.getById(orderData.patientId);
					if (patientResult.isSuccess && patientResult.data) {
						patientData = patientResult.data;
					}
				} catch (error) {
					console.error('Error loading patient data:', error);
				}
			}

			const calculateAge = (dateOfBirth: string | null): number => {
				if (!dateOfBirth) return 0;
				try {
					const birthDate = new Date(dateOfBirth);
					const today = new Date();
					let age = today.getFullYear() - birthDate.getFullYear();
					const monthDiff = today.getMonth() - birthDate.getMonth();
					if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
						age--;
					}
					return age;
				} catch {
					return 0;
				}
			};

			// Map gender string sang type
			const mapGender = (gender: string | null): 'male' | 'female' | 'other' => {
				if (!gender) return 'other';
				const lowerGender = gender.toLowerCase();
				if (lowerGender === 'male' || lowerGender === 'nam') return 'male';
				if (lowerGender === 'female' || lowerGender === 'nữ') return 'female';
				return 'other';
			};

			// Map dữ liệu từ API vào interface hiện tại
			const mappedOrder: TechnicianImagingOrder = {
				id: orderData.id,
				visit_id: orderData.visitId,
				patient_id: orderData.patientId,
				patient_name: orderData.patientName || patientData?.fullName || '',
				patient_code: patientData?.patientCode || '',
				patient_gender: mapGender(patientData?.gender || null),
				patient_age: calculateAge(patientData?.dateOfBirth || null),
				patient_dob: patientData?.dateOfBirth || '',
				modality_requested: orderData.modalityRequested || '',
				body_part_requested: orderData.bodyPartRequested || '',
				reason_for_study: orderData.reasonForStudy,
				requesting_doctor: orderData.requestingDoctorName || '',
				status:
					(orderData.status as 'pending' | 'in_progress' | 'completed' | 'cancelled') || 'pending',
				priority: 'normal', // API không trả về priority, để mặc định
				created_at: orderData.createdAt,
				notes: undefined, // API không trả về notes
			};

			setOrder(mappedOrder);
		} catch (error) {
			console.error('Error loading order:', error);
			alert('Đã xảy ra lỗi khi tải thông tin chỉ định');
			router.push('/technician/worklist');
		} finally {
			setIsLoading(false);
		}
	}, [orderId, router]);

	useEffect(() => {
		loadOrderDetail();
	}, [loadOrderDetail]);

	// --- File Processing Logic ---
	const processDicomFile = useCallback(
		async (file: File, fileId: string) => {
			try {
				setUploadedFiles(prev =>
					prev.map(f => {
						if (f.id === fileId) {
							return { ...f, progress: 30, status: 'uploading' as const };
						}
						return f;
					})
				);

				// Tạo metadata từ thông tin order
				const metadata = {
					patientName: order?.patient_name || 'DEMO^NGUYEN',
					patientID: order?.patient_id || 'MA_BENH_AN_456',
					accessionNumber: order?.id || 'MA_CHI_DINH_ORDER_123',
				};

				const formData = new FormData();
				formData.append('dicom_file', file);
				formData.append('metadata', JSON.stringify(metadata));

				setUploadedFiles(prev =>
					prev.map(f => {
						if (f.id === fileId) {
							return { ...f, progress: 50, status: 'uploading' as const };
						}
						return f;
					})
				);

				const response = await fetch(`${process.env.NEXT_PUBLIC_DICOM_PROCESS_URL}/process_dicom`, {
					method: 'POST',
					body: formData,
				});
				if (!response.ok) {
					throw new Error(`API error: ${response.status} ${response.statusText}`);
				}

				setUploadedFiles(prev =>
					prev.map(f => {
						if (f.id === fileId) {
							return { ...f, progress: 80, status: 'uploading' as const };
						}
						return f;
					})
				);

				// Lấy UIDs từ headers
				const newStudyUID = response.headers.get('X-New-Study-UID') || undefined;
				const newSeriesUID = response.headers.get('X-New-Series-UID') || undefined;

				// Lấy file đã xử lý từ response
				const blob = await response.blob();
				const processedFile = new File([blob], file.name, {
					type: 'application/dicom',
				});

				setUploadedFiles(prev =>
					prev.map(f => {
						if (f.id === fileId) {
							return {
								...f,
								progress: 100,
								status: 'completed' as const,
								processedFile,
								newStudyUID,
								newSeriesUID,
								fileObject: processedFile,
							};
						}
						return f;
					})
				);
			} catch (error) {
				console.error('Error processing DICOM file:', error);
				setUploadedFiles(prev =>
					prev.map(f => {
						if (f.id === fileId) {
							return {
								...f,
								status: 'error' as const,
							};
						}
						return f;
					})
				);
				alert(
					`Lỗi khi xử lý file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
				);
			}
		},
		[order]
	);

	const handleFiles = useCallback(
		(files: File[]) => {
			const validFiles = files.filter(
				f =>
					f.name.toLowerCase().endsWith('.dcm') ||
					f.name.toLowerCase().endsWith('.dicom') ||
					f.type === 'application/dicom'
			);

			if (validFiles.length < files.length) {
				alert('Đã bỏ qua một số file không đúng định dạng DICOM');
			}

			const newFiles: UploadedFile[] = validFiles.map(file => ({
				id: Math.random().toString(36).substring(7),
				name: file.name,
				size: file.size,
				progress: 0,
				status: 'uploading',
				fileObject: file, // Lưu file gốc tạm thời
			}));

			setUploadedFiles(prev => [...prev, ...newFiles]);

			// Xử lý từng file DICOM qua API
			newFiles.forEach(file => {
				processDicomFile(file.fileObject!, file.id);
			});
		},
		[processDicomFile]
	);

	// --- Drag & Drop Handlers ---
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

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);
			const files = Array.from(e.dataTransfer.files);
			handleFiles(files);
		},
		[handleFiles]
	);

	const handleFileInput = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files) {
				const files = Array.from(e.target.files);
				handleFiles(files);
			}
		},
		[handleFiles]
	);

	const removeFile = (fileId: string) => {
		setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
	};

	const uploadDicomFile = async (file: UploadedFile): Promise<void> => {
		if (!file.processedFile) {
			throw new Error(`File ${file.name} chưa được xử lý`);
		}

		if (!order) {
			throw new Error('Không tìm thấy thông tin chỉ định');
		}

		if (!order.patient_id) {
			throw new Error('Không tìm thấy ID bệnh nhân');
		}

		// Sử dụng DicomService để upload
		const result = await dicomService.upload({
			file: file.processedFile,
			orderId: order.id,
			patientId: order.patient_id,
		});

		if (!result.isSuccess) {
			throw new Error(result.message || 'Upload thất bại');
		}
	};

	const handleComplete = async () => {
		const completedFiles = uploadedFiles.filter(f => f.status === 'completed' && f.processedFile);

		if (completedFiles.length === 0) {
			alert('Vui lòng upload ít nhất 1 file DICOM đã được xử lý');
			return;
		}

		setIsProcessing(true);

		try {
			for (const file of completedFiles) {
				try {
					await uploadDicomFile(file);
				} catch (error) {
					console.error(`Error uploading file ${file.name}:`, error);
					throw error;
				}
			}

			alert('Hoàn thành chỉ định thành công!');
			router.push('/technician/worklist');
		} catch (error) {
			console.error('Error completing order:', error);
			alert(
				`Lỗi khi hoàn thành chỉ định: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		} finally {
			setIsProcessing(false);
		}
	};

	// --- Render ---

	if (isLoading) return <div className="p-8 text-center">Loading...</div>;
	if (!order) return <div className="p-8 text-center text-red-500">Order not found</div>;

	return (
		<>
			{previewFile && <DicomViewer file={previewFile} onClose={() => setPreviewFile(null)} />}

			<DashboardLayout>
				<div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
					<div className="px-6 py-8">
						<OrderHeader
							orderId={order.id}
							priority={order.priority}
							modality={order.modality_requested}
							status={order.status}
						/>

						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
							{/* Cột trái: Thông tin */}
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

							{/* Cột phải: Upload */}
							<div className="lg:col-span-2">
								<Card className="border border-slate-200 bg-white shadow-lg">
									<CardHeader className="border-b border-slate-200 pb-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<Camera className="h-5 w-5 text-blue-600" />
												<CardTitle className="text-base font-semibold text-slate-900">
													Upload ảnh DICOM
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

										{/* Component danh sách file có nút Preview */}
										<UploadedFilesList
											files={uploadedFiles}
											onRemoveFile={removeFile}
											onPreviewFile={file => setPreviewFile(file)}
										/>

										{/* Nút Action */}
										<div className="mt-8 flex items-center justify-end gap-3">
											<Button onClick={() => router.push('/technician/worklist')} variant="outline">
												Hủy
											</Button>
											<Button
												onClick={handleComplete}
												disabled={
													uploadedFiles.filter(f => f.status === 'completed').length === 0 ||
													isProcessing
												}
												className="bg-emerald-600 hover:bg-emerald-700 text-white"
											>
												{isProcessing ? (
													'Đang xử lý...'
												) : (
													<>
														<CheckCircle2 className="h-4 w-4 mr-2" />
														Hoàn thành
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
		</>
	);
}
