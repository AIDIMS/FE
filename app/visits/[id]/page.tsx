"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PatientVisit, ImagingOrder } from "@/lib/types/patient"
import { formatDate } from "@/lib/utils/date"
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
} from "lucide-react"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { ImagingOrderForm } from "@/components/patients/imaging-order-form"

interface VisitDetail extends PatientVisit {
	patient_name: string
	patient_code: string
	doctor_name?: string
}

export default function VisitDetailPage() {
	const params = useParams()
	const router = useRouter()
	const visitId = params.id as string

	const [visit, setVisit] = useState<VisitDetail | null>(null)
	const [imagingOrders, setImagingOrders] = useState<ImagingOrder[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)
	const [selectedOrder, setSelectedOrder] = useState<ImagingOrder | null>(null)

	useEffect(() => {
		loadVisitData()
	}, [visitId])

	const loadVisitData = async () => {
		setIsLoading(true)
		try {
			// Mock data - sẽ thay thế bằng API call
			await new Promise((resolve) => setTimeout(resolve, 500))

			const mockVisit: VisitDetail = {
				id: visitId,
				patient_id: "patient1",
				patient_name: "Nguyễn Văn A",
				patient_code: "BN001",
				assigned_doctor_id: "doc1",
				doctor_name: "BS. Trần Thị B",
				symptoms: "Đau đầu kéo dài, chóng mặt, buồn nôn",
				status: "in_progress",
				created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
				created_by: null,
				updated_at: null,
				updated_by: null,
				is_deleted: false,
				deleted_at: null,
				deleted_by: null,
			}

			const mockOrders: ImagingOrder[] = [
				{
					id: "order1",
					visit_id: visitId,
					requesting_doctor_id: "doc1",
					modality_requested: "CT",
					body_part_requested: "Đầu",
					reason_for_study: "Nghi ngờ chấn thương sọ não",
					status: "pending",
					created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
					created_by: "doc1",
					updated_at: null,
					updated_by: null,
					is_deleted: false,
					deleted_at: null,
					deleted_by: null,
				},
				{
					id: "order2",
					visit_id: visitId,
					requesting_doctor_id: "doc1",
					modality_requested: "X-Ray",
					body_part_requested: "Ngực",
					reason_for_study: "Kiểm tra phổi",
					status: "completed",
					created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
					created_by: "doc1",
					updated_at: null,
					updated_by: null,
					is_deleted: false,
					deleted_at: null,
					deleted_by: null,
				},
			]

			setVisit(mockVisit)
			setImagingOrders(mockOrders)
		} catch (error) {
			console.error("Error loading visit data:", error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleAddOrder = () => {
		setSelectedOrder(null)
		setIsOrderFormOpen(true)
	}

	const handleEditOrder = (order: ImagingOrder) => {
		setSelectedOrder(order)
		setIsOrderFormOpen(true)
	}

	const handleDeleteOrder = (order: ImagingOrder) => {
		if (confirm("Bạn có chắc chắn muốn xóa chỉ định này?")) {
			setImagingOrders((prev) => prev.filter((o) => o.id !== order.id))
		}
	}

	const handleSubmitOrder = async (data: Partial<ImagingOrder>) => {
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 800))

		if (selectedOrder) {
			// Update existing order
			setImagingOrders((prev) =>
				prev.map((o) =>
					o.id === selectedOrder.id
						? { ...o, ...data, updated_at: new Date().toISOString() }
						: o
				)
			)
		} else {
			// Create new order
			const newOrder: ImagingOrder = {
				id: Math.random().toString(36).substr(2, 9),
				visit_id: visitId,
				requesting_doctor_id: data.requesting_doctor_id || "",
				modality_requested: data.modality_requested || "",
				body_part_requested: data.body_part_requested || "",
				reason_for_study: data.reason_for_study || null,
				status: data.status || "pending",
				created_at: new Date().toISOString(),
				created_by: data.requesting_doctor_id || null,
				updated_at: null,
				updated_by: null,
				is_deleted: false,
				deleted_at: null,
				deleted_by: null,
			}
			setImagingOrders((prev) => [newOrder, ...prev])
		}

		setIsOrderFormOpen(false)
		setSelectedOrder(null)
	}

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			pending: { label: "Chờ thực hiện", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
			in_progress: { label: "Đang thực hiện", color: "bg-blue-100 text-blue-800 border-blue-200" },
			completed: { label: "Hoàn thành", color: "bg-green-100 text-green-800 border-green-200" },
			cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800 border-red-200" },
		}
		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
		return (
			<span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold border ${config.color}`}>
				{config.label}
			</span>
		)
	}

	if (isLoading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="flex items-center gap-2 text-gray-500">
						<svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Đang tải...
					</div>
				</div>
			</DashboardLayout>
		)
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
		)
	}

	return (
		<DashboardLayout>
			<div className="w-full px-6 py-6">
				{/* Header */}
				<div className="mb-6">
					<Button
						variant="ghost"
						onClick={() => router.back()}
						className="mb-4 text-gray-600 hover:text-gray-900"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Quay lại
					</Button>

					<div className="flex items-start justify-between mb-6">
						<div>
							<h1 className="text-2xl font-bold text-gray-900 mb-2">
								Chi tiết ca khám #{visit.id.slice(0, 8)}
							</h1>
							<div className="flex items-center gap-4 text-sm text-gray-600">
								<div className="flex items-center gap-2">
									<User className="h-4 w-4" />
									<span className="font-medium">{visit.patient_name}</span>
									<span className="text-gray-400">•</span>
									<span className="font-mono text-xs">{visit.patient_code}</span>
								</div>
								{visit.doctor_name && (
									<>
										<span className="text-gray-400">•</span>
										<div className="flex items-center gap-2">
											<Stethoscope className="h-4 w-4" />
											<span>{visit.doctor_name}</span>
										</div>
									</>
								)}
							</div>
						</div>
						<div className="flex items-center gap-3">
							{getStatusBadge(visit.status)}
						</div>
					</div>
				</div>

				{/* Thông tin ca khám */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
					<Card className="lg:col-span-2 border-gray-200">
						<CardHeader className="border-b border-gray-200 pb-4">
							<div className="flex items-center gap-2">
								<FileText className="h-5 w-5 text-blue-600" />
								<CardTitle className="text-base font-semibold text-gray-900">
									Thông tin ca khám
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="p-6">
							<div className="space-y-4">
								<div>
									<p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
										Triệu chứng
									</p>
									<p className="text-sm text-gray-900 leading-relaxed">
										{visit.symptoms || "Không có triệu chứng"}
									</p>
								</div>
								<div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
									<div>
										<p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
											Ngày khám
										</p>
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4 text-gray-400" />
											<p className="text-sm font-semibold text-gray-900">
												{formatDate(visit.created_at)}
											</p>
										</div>
									</div>
									<div>
										<p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
											Bác sĩ phụ trách
										</p>
										<div className="flex items-center gap-2">
											<User className="h-4 w-4 text-gray-400" />
											<p className="text-sm font-semibold text-gray-900">
												{visit.doctor_name || "Chưa chỉ định"}
											</p>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="border-gray-200">
						<CardHeader className="border-b border-gray-200 pb-4">
							<CardTitle className="text-base font-semibold text-gray-900">
								Tóm tắt
							</CardTitle>
						</CardHeader>
						<CardContent className="p-6">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-600">Chỉ định chụp chiếu</span>
									<span className="text-lg font-bold text-gray-900">{imagingOrders.length}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-600">Đang chờ</span>
									<span className="text-lg font-bold text-yellow-600">
										{imagingOrders.filter((o) => o.status === "pending").length}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-600">Hoàn thành</span>
									<span className="text-lg font-bold text-green-600">
										{imagingOrders.filter((o) => o.status === "completed").length}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Danh sách chỉ định chụp chiếu */}
				<Card className="border-gray-200">
					<CardHeader className="border-b border-gray-200 pb-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Camera className="h-5 w-5 text-blue-600" />
								<CardTitle className="text-base font-semibold text-gray-900">
									Chỉ định chụp chiếu
								</CardTitle>
							</div>
							<Button
								onClick={handleAddOrder}
								size="sm"
								className="bg-blue-600 hover:bg-blue-700 text-white"
							>
								<Plus className="h-4 w-4 mr-2" />
								Thêm chỉ định
							</Button>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						{imagingOrders.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
								<Camera className="h-12 w-12 text-gray-300 mb-3" />
								<p className="text-gray-500 text-sm mb-4">Chưa có chỉ định chụp chiếu nào</p>
								<Button
									onClick={handleAddOrder}
									variant="outline"
									size="sm"
								>
									<Plus className="h-4 w-4 mr-2" />
									Thêm chỉ định đầu tiên
								</Button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow className="border-b border-gray-200 bg-gray-50/50 hover:bg-transparent">
											<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
												Loại chụp
											</TableHead>
											<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
												Vùng chụp
											</TableHead>
											<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
												Trạng thái
											</TableHead>
											<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
												Lý do
											</TableHead>
											<TableHead className="w-12"></TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{imagingOrders.map((order) => (
											<TableRow
												key={order.id}
												className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors group"
											>
												<TableCell className="h-16">
													<div className="flex items-center gap-3">
														<div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
															<Camera className="h-5 w-5 text-purple-600" />
														</div>
														<span className="text-sm font-semibold text-gray-900">
															{order.modality_requested}
														</span>
													</div>
												</TableCell>
												<TableCell>
													<span className="text-sm text-gray-900">{order.body_part_requested}</span>
												</TableCell>
												<TableCell>{getStatusBadge(order.status)}</TableCell>
												<TableCell>
													<p className="text-sm text-gray-600 max-w-xs line-clamp-2">
														{order.reason_for_study || "—"}
													</p>
												</TableCell>
												<TableCell>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
															>
																<MoreVertical className="h-4 w-4" />
																<span className="sr-only">Mở menu</span>
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end" className="w-48">
															<DropdownMenuItem
																onClick={() => handleEditOrder(order)}
																className="cursor-pointer"
															>
																<Pencil className="mr-2 h-4 w-4" />
																Sửa
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																onClick={() => handleDeleteOrder(order)}
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

				{/* Order Form Dialog */}
				<Dialog open={isOrderFormOpen} onOpenChange={setIsOrderFormOpen}>
					<DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>
								{selectedOrder ? "Sửa chỉ định chụp chiếu" : "Thêm chỉ định chụp chiếu mới"}
							</DialogTitle>
							<DialogDescription>
								{selectedOrder
									? "Cập nhật thông tin chỉ định chụp chiếu"
									: "Điền thông tin để thêm chỉ định chụp chiếu mới cho ca khám"}
							</DialogDescription>
						</DialogHeader>
						<ImagingOrderForm
							visitId={visitId}
							order={selectedOrder}
							onSubmit={handleSubmitOrder}
							onCancel={() => {
								setIsOrderFormOpen(false)
								setSelectedOrder(null)
							}}
						/>
					</DialogContent>
				</Dialog>
			</div>
		</DashboardLayout>
	)
}
