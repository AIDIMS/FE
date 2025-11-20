'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
	User,
	Mail,
	Phone,
	Briefcase,
	Building2,
	Calendar,
	Shield,
	Lock,
	Edit2,
	Save,
	X,
	CheckCircle2,
} from 'lucide-react';
import { getRoleName, getDepartmentName } from '@/lib/utils/role';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { authService, userService } from '@/lib/api';

export function ProfileView() {
	const { user } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);

	const [formData, setFormData] = useState({
		firstName: user?.firstName || '',
		lastName: user?.lastName || '',
		email: user?.email || '',
		phoneNumber: user?.phoneNumber || '',
	});

	const [passwordData, setPasswordData] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});

	const [errors, setErrors] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phoneNumber: '',
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});

	const handleEdit = () => {
		setIsEditing(true);
		setFormData({
			firstName: user?.firstName || '',
			lastName: user?.lastName || '',
			email: user?.email || '',
			phoneNumber: user?.phoneNumber || '',
		});
	};

	const handleCancel = () => {
		setIsEditing(false);
		setErrors({
			firstName: '',
			lastName: '',
			email: '',
			phoneNumber: '',
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		});
	};

	const validateForm = () => {
		const newErrors = {
			firstName: '',
			lastName: '',
			email: '',
			phoneNumber: '',
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		};
		let isValid = true;

		if (!formData.firstName.trim()) {
			newErrors.firstName = 'Họ không được để trống';
			isValid = false;
		}

		if (!formData.lastName.trim()) {
			newErrors.lastName = 'Tên không được để trống';
			isValid = false;
		}

		if (!formData.email.trim()) {
			newErrors.email = 'Email không được để trống';
			isValid = false;
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = 'Email không hợp lệ';
			isValid = false;
		}

		if (formData.phoneNumber && !/^\d{10,11}$/.test(formData.phoneNumber)) {
			newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
			isValid = false;
		}

		setErrors(newErrors);
		return isValid;
	};

	const validatePassword = () => {
		const newErrors = { ...errors };
		let isValid = true;

		if (!passwordData.currentPassword) {
			newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
			isValid = false;
		}

		if (!passwordData.newPassword) {
			newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
			isValid = false;
		} else if (passwordData.newPassword.length < 6) {
			newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
			isValid = false;
		}

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
			isValid = false;
		}

		setErrors(newErrors);
		return isValid;
	};

	const handleSave = async () => {
		if (!validateForm()) return;

		setIsSaving(true);
		try {
			await userService.identifyAndUpdate(user?.id ?? '', formData);
			setIsEditing(false);
		} catch (error) {
			console.error('Error saving profile:', error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleChangePassword = async () => {
		if (!validatePassword()) return;

		setIsChangingPassword(true);
		try {
			// Call API to change password
			await authService.changePassword(passwordData);
			setPasswordData({
				currentPassword: '',
				newPassword: '',
				confirmPassword: '',
			});
		} catch (error) {
			console.error('Error changing password:', error);
		} finally {
			setIsChangingPassword(false);
		}
	};

	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-muted-foreground">Đang tải thông tin...</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-6 px-4 max-w-5xl">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-foreground mb-2">Hồ Sơ Cá Nhân</h1>
				<p className="text-muted-foreground">
					Quản lý thông tin cá nhân và cài đặt tài khoản của bạn
				</p>
			</div>

			<Tabs defaultValue="profile" className="space-y-6">
				<TabsList className="grid w-full grid-cols-2 max-w-md">
					<TabsTrigger value="profile">Thông Tin</TabsTrigger>
					<TabsTrigger value="security">Bảo Mật</TabsTrigger>
				</TabsList>

				{/* Profile Tab */}
				<TabsContent value="profile" className="space-y-6">
					{/* Profile Header Card */}
					<Card>
						<CardContent className="pt-6">
							<div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
								<div className="h-24 w-24 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-white text-3xl font-bold shrink-0">
									{user.firstName.charAt(0)}
									{user.lastName.charAt(0)}
								</div>
								<div className="flex-1 space-y-1">
									<h2 className="text-2xl font-bold text-foreground">
										{user.firstName} {user.lastName}
									</h2>
									<p className="text-muted-foreground">@{user.username}</p>
									<div className="flex flex-wrap gap-2 mt-2">
										<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
											<Shield className="h-3 w-3" />
											{getRoleName(user.role)}
										</span>
										<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
											<Building2 className="h-3 w-3" />
											{getDepartmentName(user.department)}
										</span>
										{user.isActive && (
											<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
												<CheckCircle2 className="h-3 w-3" />
												Đang hoạt động
											</span>
										)}
									</div>
								</div>
								{!isEditing && (
									<Button onClick={handleEdit} variant="outline">
										<Edit2 className="h-4 w-4 mr-2" />
										Chỉnh sửa
									</Button>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Personal Information Card */}
					<Card>
						<CardHeader>
							<CardTitle>Thông Tin Cá Nhân</CardTitle>
							<CardDescription>
								{isEditing
									? 'Cập nhật thông tin cá nhân của bạn'
									: 'Thông tin chi tiết về tài khoản'}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid md:grid-cols-2 gap-6">
								{/* First Name */}
								<div className="space-y-2">
									<Label htmlFor="firstName">
										<User className="h-4 w-4 inline mr-2" />
										Họ
									</Label>
									{isEditing ? (
										<>
											<Input
												id="firstName"
												value={formData.firstName}
												onChange={e => setFormData({ ...formData, firstName: e.target.value })}
												placeholder="Nhập họ"
												className={errors.firstName ? 'border-red-500' : ''}
											/>
											{errors.firstName && (
												<p className="text-sm text-red-500">{errors.firstName}</p>
											)}
										</>
									) : (
										<p className="text-foreground font-medium">{user.firstName}</p>
									)}
								</div>

								{/* Last Name */}
								<div className="space-y-2">
									<Label htmlFor="lastName">
										<User className="h-4 w-4 inline mr-2" />
										Tên
									</Label>
									{isEditing ? (
										<>
											<Input
												id="lastName"
												value={formData.lastName}
												onChange={e => setFormData({ ...formData, lastName: e.target.value })}
												placeholder="Nhập tên"
												className={errors.lastName ? 'border-red-500' : ''}
											/>
											{errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
										</>
									) : (
										<p className="text-foreground font-medium">{user.lastName}</p>
									)}
								</div>

								{/* Email */}
								<div className="space-y-2">
									<Label htmlFor="email">
										<Mail className="h-4 w-4 inline mr-2" />
										Email
									</Label>
									{isEditing ? (
										<>
											<Input
												id="email"
												type="email"
												value={formData.email}
												onChange={e => setFormData({ ...formData, email: e.target.value })}
												placeholder="Nhập email"
												className={errors.email ? 'border-red-500' : ''}
											/>
											{errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
										</>
									) : (
										<p className="text-foreground font-medium">{user.email}</p>
									)}
								</div>

								{/* Phone */}
								<div className="space-y-2">
									<Label htmlFor="phoneNumber">
										<Phone className="h-4 w-4 inline mr-2" />
										Số điện thoại
									</Label>
									{isEditing ? (
										<>
											<Input
												id="phoneNumber"
												type="tel"
												value={formData.phoneNumber}
												onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
												placeholder="Nhập số điện thoại"
												className={errors.phoneNumber ? 'border-red-500' : ''}
											/>
											{errors.phoneNumber && (
												<p className="text-sm text-red-500">{errors.phoneNumber}</p>
											)}
										</>
									) : (
										<p className="text-foreground font-medium">
											{user.phoneNumber || 'Chưa cập nhật'}
										</p>
									)}
								</div>
							</div>

							<Separator />

							{/* Read-only fields */}
							<div className="grid md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<Label>
										<Briefcase className="h-4 w-4 inline mr-2" />
										Vai trò
									</Label>
									<p className="text-foreground font-medium">{getRoleName(user.role)}</p>
								</div>

								<div className="space-y-2">
									<Label>
										<Building2 className="h-4 w-4 inline mr-2" />
										Khoa
									</Label>
									<p className="text-foreground font-medium">
										{getDepartmentName(user.department)}
									</p>
								</div>

								<div className="space-y-2">
									<Label>
										<Calendar className="h-4 w-4 inline mr-2" />
										Ngày tạo
									</Label>
									<p className="text-foreground font-medium">
										{format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm', {
											locale: vi,
										})}
									</p>
								</div>

								<div className="space-y-2">
									<Label>
										<Calendar className="h-4 w-4 inline mr-2" />
										Cập nhật lần cuối
									</Label>
									<p className="text-foreground font-medium">
										{format(new Date(user.updatedAt), 'dd/MM/yyyy HH:mm', {
											locale: vi,
										})}
									</p>
								</div>
							</div>

							{isEditing && (
								<div className="flex gap-3 justify-end pt-4">
									<Button variant="outline" onClick={handleCancel} disabled={isSaving}>
										<X className="h-4 w-4 mr-2" />
										Hủy
									</Button>
									<Button onClick={handleSave} disabled={isSaving}>
										{isSaving ? (
											<>
												<span className="animate-spin mr-2">⏳</span> Đang lưu...
											</>
										) : (
											<>
												<Save className="h-4 w-4 mr-2" />
												Lưu thay đổi
											</>
										)}
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Security Tab */}
				<TabsContent value="security" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>
								<Lock className="h-5 w-5 inline mr-2" />
								Đổi Mật Khẩu
							</CardTitle>
							<CardDescription>Cập nhật mật khẩu của bạn để bảo vệ tài khoản</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
								<Input
									id="currentPassword"
									type="password"
									value={passwordData.currentPassword}
									onChange={e =>
										setPasswordData({
											...passwordData,
											currentPassword: e.target.value,
										})
									}
									placeholder="Nhập mật khẩu hiện tại"
									className={errors.currentPassword ? 'border-red-500' : ''}
								/>
								{errors.currentPassword && (
									<p className="text-sm text-red-500">{errors.currentPassword}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="newPassword">Mật khẩu mới</Label>
								<Input
									id="newPassword"
									type="password"
									value={passwordData.newPassword}
									onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
									placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
									className={errors.newPassword ? 'border-red-500' : ''}
								/>
								{errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
								<Input
									id="confirmPassword"
									type="password"
									value={passwordData.confirmPassword}
									onChange={e =>
										setPasswordData({
											...passwordData,
											confirmPassword: e.target.value,
										})
									}
									placeholder="Nhập lại mật khẩu mới"
									className={errors.confirmPassword ? 'border-red-500' : ''}
								/>
								{errors.confirmPassword && (
									<p className="text-sm text-red-500">{errors.confirmPassword}</p>
								)}
							</div>

							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
								<p className="text-sm text-blue-800">
									<strong>Lưu ý:</strong> Mật khẩu mới phải có ít nhất 6 ký tự và khác với mật khẩu
									cũ.
								</p>
							</div>

							<div className="flex justify-end pt-4">
								<Button onClick={handleChangePassword} disabled={isChangingPassword}>
									{isChangingPassword ? (
										<>
											<span className="animate-spin mr-2">⏳</span> Đang cập nhật...
										</>
									) : (
										<>
											<Lock className="h-4 w-4 mr-2" />
											Đổi mật khẩu
										</>
									)}
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Bảo Mật Tài Khoản</CardTitle>
							<CardDescription>Các tùy chọn bảo mật bổ sung cho tài khoản của bạn</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div>
									<h4 className="font-medium">Xác thực hai yếu tố</h4>
									<p className="text-sm text-muted-foreground">
										Thêm một lớp bảo mật bổ sung cho tài khoản
									</p>
								</div>
								<Button variant="outline" disabled>
									Sắp có
								</Button>
							</div>

							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div>
									<h4 className="font-medium">Lịch sử đăng nhập</h4>
									<p className="text-sm text-muted-foreground">
										Xem các thiết bị đã đăng nhập gần đây
									</p>
								</div>
								<Button variant="outline" disabled>
									Sắp có
								</Button>
							</div>

							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div>
									<h4 className="font-medium">Phiên đăng nhập</h4>
									<p className="text-sm text-muted-foreground">
										Quản lý các phiên đăng nhập đang hoạt động
									</p>
								</div>
								<Button variant="outline" disabled>
									Sắp có
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
