"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
	Camera, 
	ArrowLeft, 
	Upload, 
	FileText, 
	User, 
	Calendar,
	Clock,
	CheckCircle2,
	AlertCircle,
	X,
	Image as ImageIcon,
	Download,
	Eye
} from "lucide-react"
import { formatDate } from "@/lib/utils/date"

interface ImagingOrder {
	id: string
	visit_id: string
	patient_name: string
	patient_code: string
	patient_gender: "male" | "female" | "other"
	patient_age: number
	patient_dob: string
	modality_requested: string
	body_part_requested: string
	reason_for_study: string | null
	requesting_doctor: string
	status: "pending" | "in_progress" | "completed" | "cancelled"
	priority: "normal" | "urgent" | "stat"
	created_at: string
	scheduled_time?: string
	notes?: string
}

interface UploadedFile {
	id: string
	name: string
	size: number
	progress: number
	status: "uploading" | "completed" | "error"
	preview?: string
}

export default function TechnicianOrderDetail() {
	const router = useRouter()
	const params = useParams()
	const orderId = params.id as string

	const [order, setOrder] = useState<ImagingOrder | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
	const [isDragging, setIsDragging] = useState(false)
	const [isProcessing, setIsProcessing] = useState(false)

	useEffect(() => {
		loadOrderDetail()
	}, [orderId])

	const loadOrderDetail = async () => {
		setIsLoading(true)
		try {
			await new Promise((resolve) => setTimeout(resolve, 500))

			// Mock data
			const mockOrder: ImagingOrder = {
				id: orderId,
				visit_id: "visit1",
				patient_name: "Nguyễn Văn A",
				patient_code: "BN001",
				patient_gender: "male",
				patient_age: 45,
				patient_dob: "1979-03-15",
				modality_requested: "CT",
				body_part_requested: "Đầu",
				reason_for_study: "Nghi ngờ chấn thương sọ não sau tai nạn giao thông. Bệnh nhân có tiền sử ngã xe, đau đầu, chóng mặt.",
				requesting_doctor: "BS. Trần Thị B",
				status: "pending",
				priority: "urgent",
				created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
				notes: "Yêu cầu chụp có tiêm thuốc cản quang. Kiểm tra chức năng thận trước khi tiêm.",
			}

			setOrder(mockOrder)

			// Auto-update status to in_progress
			if (mockOrder.status === "pending") {
				setTimeout(() => {
					setOrder((prev) => prev ? { ...prev, status: "in_progress" } : null)
				}, 1000)
			}
		} catch (error) {
			console.error("Error loading order:", error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(true)
	}, [])

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(false)
	}, [])

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
	}, [])

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(false)

		const files = Array.from(e.dataTransfer.files)
		handleFiles(files)
	}, [])

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const files = Array.from(e.target.files)
			handleFiles(files)
		}
	}

	const handleFiles = (files: File[]) => {
		const newFiles: UploadedFile[] = files.map((file) => ({
			id: Math.random().toString(36).substring(7),
			name: file.name,
			size: file.size,
			progress: 0,
			status: "uploading",
		}))

		setUploadedFiles((prev) => [...prev, ...newFiles])

		// Simulate upload progress
		newFiles.forEach((file) => {
			simulateUpload(file.id)
		})
	}

	const simulateUpload = (fileId: string) => {
		const interval = setInterval(() => {
			setUploadedFiles((prev) =>
				prev.map((file) => {
					if (file.id === fileId) {
						const newProgress = Math.min(file.progress + 10, 100)
						return {
							...file,
							progress: newProgress,
							status: newProgress === 100 ? "completed" : "uploading",
						}
					}
					return file
				})
			)
		}, 200)

		setTimeout(() => clearInterval(interval), 2000)
	}

	const removeFile = (fileId: string) => {
		setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
	}

	const formatFileSize = (bytes: number) => {
		if (bytes < 1024) return bytes + " B"
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
		return (bytes / (1024 * 1024)).toFixed(1) + " MB"
	}

	const handleComplete = async () => {
		if (uploadedFiles.filter((f) => f.status === "completed").length === 0) {
			alert("Vui lòng upload ít nhất 1 file DICOM")
			return
		}

		setIsProcessing(true)
		try {
			await new Promise((resolve) => setTimeout(resolve, 1500))
			// Update status to completed
			alert("Hoàn thành chỉ định thành công!")
			router.push("/technician/worklist")
		} catch (error) {
			console.error("Error completing order:", error)
		} finally {
			setIsProcessing(false)
		}
	}

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
		)
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
		)
	}

	const getPriorityBadge = (priority: string) => {
		switch (priority) {
			case "stat":
				return (
					<span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold uppercase rounded-lg border border-red-300">
						STAT
					</span>
				)
			case "urgent":
				return (
					<span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase rounded-lg border border-orange-300">
						Urgent
					</span>
				)
			default:
				return (
					<span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs uppercase rounded-lg border border-slate-300">
						Normal
					</span>
				)
		}
	}

	return (
		<DashboardLayout>
			<div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
				<div className="px-6 py-8">
					{/* Header */}
					<div className="mb-8">
						<Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="mb-6 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Quay lại
                        </Button>

						<div className="flex items-start justify-between">
							<div>
								<div className="flex items-center gap-3 mb-2">
									<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
										Thực hiện chỉ định
									</h1>
									{getPriorityBadge(order.priority)}
									<span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-lg border border-blue-300">
										{order.modality_requested}
									</span>
								</div>
								<p className="text-slate-600">
									Mã chỉ định: <span className="font-mono text-slate-900">{order.id}</span>
								</p>
							</div>

							<div className="flex items-center gap-3">
								<div className="text-right">
									<p className="text-xs text-slate-500 mb-1">Trạng thái</p>
									<div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-lg border border-blue-300">
										<div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
										<span className="text-sm font-medium text-blue-700">
											{order.status === "in_progress" ? "Đang thực hiện" : "Chờ thực hiện"}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Left Column - Patient Info & Order Details */}
						<div className="space-y-6">
							{/* Patient Info Card */}
							<Card className="border border-slate-200 bg-white shadow-lg">
								<CardHeader className="border-b border-slate-200 pb-4">
									<div className="flex items-center gap-2">
										<User className="h-5 w-5 text-blue-600" />
										<CardTitle className="text-base font-semibold text-slate-900">
											Thông tin bệnh nhân
										</CardTitle>
									</div>
								</CardHeader>
								<CardContent className="p-6 space-y-4">
									<div>
										<p className="text-xs text-slate-500 mb-1">Họ tên</p>
										<p className="text-lg font-semibold text-slate-900">{order.patient_name}</p>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-xs text-slate-500 mb-1">Mã BN</p>
											<p className="font-mono text-sm text-slate-700">{order.patient_code}</p>
										</div>
										<div>
											<p className="text-xs text-slate-500 mb-1">Tuổi</p>
											<p className="text-sm text-slate-700">{order.patient_age} tuổi</p>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-xs text-slate-500 mb-1">Giới tính</p>
											<p className="text-sm text-slate-700">
												{order.patient_gender === "male" ? "Nam" : "Nữ"}
											</p>
										</div>
										<div>
											<p className="text-xs text-slate-500 mb-1">Ngày sinh</p>
											<p className="text-sm text-slate-700">{formatDate(order.patient_dob)}</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Order Details Card */}
							<Card className="border border-slate-200 bg-white shadow-lg">
								<CardHeader className="border-b border-slate-200 pb-4">
									<div className="flex items-center gap-2">
										<FileText className="h-5 w-5 text-blue-600" />
										<CardTitle className="text-base font-semibold text-slate-900">
											Chi tiết chỉ định
										</CardTitle>
									</div>
								</CardHeader>
								<CardContent className="p-6 space-y-4">
									<div>
										<p className="text-xs text-slate-500 mb-1">Loại máy</p>
										<p className="text-lg font-bold text-blue-600">{order.modality_requested}</p>
									</div>
									<div>
										<p className="text-xs text-slate-500 mb-1">Vùng chụp</p>
										<p className="text-base text-slate-900 font-medium">{order.body_part_requested}</p>
									</div>
									<div>
										<p className="text-xs text-slate-500 mb-1">Bác sĩ chỉ định</p>
										<p className="text-sm text-slate-700">{order.requesting_doctor}</p>
									</div>
									<div>
										<p className="text-xs text-slate-500 mb-1">Thời gian tạo</p>
										<div className="flex items-center gap-2 text-sm text-slate-700">
											<Clock className="h-4 w-4" />
											<span>{formatDate(order.created_at)}</span>
										</div>
									</div>
									<div>
										<p className="text-xs text-slate-500 mb-2">Lý do khám</p>
										<div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
											<p className="text-sm text-slate-700 leading-relaxed">
												{order.reason_for_study || "Không có"}
											</p>
										</div>
									</div>
									{order.notes && (
										<div>
											<p className="text-xs text-slate-500 mb-2">Ghi chú đặc biệt</p>
											<div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
												<p className="text-sm text-amber-800 leading-relaxed">{order.notes}</p>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
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
											{uploadedFiles.filter((f) => f.status === "completed").length} /{" "}
											{uploadedFiles.length} files
										</div>
									</div>
								</CardHeader>
								<CardContent className="p-6">
									{/* Upload Dropzone */}
									<div
										onDragEnter={handleDragEnter}
										onDragOver={handleDragOver}
										onDragLeave={handleDragLeave}
										onDrop={handleDrop}
										className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
											isDragging
												? "border-blue-500 bg-blue-50"
												: "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50"
										}`}
									>
										<input
											type="file"
											id="file-upload"
											multiple
											accept=".dcm,.dicom,image/*"
											onChange={handleFileInput}
											className="hidden"
										/>
										<label htmlFor="file-upload" className="cursor-pointer">
											<div className="flex flex-col items-center gap-4">
												<div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
													<Upload className="h-8 w-8 text-blue-600" />
												</div>
												<div>
													<p className="text-lg font-semibold text-slate-900 mb-1">
														Kéo thả file hoặc click để chọn
													</p>
													<p className="text-sm text-slate-500">
														Hỗ trợ: DICOM (.dcm, .dicom), JPEG, PNG
													</p>
												</div>
												<Button
													type="button"
													className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
												>
													<Upload className="h-4 w-4 mr-2" />
													Chọn file
												</Button>
											</div>
										</label>
									</div>

									{/* Uploaded Files List */}
									{uploadedFiles.length > 0 && (
										<div className="mt-6 space-y-3">
											<h3 className="text-sm font-semibold text-slate-700 mb-3">
												Danh sách file đã upload
											</h3>
											{uploadedFiles.map((file) => (
												<div
													key={file.id}
													className="p-4 bg-slate-50 rounded-lg border border-slate-200"
												>
													<div className="flex items-start justify-between mb-2">
														<div className="flex items-start gap-3 flex-1 min-w-0">
															<div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
																<ImageIcon className="h-5 w-5 text-blue-600" />
															</div>
															<div className="flex-1 min-w-0">
																<p className="text-sm font-medium text-slate-900 truncate">
																	{file.name}
																</p>
																<p className="text-xs text-slate-500">
																	{formatFileSize(file.size)}
																</p>
															</div>
														</div>
														<div className="flex items-center gap-2">
															{file.status === "completed" && (
																<CheckCircle2 className="h-5 w-5 text-emerald-600" />
															)}
															{file.status === "error" && (
																<AlertCircle className="h-5 w-5 text-red-500" />
															)}
															<button
																onClick={() => removeFile(file.id)}
																className="text-slate-400 hover:text-red-500 transition-colors"
															>
																<X className="h-5 w-5" />
															</button>
														</div>
													</div>
													{file.status === "uploading" && (
														<div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
															<div
																className="h-full bg-blue-600 transition-all duration-300"
																style={{ width: `${file.progress}%` }}
															></div>
														</div>
													)}
												</div>
											))}
										</div>
									)}

									{/* Action Buttons */}
									<div className="mt-8 flex items-center justify-end gap-3">
										<Button
											onClick={() => router.push("/technician/worklist")}
											variant="outline"
											className="border-slate-300 text-slate-700 hover:bg-slate-50"
										>
											Hủy
										</Button>
										<Button
											onClick={handleComplete}
											disabled={
												uploadedFiles.filter((f) => f.status === "completed").length === 0 ||
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
	)
}
