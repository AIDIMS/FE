"use client"

import React, { useId, useState, useEffect } from "react"
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
import { Patient, Gender } from "@/lib/types/patient"

interface PatientFormProps {
	patient?: Patient | null
	onSubmit: (data: Omit<Patient, "id" | "created_at" | "created_by" | "updated_at" | "updated_by" | "is_deleted" | "deleted_at" | "deleted_by">) => Promise<void>
	onCancel: () => void
	isLoading?: boolean
}

export function PatientForm({
	patient,
	onSubmit,
	onCancel,
	isLoading = false,
}: PatientFormProps) {
	const id = useId()

	const [formData, setFormData] = useState({
		patient_code: patient?.patient_code || "",
		full_name: patient?.full_name || "",
		date_of_birth: patient?.date_of_birth || "",
		gender: patient?.gender || "",
		phone: patient?.phone || "",
		address: patient?.address || "",
	})

	const [errors, setErrors] = useState<Record<string, string>>({})

	const validate = () => {
		const newErrors: Record<string, string> = {}

		if (!formData.patient_code.trim()) {
			newErrors.patient_code = "Mã bệnh nhân là bắt buộc"
		}

		if (!formData.full_name.trim()) {
			newErrors.full_name = "Họ và tên là bắt buộc"
		}

		if (formData.date_of_birth) {
			const dob = new Date(formData.date_of_birth)
			const today = new Date()
			if (dob > today) {
				newErrors.date_of_birth = "Ngày sinh không thể lớn hơn ngày hiện tại"
			}
		}

		if (formData.phone && !/^[0-9]{10,15}$/.test(formData.phone)) {
			newErrors.phone = "Số điện thoại không hợp lệ"
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!validate()) return

		await onSubmit({
			patient_code: formData.patient_code.trim(),
			full_name: formData.full_name.trim(),
			date_of_birth: formData.date_of_birth || null,
			gender: (formData.gender as Gender) || null,
			phone: formData.phone.trim() || null,
			address: formData.address.trim() || null,
		})
	}

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }))
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-5" noValidate>
			{/* Mã bệnh nhân */}
			<div className="space-y-2">
				<Label htmlFor={`${id}-patient_code`} className="text-sm font-medium">
					Mã bệnh nhân <span className="text-red-500">*</span>
				</Label>
				<Input
					id={`${id}-patient_code`}
					type="text"
					placeholder="VD: BN001"
					value={formData.patient_code}
					onChange={(e) => handleChange("patient_code", e.target.value)}
					onBlur={() => validate()}
					aria-invalid={!!errors.patient_code}
					required
					disabled={!!patient} // Không cho sửa mã bệnh nhân khi edit
					className={
						errors.patient_code
							? "border-red-500 focus:ring-red-500"
							: ""
					}
				/>
				{errors.patient_code && (
					<p className="text-sm text-red-600" role="alert">
						{errors.patient_code}
					</p>
				)}
			</div>

			{/* Họ và tên */}
			<div className="space-y-2">
				<Label htmlFor={`${id}-full_name`} className="text-sm font-medium">
					Họ và tên <span className="text-red-500">*</span>
				</Label>
				<Input
					id={`${id}-full_name`}
					type="text"
					placeholder="Nhập họ và tên"
					value={formData.full_name}
					onChange={(e) => handleChange("full_name", e.target.value)}
					onBlur={() => validate()}
					aria-invalid={!!errors.full_name}
					required
					className={
						errors.full_name ? "border-red-500 focus:ring-red-500" : ""
					}
				/>
				{errors.full_name && (
					<p className="text-sm text-red-600" role="alert">
						{errors.full_name}
					</p>
				)}
			</div>

			{/* Ngày sinh */}
			<div className="space-y-2">
				<Label htmlFor={`${id}-date_of_birth`} className="text-sm font-medium">
					Ngày sinh
				</Label>
				<Input
					id={`${id}-date_of_birth`}
					type="date"
					value={formData.date_of_birth}
					onChange={(e) => handleChange("date_of_birth", e.target.value)}
					onBlur={() => validate()}
					aria-invalid={!!errors.date_of_birth}
					className={
						errors.date_of_birth
							? "border-red-500 focus:ring-red-500"
							: ""
					}
				/>
				{errors.date_of_birth && (
					<p className="text-sm text-red-600" role="alert">
						{errors.date_of_birth}
					</p>
				)}
			</div>

			{/* Giới tính */}
			<div className="space-y-2">
				<Label htmlFor={`${id}-gender`} className="text-sm font-medium">
					Giới tính
				</Label>
				<Select
					value={formData.gender}
					onValueChange={(value: string) => handleChange("gender", value)}
				>
					<SelectTrigger id={`${id}-gender`}>
						<SelectValue placeholder="Chọn giới tính" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="male">Nam</SelectItem>
						<SelectItem value="female">Nữ</SelectItem>
						<SelectItem value="other">Khác</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Số điện thoại */}
			<div className="space-y-2">
				<Label htmlFor={`${id}-phone`} className="text-sm font-medium">
					Số điện thoại
				</Label>
				<Input
					id={`${id}-phone`}
					type="tel"
					placeholder="VD: 0901234567"
					value={formData.phone}
					onChange={(e) => handleChange("phone", e.target.value)}
					onBlur={() => validate()}
					aria-invalid={!!errors.phone}
					className={errors.phone ? "border-red-500 focus:ring-red-500" : ""}
				/>
				{errors.phone && (
					<p className="text-sm text-red-600" role="alert">
						{errors.phone}
					</p>
				)}
			</div>

			{/* Địa chỉ */}
			<div className="space-y-2">
				<Label htmlFor={`${id}-address`} className="text-sm font-medium">
					Địa chỉ
				</Label>
				<Input
					id={`${id}-address`}
					type="text"
					placeholder="Nhập địa chỉ"
					value={formData.address}
					onChange={(e) => handleChange("address", e.target.value)}
				/>
			</div>

			{/* Buttons */}
			<div className="flex gap-3 pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isLoading}
					className="flex-1"
				>
					Hủy
				</Button>
				<Button
					type="submit"
					disabled={isLoading}
					className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all"
				>
					{isLoading ? (
						<span className="flex items-center gap-2">
							<svg
								className="w-4 h-4 animate-spin"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
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
							Đang lưu...
						</span>
					) : patient ? (
						"Cập nhật"
					) : (
						"Thêm mới"
					)}
				</Button>
			</div>
		</form>
	)
}

