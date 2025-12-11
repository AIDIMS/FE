'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Phone, Save, Loader2, Lock, KeyRound, Calendar } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import { toast } from '@/lib/utils/toast';
import { UpdateUserByIdentifyDto } from '@/lib/types/user';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getRoleName, getDepartmentName } from '@/lib/utils/role';
import { UserRole, Department } from '@/lib/types/auth';

interface ProfileData {
	id: string;
	username: string;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber?: string;
	role: string;
	department: string;
	createdAt: string;
	updatedAt?: string;
	isDeleted: boolean;
}

export default function SettingsPage() {
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [profileData, setProfileData] = useState<ProfileData | null>(null);
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phoneNumber: '',
	});
	const [passwordData, setPasswordData] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});

	useEffect(() => {
		loadProfile();
	}, []);

	const loadProfile = async () => {
		try {
			setIsLoading(true);
			const result = await apiClient.get<ProfileData>(API_ENDPOINTS.AUTH.PROFILE);

			console.log('Profile API result:', result);

			if (result && (result as unknown as ProfileData).id) {
				const data = result as unknown as ProfileData;
				setProfileData(data);
				setFormData({
					firstName: data.firstName,
					lastName: data.lastName,
					email: data.email,
					phoneNumber: data.phoneNumber || '',
				});
			} else if (result.isSuccess && result.data) {
				setProfileData(result.data);
				setFormData({
					firstName: result.data.firstName,
					lastName: result.data.lastName,
					email: result.data.email,
					phoneNumber: result.data.phoneNumber || '',
				});
			} else {
				toast.error('Không thể tải thông tin người dùng');
			}
		} catch (error) {
			console.error('Error loading profile:', error);
			toast.error('Có lỗi xảy ra khi tải thông tin');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!profileData) return;

		try {
			setIsSaving(true);

			const updateData: UpdateUserByIdentifyDto = {
				firstName: formData.firstName,
				lastName: formData.lastName,
				email: formData.email,
				phoneNumber: formData.phoneNumber || undefined,
			};

			const result = await apiClient.put(API_ENDPOINTS.USERS.IDENTIFY(profileData.id), updateData);
			if (result.isSuccess) {
				toast.success('Cập nhật thông tin thành công');
				await loadProfile(); // Reload profile data
			} else {
				toast.error(result.message || 'Không thể cập nhật thông tin');
			}
		} catch (error) {
			console.error('Error updating profile:', error);
			toast.error('Có lỗi xảy ra khi cập nhật thông tin');
		} finally {
			setIsSaving(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setPasswordData(prev => ({ ...prev, [name]: value }));
	};

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			toast.error('Mật khẩu mới không khớp');
			return;
		}

		if (passwordData.newPassword.length < 6) {
			toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
			return;
		}

		try {
			setIsChangingPassword(true);

			const result = await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
				currentPassword: passwordData.currentPassword,
				newPassword: passwordData.newPassword,
			});

			if (result.isSuccess) {
				toast.success('Đổi mật khẩu thành công');
				setPasswordData({
					currentPassword: '',
					newPassword: '',
					confirmPassword: '',
				});
			} else {
				toast.error(result.message || 'Không thể đổi mật khẩu');
			}
		} catch (error) {
			console.error('Error changing password:', error);
			toast.error('Có lỗi xảy ra khi đổi mật khẩu');
		} finally {
			setIsChangingPassword(false);
		}
	};

	return (
		<DashboardLayout>
			<div className="container mx-auto px-4 py-6 max-w-6xl">
				{/* Modern Header with Avatar */}
				<div className="mb-8">
					<div className="flex items-center gap-6">
						<div className="relative">
							<div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center shadow-xl shadow-blue-500/30 ring-4 ring-blue-50">
								<span className="text-2xl font-bold text-white">
									{profileData?.firstName?.charAt(0) + ' ' + profileData?.lastName?.charAt(0) ||
										'U'}
								</span>
							</div>
							<div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-4 border-white shadow-sm"></div>
						</div>
						<div className="flex-1">
							<h1 className="text-3xl font-bold text-gray-900 mb-1">
								{profileData ? `${profileData.firstName} ${profileData.lastName}` : 'Cài đặt'}
							</h1>
							<p className="text-sm text-gray-600 flex items-center gap-2">
								<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
									<User className="h-3 w-3" />
									{getRoleName(profileData?.role as unknown as UserRole)}
								</span>
								<span className="text-gray-400">•</span>
								<span className="text-gray-600">
									{getDepartmentName(profileData?.department as unknown as Department)}
								</span>
							</p>
						</div>
					</div>
				</div>

				{isLoading ? (
					<Card className="border-gray-200/60 shadow-sm backdrop-blur">
						<CardContent className="pt-6">
							<div className="flex flex-col items-center justify-center py-16">
								<Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
								<p className="text-sm text-gray-500">Đang tải thông tin...</p>
							</div>
						</CardContent>
					</Card>
				) : (
					<Tabs defaultValue="profile" className="space-y-6">
						<TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100/80 backdrop-blur p-1.5 h-auto rounded-xl shadow-sm">
							<TabsTrigger
								value="profile"
								className="data-[state=active]:bg-white data-[state=active]:shadow-md py-3 px-6 rounded-lg transition-all duration-200"
							>
								<User className="h-4 w-4 mr-2" />
								<span className="font-medium">Hồ sơ</span>
							</TabsTrigger>
							<TabsTrigger
								value="security"
								className="data-[state=active]:bg-white data-[state=active]:shadow-md py-3 px-6 rounded-lg transition-all duration-200"
							>
								<Lock className="h-4 w-4 mr-2" />
								<span className="font-medium">Bảo mật</span>
							</TabsTrigger>
						</TabsList>

						{/* Profile Tab */}
						<TabsContent value="profile" className="space-y-6">
							<Card className="border-gray-200/60 shadow-lg shadow-gray-200/50 backdrop-blur overflow-hidden">
								<CardHeader className="border-b border-gray-100 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 pb-6">
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="text-xl text-gray-900 font-semibold mb-1">
												Thông tin cá nhân
											</CardTitle>
											<CardDescription className="text-gray-600">
												Cập nhật thông tin và liên hệ của bạn
											</CardDescription>
										</div>
										<div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
											<User className="h-6 w-6 text-blue-600" />
										</div>
									</div>
								</CardHeader>
								<CardContent className="pt-8 pb-8">
									<form onSubmit={handleSubmit} className="space-y-8">
										{/* Account Info Section */}
										<div className="space-y-5">
											<div className="flex items-center gap-2 mb-4">
												<div className="h-8 w-1 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
												<h3 className="text-base font-semibold text-gray-900">
													Thông tin tài khoản
												</h3>
											</div>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
												<div className="space-y-2">
													<Label className="text-sm font-medium text-gray-700">Tên đăng nhập</Label>
													<div className="relative">
														<Input
															value={profileData?.username || ''}
															disabled
															className="bg-gradient-to-br from-gray-50 to-gray-100/50 text-gray-700 border-gray-200 pl-4 font-medium"
														/>
													</div>
												</div>
												<div className="space-y-2">
													<Label className="text-sm font-medium text-gray-700">Vai trò</Label>
													<Input
														value={getRoleName(profileData?.role as unknown as UserRole)}
														disabled
														className="bg-gradient-to-br from-gray-50 to-gray-100/50 text-gray-700 border-gray-200 font-medium"
													/>
												</div>
												<div className="space-y-2">
													<Label className="text-sm font-medium text-gray-700">Phòng ban</Label>
													<Input
														value={getDepartmentName(
															profileData?.department as unknown as Department
														)}
														disabled
														className="bg-gradient-to-br from-gray-50 to-gray-100/50 text-gray-700 border-gray-200 font-medium"
													/>
												</div>
											</div>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
												<div className="space-y-2">
													<Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
														<Calendar className="h-4 w-4 text-blue-600" />
														Ngày tạo
													</Label>
													<Input
														value={
															profileData?.createdAt
																? format(new Date(profileData.createdAt), 'dd/MM/yyyy HH:mm', {
																		locale: vi,
																	})
																: ''
														}
														disabled
														className="bg-gradient-to-br from-gray-50 to-gray-100/50 text-gray-700 border-gray-200 font-medium"
													/>
												</div>
												<div className="space-y-2">
													<Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
														<Calendar className="h-4 w-4 text-blue-600" />
														Cập nhật lần cuối
													</Label>
													<Input
														value={
															profileData?.updatedAt
																? format(new Date(profileData.updatedAt), 'dd/MM/yyyy HH:mm', {
																		locale: vi,
																	})
																: 'Chưa cập nhật'
														}
														disabled
														className="bg-gradient-to-br from-gray-50 to-gray-100/50 text-gray-700 border-gray-200 font-medium"
													/>
												</div>
											</div>
										</div>

										{/* Personal Info Section */}
										<div className="space-y-5">
											<div className="flex items-center gap-2 mb-4">
												<div className="h-8 w-1 bg-gradient-to-b from-indigo-600 to-indigo-400 rounded-full"></div>
												<h3 className="text-base font-semibold text-gray-900">Thông tin cá nhân</h3>
											</div>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
												<div className="space-y-2">
													<Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
														Họ <span className="text-red-500">*</span>
													</Label>
													<Input
														id="firstName"
														name="firstName"
														value={formData.firstName}
														onChange={handleInputChange}
														required
														className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
														Tên <span className="text-red-500">*</span>
													</Label>
													<Input
														id="lastName"
														name="lastName"
														value={formData.lastName}
														onChange={handleInputChange}
														required
														className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
													/>
												</div>
											</div>
										</div>

										{/* Contact Info Section */}
										<div className="space-y-5">
											<div className="flex items-center gap-2 mb-4">
												<div className="h-8 w-1 bg-gradient-to-b from-purple-600 to-purple-400 rounded-full"></div>
												<h3 className="text-base font-semibold text-gray-900">Thông tin liên hệ</h3>
											</div>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
												<div className="space-y-2">
													<Label
														htmlFor="email"
														className="text-sm font-medium text-gray-700 flex items-center gap-2"
													>
														<Mail className="h-4 w-4 text-purple-600" />
														Email <span className="text-red-500">*</span>
													</Label>
													<Input
														id="email"
														name="email"
														type="email"
														value={formData.email}
														onChange={handleInputChange}
														required
														className="border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
													/>
												</div>
												<div className="space-y-2">
													<Label
														htmlFor="phoneNumber"
														className="text-sm font-medium text-gray-700 flex items-center gap-2"
													>
														<Phone className="h-4 w-4 text-purple-600" />
														Số điện thoại
													</Label>
													<Input
														id="phoneNumber"
														name="phoneNumber"
														type="tel"
														value={formData.phoneNumber}
														onChange={handleInputChange}
														className="border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
													/>
												</div>
											</div>
										</div>

										<div className="flex justify-end pt-6 border-t border-gray-100">
											<Button
												type="submit"
												disabled={isSaving}
												className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all px-8 py-2.5 rounded-xl font-medium"
											>
												{isSaving ? (
													<>
														<Loader2 className="h-4 w-4 mr-2 animate-spin" />
														Đang lưu...
													</>
												) : (
													<>
														<Save className="h-4 w-4 mr-2" />
														Lưu thay đổi
													</>
												)}
											</Button>
										</div>
									</form>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Security Tab */}
						<TabsContent value="security" className="space-y-6">
							<Card className="border-gray-200/60 shadow-lg shadow-gray-200/50 backdrop-blur overflow-hidden">
								<CardHeader className="border-b border-gray-100 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 pb-6">
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="text-xl text-gray-900 font-semibold mb-1">
												Đổi mật khẩu
											</CardTitle>
											<CardDescription className="text-gray-600">
												Cập nhật mật khẩu để bảo mật tài khoản
											</CardDescription>
										</div>
										<div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
											<KeyRound className="h-6 w-6 text-blue-600" />
										</div>
									</div>
								</CardHeader>
								<CardContent className="pt-8 pb-8">
									<form onSubmit={handleChangePassword} className="space-y-6">
										<div className="max-w-xl space-y-5">
											<div className="space-y-2">
												<Label
													htmlFor="currentPassword"
													className="text-sm font-medium text-gray-700"
												>
													Mật khẩu hiện tại <span className="text-red-500">*</span>
												</Label>
												<Input
													id="currentPassword"
													name="currentPassword"
													type="password"
													value={passwordData.currentPassword}
													onChange={handlePasswordChange}
													required
													className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
													placeholder="Nhập mật khẩu hiện tại"
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
													Mật khẩu mới <span className="text-red-500">*</span>
												</Label>
												<Input
													id="newPassword"
													name="newPassword"
													type="password"
													value={passwordData.newPassword}
													onChange={handlePasswordChange}
													required
													minLength={6}
													className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
													placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
												/>
											</div>

											<div className="space-y-2">
												<Label
													htmlFor="confirmPassword"
													className="text-sm font-medium text-gray-700"
												>
													Xác nhận mật khẩu mới <span className="text-red-500">*</span>
												</Label>
												<Input
													id="confirmPassword"
													name="confirmPassword"
													type="password"
													value={passwordData.confirmPassword}
													onChange={handlePasswordChange}
													required
													minLength={6}
													className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
													placeholder="Nhập lại mật khẩu mới"
												/>
											</div>
										</div>

										<div className="flex justify-end pt-6 border-t border-gray-100">
											<Button
												type="submit"
												disabled={isChangingPassword}
												className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all px-8 py-2.5 rounded-xl font-medium"
											>
												{isChangingPassword ? (
													<>
														<Loader2 className="h-4 w-4 mr-2 animate-spin" />
														Đang đổi mật khẩu...
													</>
												) : (
													<>
														<KeyRound className="h-4 w-4 mr-2" />
														Đổi mật khẩu
													</>
												)}
											</Button>
										</div>
									</form>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				)}
			</div>
		</DashboardLayout>
	);
}
