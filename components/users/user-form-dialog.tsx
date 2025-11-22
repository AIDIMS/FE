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
import {
	CreateUserDto,
	UpdateUserDto,
	UserListDto,
	UserRole,
	Department,
	NotificationType,
} from '@/lib/types';
import { useNotification } from '@/lib/contexts';

interface UserFormDialogProps {
	readonly open: boolean;
	readonly onOpenChange: (open: boolean) => void;
	readonly onSuccess: () => void;
	readonly user?: UserListDto | null;
}

export function UserFormDialog({ open, onOpenChange, onSuccess, user }: UserFormDialogProps) {
	const isEdit = !!user;

	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		firstName: '',
		lastName: '',
		phoneNumber: '',
		role: UserRole.Doctor,
		department: Department.Radiology,
	});

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const { addNotification } = useNotification();

	useEffect(() => {
		if (user) {
			setFormData({
				username: user.username,
				email: user.email,
				password: '',
				firstName: user.firstName,
				lastName: user.lastName,
				phoneNumber: user.phoneNumber || '',
				role: user.role,
				department: user.department,
			});
		} else {
			setFormData({
				username: '',
				email: '',
				password: '',
				firstName: '',
				lastName: '',
				phoneNumber: '',
				role: UserRole.Doctor,
				department: Department.Radiology,
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
					email: formData.email,
					firstName: formData.firstName,
					lastName: formData.lastName,
					phoneNumber: formData.phoneNumber || undefined,
					role: formData.role,
					department: formData.department,
				};

				const result = await userService.update(user.id, updateData);

				if (result.isSuccess) {
					onSuccess();
					handleShowSuccess('Thành công', 'Cập nhật người dùng thành công');
				} else {
					handleShowError('Lỗi', result.message || 'Cập nhật người dùng thất bại');
				}
			} else {
				if (!formData.password) {
					handleShowError('Lỗi', 'Vui lòng nhập mật khẩu');
					setIsLoading(false);
					return;
				}

				const createData: CreateUserDto = {
					username: formData.username,
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
					handleShowSuccess('Thành công', 'Tạo người dùng thành công');
					onSuccess();
				} else {
					handleShowError(
						'Lỗi',
						(result.message ?? '') + (result.errors ?? '') || 'Tạo người dùng thất bại'
					);
				}
			}
		} catch (err: { [key: string]: unknown } | unknown) {
			console.error('Error:', err);
			if (err && typeof err === 'object' && 'message' in err) {
				handleShowError('Lỗi', (err as Error).message);
			} else {
				handleShowError('Lỗi', 'Đã xảy ra lỗi. Vui lòng thử lại.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleShowError = (title: string, message: string) => {
		addNotification(NotificationType.ERROR, title, message);
	};

	const handleShowSuccess = (title: string, message: string) => {
		addNotification(NotificationType.SUCCESS, title, message);
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
						{/* Username */}
						<div className="grid gap-2">
							<Label htmlFor="username">Tên đăng nhập *</Label>
							<Input
								id="username"
								value={formData.username}
								onChange={e => setFormData({ ...formData, username: e.target.value })}
								required
								disabled={isEdit}
								placeholder="Nhập tên đăng nhập"
							/>
						</div>

						{/* Email */}
						<div className="grid gap-2">
							<Label htmlFor="email">Email *</Label>
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={e => setFormData({ ...formData, email: e.target.value })}
								required
								// disabled={isEdit}
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
										setFormData({ ...formData, role: Number.parseInt(value) as UserRole })
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
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="department">Phòng ban *</Label>
								<Select
									value={formData.department.toString()}
									onValueChange={value =>
										setFormData({ ...formData, department: Number.parseInt(value) as Department })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={Department.Radiology.toString()}>X-quang</SelectItem>
										<SelectItem value={Department.Cardiology.toString()}>Tim mạch</SelectItem>
										<SelectItem value={Department.Neurology.toString()}>Thần kinh</SelectItem>
										<SelectItem value={Department.Oncology.toString()}>Ung thư</SelectItem>
										<SelectItem value={Department.Pediatrics.toString()}>Nhi khoa</SelectItem>
										<SelectItem value={Department.Emergency.toString()}>Cấp cứu</SelectItem>
										<SelectItem value={Department.Orthopedics.toString()}>
											Chấn thương chỉnh hình
										</SelectItem>
										<SelectItem value={Department.GeneralMedicine.toString()}>
											Y học tổng quát
										</SelectItem>
										<SelectItem value={Department.PACS.toString()}>
											Quản lý hình ảnh y tế (PACS)
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

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
