"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { ImagingOrder } from "@/lib/types/patient"
import { Loader2 } from "lucide-react"

interface ImagingOrderFormProps {
	visitId: string
	order?: ImagingOrder | null
	onSubmit: (data: Partial<ImagingOrder>) => Promise<void>
	onCancel: () => void
}

export function ImagingOrderForm({
	visitId,
	order,
	onSubmit,
	onCancel,
}: ImagingOrderFormProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [formData, setFormData] = useState({
		requesting_doctor_id: order?.requesting_doctor_id || "",
		modality_requested: order?.modality_requested || "",
		body_part_requested: order?.body_part_requested || "",
		reason_for_study: order?.reason_for_study || "",
		status: order?.status || "pending",
	})

	const [errors, setErrors] = useState<Record<string, string>>({})

	// Mock data - sẽ được thay thế bằng API call để lấy danh sách bác sĩ
	const mockDoctors = [
		{ id: "doc1", name: "BS. Nguyễn Văn A" },
		{ id: "doc2", name: "BS. Trần Thị B" },
		{ id: "doc3", name: "BS. Lê Văn C" },
	]

	// Danh sách các loại chụp phổ biến
	const modalityOptions = [
		{ value: "CT", label: "CT Scan" },
		{ value: "MRI", label: "MRI" },
		{ value: "X-Ray", label: "X-Ray" },
		{ value: "Ultrasound", label: "Siêu âm" },
		{ value: "PET", label: "PET Scan" },
		{ value: "Mammography", label: "Chụp nhũ ảnh" },
		{ value: "Fluoroscopy", label: "透視 (Fluoroscopy)" },
		{ value: "Nuclear", label: "Y học hạt nhân" },
	]

	// Danh sách vùng cơ thể phổ biến
	const bodyPartOptions = [
		"Đầu",
		"Cổ",
		"Ngực",
		"Bụng",
		"Xương chậu",
		"Tứ chi trên",
		"Tứ chi dưới",
		"Cột sống",
		"Tim",
		"Phổi",
		"Gan",
		"Thận",
		"Toàn thân",
	]

	const validateForm = () => {
		const newErrors: Record<string, string> = {}

		if (!formData.requesting_doctor_id) {
			newErrors.requesting_doctor_id = "Vui lòng chọn bác sĩ chỉ định"
		}

		if (!formData.modality_requested) {
			newErrors.modality_requested = "Vui lòng chọn loại chụp"
		}

		if (!formData.body_part_requested.trim()) {
			newErrors.body_part_requested = "Vui lòng nhập vùng cơ thể"
		}

		if (!formData.status) {
			newErrors.status = "Vui lòng chọn trạng thái"
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) {
			return
		}

		setIsLoading(true)
		try {
			await onSubmit({
				...formData,
				visit_id: visitId,
			})
		} catch (error) {
			console.error("Error submitting imaging order:", error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }))
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Requesting Doctor */}
			<div className="space-y-2">
				<Label htmlFor="requesting_doctor_id" className="text-sm font-medium text-gray-700">
					Bác sĩ chỉ định
					<span className="text-red-500 ml-1">*</span>
				</Label>
				<Select
					value={formData.requesting_doctor_id || undefined}
					onValueChange={(value) => handleChange("requesting_doctor_id", value)}
				>
					<SelectTrigger
						id="requesting_doctor_id"
						className={`w-full bg-white transition-colors ${
							errors.requesting_doctor_id
								? "border-red-300 focus:border-red-500 focus:ring-red-200"
								: "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
						}`}
					>
						<SelectValue placeholder="Chọn bác sĩ chỉ định" />
					</SelectTrigger>
					<SelectContent>
						{mockDoctors.map((doctor) => (
							<SelectItem key={doctor.id} value={doctor.id}>
								{doctor.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{errors.requesting_doctor_id && (
					<p className="text-sm text-red-600 mt-1">{errors.requesting_doctor_id}</p>
				)}
			</div>

			{/* Modality */}
			<div className="space-y-2">
				<Label htmlFor="modality_requested" className="text-sm font-medium text-gray-700">
					Loại chụp
					<span className="text-red-500 ml-1">*</span>
				</Label>
				<Select
					value={formData.modality_requested || undefined}
					onValueChange={(value) => handleChange("modality_requested", value)}
				>
					<SelectTrigger
						id="modality_requested"
						className={`w-full bg-white transition-colors ${
							errors.modality_requested
								? "border-red-300 focus:border-red-500 focus:ring-red-200"
								: "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
						}`}
					>
						<SelectValue placeholder="Chọn loại chụp" />
					</SelectTrigger>
					<SelectContent>
						{modalityOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{errors.modality_requested && (
					<p className="text-sm text-red-600 mt-1">{errors.modality_requested}</p>
				)}
			</div>

			{/* Body Part */}
			<div className="space-y-2">
				<Label htmlFor="body_part_requested" className="text-sm font-medium text-gray-700">
					Vùng cơ thể
					<span className="text-red-500 ml-1">*</span>
				</Label>
				<div className="space-y-2">
					<Input
						id="body_part_requested"
						type="text"
						placeholder="Nhập hoặc chọn vùng cơ thể"
						value={formData.body_part_requested}
						onChange={(e) => handleChange("body_part_requested", e.target.value)}
						className={`bg-white transition-colors ${
							errors.body_part_requested
								? "border-red-300 focus:border-red-500 focus:ring-red-200"
								: "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
						}`}
					/>
					{/* Quick select buttons */}
					<div className="flex flex-wrap gap-2">
						{bodyPartOptions.map((part) => (
							<button
								key={part}
								type="button"
								onClick={() => handleChange("body_part_requested", part)}
								className={`px-3 py-1 text-xs rounded-full border transition-colors ${
									formData.body_part_requested === part
										? "bg-blue-100 border-blue-300 text-blue-700"
										: "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
								}`}
							>
								{part}
							</button>
						))}
					</div>
				</div>
				{errors.body_part_requested && (
					<p className="text-sm text-red-600 mt-1">{errors.body_part_requested}</p>
				)}
			</div>

			{/* Reason for Study */}
			<div className="space-y-2">
				<Label htmlFor="reason_for_study" className="text-sm font-medium text-gray-700">
					Lý do chỉ định
					<span className="text-gray-400 ml-1 text-xs">(Tùy chọn)</span>
				</Label>
				<textarea
					id="reason_for_study"
					rows={4}
					placeholder="Mô tả lý do chỉ định chụp chiếu..."
					value={formData.reason_for_study}
					onChange={(e) => handleChange("reason_for_study", e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200 transition-colors resize-none"
				/>
			</div>

			{/* Status */}
			<div className="space-y-2">
				<Label htmlFor="status" className="text-sm font-medium text-gray-700">
					Trạng thái
					<span className="text-red-500 ml-1">*</span>
				</Label>
				<Select
					value={formData.status}
					onValueChange={(value) => handleChange("status", value)}
				>
					<SelectTrigger
						id="status"
						className={`w-full bg-white transition-colors ${
							errors.status
								? "border-red-300 focus:border-red-500 focus:ring-red-200"
								: "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
						}`}
					>
						<SelectValue placeholder="Chọn trạng thái" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="pending">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-yellow-500"></div>
								<span>Chờ thực hiện</span>
							</div>
						</SelectItem>
						<SelectItem value="in_progress">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-blue-500"></div>
								<span>Đang thực hiện</span>
							</div>
						</SelectItem>
						<SelectItem value="completed">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-green-500"></div>
								<span>Hoàn thành</span>
							</div>
						</SelectItem>
						<SelectItem value="cancelled">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-red-500"></div>
								<span>Đã hủy</span>
							</div>
						</SelectItem>
					</SelectContent>
				</Select>
				{errors.status && (
					<p className="text-sm text-red-600 mt-1">{errors.status}</p>
				)}
			</div>

			{/* Form Actions */}
			<div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isLoading}
					className="px-6"
				>
					Hủy
				</Button>
				<Button
					type="submit"
					disabled={isLoading}
					className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
				>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Đang lưu...
						</>
					) : (
						<>{order ? "Cập nhật" : "Tạo chỉ định"}</>
					)}
				</Button>
			</div>
		</form>
	)
}
