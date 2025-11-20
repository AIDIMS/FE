'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { Patient } from '@/lib/types/patient';

interface CheckInFormProps {
	patient: Patient;
	onSubmit: (data: CheckInFormData) => void;
	onCancel: () => void;
}

export interface CheckInFormData {
	patient_id: string;
	assigned_doctor_id?: string;
	symptoms: string;
	status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
}

export default function CheckInForm({ patient, onSubmit, onCancel }: CheckInFormProps) {
	const [formData, setFormData] = useState<CheckInFormData>({
		patient_id: patient.id,
		assigned_doctor_id: undefined,
		symptoms: '',
		status: 'waiting',
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Mock doctors list
	const doctors = [
		{ id: '1', name: 'BS. Nguyễn Văn A' },
		{ id: '2', name: 'BS. Trần Thị B' },
		{ id: '3', name: 'BS. Lê Văn C' },
		{ id: '4', name: 'BS. Phạm Thị D' },
	];

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.symptoms.trim()) {
			newErrors.symptoms = 'Vui lòng nhập lý do đến khám';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 800));
			onSubmit(formData);
		} catch (error) {
			console.error('Check-in error:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{/* Patient Info Display */}
			<div className="bg-slate-50 rounded-lg p-4 space-y-2">
				<div className="flex items-center justify-between">
					<span className="text-sm text-slate-600">Mã bệnh nhân:</span>
					<span className="font-semibold text-slate-900">{patient.patient_code}</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-sm text-slate-600">Họ và tên:</span>
					<span className="font-semibold text-slate-900">{patient.full_name}</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-sm text-slate-600">Số điện thoại:</span>
					<span className="font-semibold text-slate-900">{patient.phone}</span>
				</div>
			</div>

			{/* Doctor Selection (Optional) */}
			<div className="space-y-2">
				<Label htmlFor="doctor">
					Chọn bác sĩ <span className="text-slate-400 text-xs">(Tùy chọn)</span>
				</Label>
				<Select
					value={formData.assigned_doctor_id || undefined}
					onValueChange={value => setFormData({ ...formData, assigned_doctor_id: value })}
				>
					<SelectTrigger id="doctor">
						<SelectValue placeholder="Chọn bác sĩ hoặc để trống..." />
					</SelectTrigger>
					<SelectContent>
						{doctors.map(doctor => (
							<SelectItem key={doctor.id} value={doctor.id}>
								{doctor.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Symptoms */}
			<div className="space-y-2">
				<Label htmlFor="symptoms">
					Lý do đến khám <span className="text-red-500">*</span>
				</Label>
				<textarea
					id="symptoms"
					rows={4}
					className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					placeholder="Nhập triệu chứng, lý do đến khám của bệnh nhân..."
					value={formData.symptoms}
					onChange={e => setFormData({ ...formData, symptoms: e.target.value })}
				/>
				{errors.symptoms && <p className="text-sm text-red-500">{errors.symptoms}</p>}
			</div>

			{/* Form Actions */}
			<div className="flex gap-3 pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isSubmitting}
					className="flex-1"
				>
					Hủy
				</Button>
				<Button
					type="submit"
					disabled={isSubmitting}
					className="flex-1 bg-emerald-600 hover:bg-emerald-700"
				>
					{isSubmitting ? 'Đang tạo...' : 'Tạo Phiếu Khám'}
				</Button>
			</div>
		</form>
	);
}
