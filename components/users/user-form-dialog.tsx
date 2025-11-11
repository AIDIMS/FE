'use client';

import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
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
import { userService } from '@/lib/api';
import { CreateUserDto, UpdateUserDto, UserListDto, UserRole, Department } from '@/lib/types';

interface UserFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
	user?: UserListDto | null;
}

export function UserFormDialog({ open, onOpenChange, onSuccess, user }: UserFormDialogProps) {
	const isEdit = !!user;

	const [formData, setFormData] = useState({
		email: '',
		password: '',
		firstName: '',
		lastName: '',
		phoneNumber: '',
		role: UserRole.Doctor,
		department: Department.Radiology,
		isActive: true,
	});

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (user) {
			setFormData({
				email: user.email,
				password: '',
				firstName: user.firstName,
				lastName: user.lastName,
				phoneNumber: user.phoneNumber || '',
				role: user.role,
				department: user.department,
				isActive: user.isActive,
			});
		} else {
			setFormData({
				email: '',
				password: '',
				firstName: '',
				lastName: '',
				phoneNumber: '',
				role: UserRole.Doctor,
				department: Department.Radiology,
				isActive: true,
			});
		}
		setError('');
	}, [user, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		try {
			if (isEdit && user) {
				const updateData: UpdateUserDto = {
					firstName: formData.firstName,
					lastName: formData.lastName,
					phoneNumber: formData.phoneNumber || undefined,
					isActive: formData.isActive,
					role: formData.role,
					department: formData.department,
				};

				const result = await userService.update(user.id, updateData);

				if (result.isSuccess) {
					onSuccess();
				} else {
					setError(result.message || 'Cập nhật người dùng thất bại');
				}
			} else {
				if (!formData.password) {
					setError('Vui lòng nhập mật khẩu');
					setIsLoading(false);
					return;
				}

				const createData: CreateUserDto = {
					email: formData.email,
					password: formData.password,
					firstName: formData.firstName,
					lastName: formData.lastName,
					phoneNumber: formData.phoneNumber || undefined,
					role: formData.role,
					department: formData.department,
				};

				const result = await userService.create(createData);

				if (result.isSuccess) {
					onSuccess();
				} else {
					setError(result.message || 'Tạo người dùng thất bại');
				}
			}
		} catch (err: unknown) {
			console.error('Error:', err);
			if (err && typeof err === 'object' && 'message' in err) {
				setError(err.message as string);
			} else {
				setError('Đã xảy ra lỗi. Vui lòng thử lại.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>{isEdit ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}</DialogTitle>
					<DialogDescription>
						{isEdit
							? 'Chỉnh sửa thông tin người dùng trong hệ thống.'
							: 'Tạo tài khoản người dùng mới cho hệ thống.'}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						{/* Email */}
						<div className="grid gap-2">
							<Label htmlFor="email">Email *</Label>
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={e => setFormData({ ...formData, email: e.target.value })}
								required
								disabled={isEdit}
								placeholder="user@example.com"
							/>
						</div>

						{/* Password (only for create) */}
						{!isEdit && (
							<div className="grid gap-2">
								<Label htmlFor="password">Mật khẩu *</Label>
								<Input
									id="password"
									type="password"
									value={formData.password}
									onChange={e => setFormData({ ...formData, password: e.target.value })}
									required
									placeholder="Nhập mật khẩu"
									minLength={6}
								/>
							</div>
						)}

						{/* First Name & Last Name */}
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="firstName">Họ và tên đệm *</Label>
								<Input
									id="firstName"
									value={formData.firstName}
									onChange={e => setFormData({ ...formData, firstName: e.target.value })}
									required
									placeholder="Nguyễn Văn"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="lastName">Tên *</Label>
								<Input
									id="lastName"
									value={formData.lastName}
									onChange={e => setFormData({ ...formData, lastName: e.target.value })}
									required
									placeholder="A"
								/>
							</div>
						</div>

						{/* Phone Number */}
						<div className="grid gap-2">
							<Label htmlFor="phoneNumber">Số điện thoại</Label>
							<Input
								id="phoneNumber"
								type="tel"
								value={formData.phoneNumber}
								onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
								placeholder="0123456789"
							/>
						</div>

						{/* Role & Department */}
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="role">Vai trò *</Label>
								<Select
									value={formData.role.toString()}
									onValueChange={value =>
										setFormData({ ...formData, role: parseInt(value) as UserRole })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={UserRole.Admin.toString()}>Quản trị viên</SelectItem>
										<SelectItem value={UserRole.Doctor.toString()}>Bác sĩ</SelectItem>
										<SelectItem value={UserRole.Radiologist.toString()}>
											Chuyên viên X-quang
										</SelectItem>
										<SelectItem value={UserRole.Technician.toString()}>Kỹ thuật viên</SelectItem>
										<SelectItem value={UserRole.Nurse.toString()}>Y tá</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="department">Phòng ban *</Label>
								<Select
									value={formData.department.toString()}
									onValueChange={value =>
										setFormData({ ...formData, department: parseInt(value) as Department })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={Department.Radiology.toString()}>X-quang</SelectItem>
										<SelectItem value={Department.Cardiology.toString()}>Tim mạch</SelectItem>
										<SelectItem value={Department.Neurology.toString()}>Thần kinh</SelectItem>
										<SelectItem value={Department.Orthopedics.toString()}>
											Chấn thương chỉnh hình
										</SelectItem>
										<SelectItem value={Department.Emergency.toString()}>Cấp cứu</SelectItem>
										<SelectItem value={Department.Other.toString()}>Khác</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Active Status (only for edit) */}
						{isEdit && (
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="isActive"
									checked={formData.isActive}
									onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
									className="h-4 w-4 rounded border-gray-300"
								/>
								<Label htmlFor="isActive" className="cursor-pointer">
									Tài khoản đang hoạt động
								</Label>
							</div>
						)}

						{/* Error Message */}
						{error && (
							<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
								{error}
							</div>
						)}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}
						>
							Hủy
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
