"use client"

import React, { useState, useEffect } from "react"
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
import { PatientVisit } from "@/lib/types/patient"
import { Loader2 } from "lucide-react"

interface PatientVisitFormProps {
	patientId: string
	visit?: PatientVisit | null
	onSubmit: (data: Partial<PatientVisit>) => Promise<void>
	onCancel: () => void
}

export function PatientVisitForm({
	patientId,
	visit,
	onSubmit,
	onCancel,
}: PatientVisitFormProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [formData, setFormData] = useState({
		assigned_doctor_id: visit?.assigned_doctor_id || "",
		symptoms: visit?.symptoms || "",
		status: visit?.status || "waiting",
	})

	const [errors, setErrors] = useState<Record<string, string>>({})

	// Mock data - sẽ được thay thế bằng API call để lấy danh sách bác sĩ
	const mockDoctors = [
		{ id: "doc1", name: "BS. Nguyễn Văn A" },
		{ id: "doc2", name: "BS. Trần Thị B" },
		{ id: "doc3", name: "BS. Lê Văn C" },
	]

	const validateForm = () => {
		const newErrors: Record<string, string> = {}

		if (!formData.symptoms.trim()) {
			newErrors.symptoms = "Vui lòng nhập triệu chứng"
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
				patient_id: patientId,
			})
		} catch (error) {
			console.error("Error submitting visit:", error)
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
			{/* Assigned Doctor */}
			<div className="space-y-2">
				<Label htmlFor="assigned_doctor_id" className="text-sm font-medium text-gray-700">
					Bác sĩ phụ trách
					<span className="text-gray-400 ml-1 text-xs">(Tùy chọn)</span>
				</Label>
				<Select
					value={formData.assigned_doctor_id || undefined}
					onValueChange={(value) => handleChange("assigned_doctor_id", value)}
				>
					<SelectTrigger
						id="assigned_doctor_id"
						className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
					>
						<SelectValue placeholder="Chọn bác sĩ" />
					</SelectTrigger>
					<SelectContent>
						{mockDoctors.map((doctor) => (
							<SelectItem key={doctor.id} value={doctor.id}>
								{doctor.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Symptoms */}
			<div className="space-y-2">
				<Label htmlFor="symptoms" className="text-sm font-medium text-gray-700">
					Triệu chứng
					<span className="text-red-500 ml-1">*</span>
				</Label>
				<textarea
					id="symptoms"
					rows={4}
					placeholder="Mô tả triệu chứng của bệnh nhân..."
					value={formData.symptoms}
					onChange={(e) => handleChange("symptoms", e.target.value)}
					className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
						errors.symptoms
							? "border-red-300 focus:border-red-500 focus:ring-red-200"
							: "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
					}`}
				/>
				{errors.symptoms && (
					<p className="text-sm text-red-600 mt-1">{errors.symptoms}</p>
				)}
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
						<SelectItem value="waiting">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-yellow-500"></div>
								<span>Chờ khám</span>
							</div>
						</SelectItem>
						<SelectItem value="in_progress">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-blue-500"></div>
								<span>Đang xử lý</span>
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
						<>{visit ? "Cập nhật" : "Tạo ca khám"}</>
					)}
				</Button>
			</div>
		</form>
	)
}
