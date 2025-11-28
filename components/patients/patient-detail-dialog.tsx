'use client';

import React, { useEffect, useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientWithDetails } from '@/lib/types/patient';
import { formatDate, formatGender } from '@/lib/utils/date';
import { patientService } from '@/lib/api/services/patient.service';
import { useNotification } from '@/lib/contexts/notification-context';
import { toast } from 'sonner';

interface PatientDetailDialogProps {
	patientId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PatientDetailDialog({ patientId, open, onOpenChange }: PatientDetailDialogProps) {
	const [patient, setPatient] = useState<PatientWithDetails | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const { addNotification } = useNotification();

	useEffect(() => {
		if (open && patientId) {
			const fetchPatientDetails = async () => {
				setIsLoading(true);
				try {
					const result = await patientService.getById(patientId);
					if (result.isSuccess && result.data) {
						setPatient(result.data as PatientWithDetails);
					} else {
						toast.error('Không tìm thấy thông tin bệnh nhân.');
						onOpenChange(false);
					}
				} catch (error) {
					console.error('Failed to fetch patient details:', error);
					toast.error('Đã xảy ra lỗi khi tải thông tin bệnh nhân.');
					onOpenChange(false);
				} finally {
					setIsLoading(false);
				}
			};
			fetchPatientDetails();
		} else if (!open) {
			setPatient(null);
		}
	}, [open, patientId, onOpenChange, addNotification]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="!max-w-[85vw] !w-full !max-h-[90vh] overflow-y-auto sm:!max-w-[85vw] md:!max-w-[80vw] lg:!max-w-[75vw] xl:!max-w-[70vw] 2xl:!max-w-[65vw]">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold text-gray-900">Chi tiết bệnh nhân</DialogTitle>
					<DialogDescription className="text-base text-gray-600">
						Thông tin chi tiết và lịch sử khám bệnh
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="flex items-center justify-center h-64">
						<p>Đang tải...</p>
					</div>
				) : patient ? (
					<div className="space-y-6">
						{/* Thông tin cơ bản */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg font-semibold">Thông tin cơ bản</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-3 gap-6">
									<div>
										<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
											Mã bệnh nhân
										</p>
										<p className="font-semibold text-gray-900 text-base">{patient.patientCode}</p>
									</div>
									<div>
										<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
											Họ và tên
										</p>
										<p className="font-semibold text-gray-900 text-base">{patient.fullName}</p>
									</div>
									<div>
										<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
											Ngày sinh
										</p>
										<p className="font-semibold text-gray-900 text-base">
											{formatDate(patient.dateOfBirth)}
										</p>
									</div>
									<div>
										<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
											Giới tính
										</p>
										<p className="font-semibold text-gray-900 text-base">
											{formatGender(patient.gender)}
										</p>
									</div>
									<div>
										<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
											Số điện thoại
										</p>
										<p className="font-semibold text-gray-900 text-base">
											{patient.phoneNumber || 'N/A'}
										</p>
									</div>
									<div className="col-span-3">
										<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
											Địa chỉ
										</p>
										<p className="font-semibold text-gray-900 text-base">
											{patient.address || 'N/A'}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Lịch sử khám bệnh */}
						{patient.visits && patient.visits.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className="text-lg font-semibold">Lịch sử khám bệnh</CardTitle>
									<CardDescription className="text-sm">
										{patient.visits.length} lượt khám
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{patient.visits.map(visit => (
											<div
												key={visit.id}
												className="border border-gray-200 rounded-xl p-5 space-y-3 bg-gray-50/50 hover:bg-gray-50 transition-colors"
											>
												<div className="flex justify-between items-start">
													<div>
														<p className="font-medium">Ngày khám: {formatDate(visit.createdAt)}</p>
														<p className="text-sm text-muted-foreground">
															Trạng thái: {visit.status}
														</p>
													</div>
												</div>
												{visit.symptoms && (
													<div>
														<p className="text-sm text-muted-foreground">Triệu chứng:</p>
														<p className="text-sm">{visit.symptoms}</p>
													</div>
												)}
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Lịch sử chỉ định chụp */}
						{patient.imagingOrders && patient.imagingOrders.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className="text-lg font-semibold">Lịch sử chỉ định chụp</CardTitle>
									<CardDescription className="text-sm">
										{patient.imagingOrders.length} chỉ định
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{patient.imagingOrders.map(order => (
											<div
												key={order.id}
												className="border border-gray-200 rounded-xl p-5 space-y-3 bg-gray-50/50 hover:bg-gray-50 transition-colors"
											>
												<div className="flex justify-between items-start">
													<div>
														<p className="font-medium">
															{order.modalityRequested} - {order.bodyPartRequested}
														</p>
														<p className="text-sm text-muted-foreground">
															Ngày chỉ định: {formatDate(order.createdAt)}
														</p>
														<p className="text-sm text-muted-foreground">
															Trạng thái: {order.status}
														</p>
													</div>
												</div>
												{order.reasonForStudy && (
													<div>
														<p className="text-sm text-muted-foreground">Lý do chỉ định:</p>
														<p className="text-sm">{order.reasonForStudy}</p>
													</div>
												)}
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
