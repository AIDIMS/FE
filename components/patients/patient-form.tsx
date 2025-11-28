'use client';

import React, { useId, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Patient, Gender, CreatePatientDto, UpdatePatientDto } from '@/lib/types/patient';
import { patientService } from '@/lib/api/services/patient.service';
import { toast } from '@/lib/utils/toast';

interface PatientFormProps {
	patient?: Patient | null;
	onSubmit?: (patient: Patient) => void;
	onCancel: () => void;
}

export function PatientForm({ patient, onSubmit, onCancel }: PatientFormProps) {
	const id = useId();
	const [isLoading, setIsLoading] = useState(false);

	const [formData, setFormData] = useState({
		fullName: patient?.fullName || '',
		gender: patient?.gender || '',
		phoneNumber: patient?.phoneNumber || '',
		address: patient?.address || '',
	});
	const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
		patient?.dateOfBirth ? new Date(patient.dateOfBirth) : undefined
	);

	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.fullName.trim()) {
			newErrors.fullName = 'Họ và tên là bắt buộc';
		}

		if (dateOfBirth) {
			const today = new Date();
			if (dateOfBirth > today) {
				newErrors.dateOfBirth = 'Ngày sinh không thể là ngày tương lai';
			}
		}

		if (formData.phoneNumber && !/^[0-9]{10,15}$/.test(formData.phoneNumber)) {
			newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		setIsLoading(true);

		try {
			const formatDateForBackend = (date: Date | undefined): string | null => {
				if (!date) return null;
				try {
					const utcDate = new Date(
						Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
					);
					return utcDate.toISOString();
				} catch {
					return null;
				}
			};

			if (patient) {
				const updateData: UpdatePatientDto = {
					fullName: formData.fullName.trim(),
					dateOfBirth: formatDateForBackend(dateOfBirth),
					gender: (formData.gender as Gender) || null,
					phoneNumber: formData.phoneNumber.trim() || null,
					address: formData.address.trim() || null,
				};

				const result = await patientService.update(patient.id, updateData);

				if (result.isSuccess && result.data) {
					toast.success('Cập nhật thông tin bệnh nhân thành công');
					onSubmit?.(result.data);
				} else {
					toast.error(result.message || 'Cập nhật thông tin bệnh nhân thất bại');
				}
			} else {
				// Create new patient
				const createData: CreatePatientDto = {
					fullName: formData.fullName.trim(),
					dateOfBirth: formatDateForBackend(dateOfBirth),
					gender: (formData.gender as Gender) || null,
					phoneNumber: formData.phoneNumber.trim() || null,
					address: formData.address.trim() || null,
				};

				const result = await patientService.create(createData);

				if (result.isSuccess && result.data) {
					toast.success('Thêm bệnh nhân mới thành công');
					onSubmit?.(result.data);
				} else {
					toast.error(result.message || 'Thêm bệnh nhân mới thất bại');
				}
			}
		} catch (error) {
			console.error('Error submitting patient form:', error);
			toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleChange = (field: string, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }));
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6" noValidate>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Họ và tên */}
				<div className="space-y-2">
					<Label htmlFor={`${id}-fullName`} className="text-sm font-medium text-gray-700">
						Họ và tên <span className="text-red-500">*</span>
					</Label>
					<Input
						id={`${id}-fullName`}
						type="text"
						placeholder="Nhập họ và tên"
						value={formData.fullName}
						onChange={e => handleChange('fullName', e.target.value)}
						onBlur={() => validate()}
						aria-invalid={!!errors.fullName}
						required
						className={errors.fullName ? 'border-red-500 focus:ring-red-500' : ''}
					/>
					{errors.fullName && (
						<p className="text-sm text-red-600" role="alert">
							{errors.fullName}
						</p>
					)}
				</div>
				{/* Ngày sinh */}
				<div className="space-y-2">
					<Label htmlFor={`${id}-dateOfBirth`} className="text-sm font-medium text-gray-700">
						Ngày sinh
					</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								id={`${id}-dateOfBirth`}
								variant={'outline'}
								type="button"
								className={cn(
									'w-full justify-start text-left font-normal hover:bg-transparent',
									!dateOfBirth && 'text-muted-foreground',
									errors.dateOfBirth && 'border-red-500'
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{dateOfBirth ? format(dateOfBirth, 'dd/MM/yyyy') : <span>Chọn ngày sinh</span>}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={dateOfBirth}
								onSelect={date => {
									setDateOfBirth(date);
									if (errors.dateOfBirth) {
										setErrors(prev => ({ ...prev, dateOfBirth: '' }));
									}
								}}
								initialFocus
								disabled={date => date > new Date() || date < new Date('1900-01-01')}
								captionLayout="dropdown"
								fromYear={1900}
								toYear={new Date().getFullYear()}
							/>
						</PopoverContent>
					</Popover>
					{errors.dateOfBirth && (
						<p className="text-sm text-red-600" role="alert">
							{errors.dateOfBirth}
						</p>
					)}
				</div>{' '}
				{/* Giới tính */}
				<div className="space-y-2">
					<Label htmlFor={`${id}-gender`} className="text-sm font-medium text-gray-700">
						Giới tính
					</Label>
					<Select
						value={formData.gender}
						onValueChange={(value: string) => handleChange('gender', value)}
					>
						<SelectTrigger id={`${id}-gender`}>
							<SelectValue placeholder="Chọn giới tính" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="0">Nam</SelectItem>
							<SelectItem value="1">Nữ</SelectItem>
							<SelectItem value="2">Khác</SelectItem>
						</SelectContent>
					</Select>
				</div>
				{/* Số điện thoại */}
				<div className="space-y-2">
					<Label htmlFor={`${id}-phone`} className="text-sm font-medium text-gray-700">
						Số điện thoại
					</Label>
					<Input
						id={`${id}-phone`}
						type="tel"
						placeholder="VD: 0901234567"
						value={formData.phoneNumber}
						onChange={e => handleChange('phoneNumber', e.target.value)}
						onBlur={() => validate()}
						aria-invalid={!!errors.phone}
						className={errors.phone ? 'border-red-500 focus:ring-red-500' : ''}
					/>
					{errors.phone && (
						<p className="text-sm text-red-600" role="alert">
							{errors.phone}
						</p>
					)}
				</div>
			</div>

			{/* Địa chỉ - Full width */}
			<div className="space-y-2">
				<Label htmlFor={`${id}-address`} className="text-sm font-medium text-gray-700">
					Địa chỉ
				</Label>
				<Input
					id={`${id}-address`}
					type="text"
					placeholder="Nhập địa chỉ"
					value={formData.address}
					onChange={e => handleChange('address', e.target.value)}
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
							<svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
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
						'Cập nhật'
					) : (
						'Thêm mới'
					)}
				</Button>
			</div>
		</form>
	);
}
