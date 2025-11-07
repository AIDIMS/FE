"use client"

import React from "react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PatientWithDetails } from "@/lib/types/patient"
import { formatDate, formatGender } from "@/lib/utils/date"

interface PatientDetailDialogProps {
	patient: PatientWithDetails | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function PatientDetailDialog({
	patient,
	open,
	onOpenChange,
}: PatientDetailDialogProps) {
	if (!patient) return null


	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Chi tiết bệnh nhân</DialogTitle>
					<DialogDescription>
						Thông tin chi tiết và lịch sử khám bệnh
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Thông tin cơ bản */}
					<Card>
						<CardHeader>
							<CardTitle>Thông tin cơ bản</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-muted-foreground">Mã bệnh nhân</p>
									<p className="font-medium">{patient.patient_code}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Họ và tên</p>
									<p className="font-medium">{patient.full_name}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Ngày sinh</p>
									<p className="font-medium">
										{formatDate(patient.date_of_birth)}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Giới tính</p>
									<p className="font-medium">{formatGender(patient.gender)}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Số điện thoại</p>
									<p className="font-medium">{patient.phone || "N/A"}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Địa chỉ</p>
									<p className="font-medium">{patient.address || "N/A"}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Lịch sử khám bệnh */}
					{patient.visits && patient.visits.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Lịch sử khám bệnh</CardTitle>
								<CardDescription>
									{patient.visits.length} lượt khám
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{patient.visits.map((visit) => (
										<div
											key={visit.id}
											className="border rounded-lg p-4 space-y-2"
										>
											<div className="flex justify-between items-start">
												<div>
													<p className="font-medium">
														Ngày khám: {formatDate(visit.created_at)}
													</p>
													<p className="text-sm text-muted-foreground">
														Trạng thái: {visit.status}
													</p>
												</div>
											</div>
											{visit.symptoms && (
												<div>
													<p className="text-sm text-muted-foreground">
														Triệu chứng:
													</p>
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
					{patient.imaging_orders && patient.imaging_orders.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Lịch sử chỉ định chụp</CardTitle>
								<CardDescription>
									{patient.imaging_orders.length} chỉ định
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{patient.imaging_orders.map((order) => (
										<div
											key={order.id}
											className="border rounded-lg p-4 space-y-2"
										>
											<div className="flex justify-between items-start">
												<div>
													<p className="font-medium">
														{order.modality_requested} - {order.body_part_requested}
													</p>
													<p className="text-sm text-muted-foreground">
														Ngày chỉ định: {formatDate(order.created_at)}
													</p>
													<p className="text-sm text-muted-foreground">
														Trạng thái: {order.status}
													</p>
												</div>
											</div>
											{order.reason_for_study && (
												<div>
													<p className="text-sm text-muted-foreground">
														Lý do chỉ định:
													</p>
													<p className="text-sm">{order.reason_for_study}</p>
												</div>
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}

