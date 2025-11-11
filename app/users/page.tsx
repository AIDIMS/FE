'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Plus, Search, Pencil, Trash2, UserCheck, UserX } from 'lucide-react';
import { userService } from '@/lib/api';
import { UserListDto, UserRole, Department } from '@/lib/types';
import { useAuth } from '@/lib/contexts/auth-context';
import { UserFormDialog } from '@/components/users/user-form-dialog';
import { DeleteUserDialog } from '@/components/users/delete-user-dialog';

export default function UsersPage() {
	const { user: currentUser } = useAuth();
	const [users, setUsers] = useState<UserListDto[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [pageNumber, setPageNumber] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);

	// Dialog states
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserListDto | null>(null);

	// Check if current user is admin
	const isAdmin = currentUser?.role === UserRole.Admin;
	const loadUsers = async () => {
		try {
			setIsLoading(true);
			const result = await userService.getAll(pageNumber, 10);

			if (result.isSuccess && result.data) {
				setUsers(result.data.items);
				setTotalPages(result.data.totalPages);
				setTotalCount(result.data.totalCount);
			}
		} catch (error) {
			console.error('Error loading users:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadUsers();
	}, [pageNumber]);

	const handleCreateSuccess = () => {
		setIsCreateDialogOpen(false);
		loadUsers();
	};

	const handleEditClick = (user: UserListDto) => {
		setSelectedUser(user);
		setIsEditDialogOpen(true);
	};

	const handleEditSuccess = () => {
		setIsEditDialogOpen(false);
		setSelectedUser(null);
		loadUsers();
	};

	const handleDeleteClick = (user: UserListDto) => {
		setSelectedUser(user);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteSuccess = () => {
		setIsDeleteDialogOpen(false);
		setSelectedUser(null);
		loadUsers();
	};

	// Filter users by search query
	const filteredUsers = users.filter(user => {
		const query = searchQuery.toLowerCase();
		return (
			user.firstName.toLowerCase().includes(query) ||
			user.lastName.toLowerCase().includes(query) ||
			user.email.toLowerCase().includes(query) ||
			user.username.toLowerCase().includes(query)
		);
	});

	const getRoleName = (role: UserRole): string => {
		const roleNames = {
			[UserRole.Admin]: 'Quản trị viên',
			[UserRole.Doctor]: 'Bác sĩ',
			[UserRole.Radiologist]: 'Chuyên viên X-quang',
			[UserRole.Technician]: 'Kỹ thuật viên',
			[UserRole.Nurse]: 'Y tá',
		};
		return roleNames[role] || 'Không xác định';
	};

	const getDepartmentName = (dept: Department): string => {
		const deptNames = {
			[Department.Radiology]: 'X-quang',
			[Department.Cardiology]: 'Tim mạch',
			[Department.Neurology]: 'Thần kinh',
			[Department.Orthopedics]: 'Chấn thương chỉnh hình',
			[Department.Emergency]: 'Cấp cứu',
			[Department.Other]: 'Khác',
		};
		return deptNames[dept] || 'Không xác định';
	};

	if (!isAdmin) {
		return (
			<DashboardLayout>
				<div className="container mx-auto px-4 py-6 max-w-7xl">
					<Card className="border-red-200">
						<CardContent className="pt-6">
							<div className="text-center text-red-600">
								<UserX className="h-12 w-12 mx-auto mb-4" />
								<h2 className="text-xl font-semibold mb-2">Không có quyền truy cập</h2>
								<p>Bạn không có quyền truy cập trang quản lý người dùng.</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="container mx-auto px-4 py-6 max-w-7xl">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-2">
						<div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
							<Users className="h-6 w-6 text-white" />
						</div>
						<div className="flex-1">
							<h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
							<p className="text-sm text-gray-600 mt-1">
								Quản lý tài khoản và phân quyền người dùng trong hệ thống
							</p>
						</div>
						<Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
							<Plus className="h-4 w-4" />
							Thêm người dùng
						</Button>
					</div>
				</div>

				{/* Search and Filter */}
				<Card className="mb-6">
					<CardContent className="pt-6">
						<div className="flex gap-4">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									placeholder="Tìm kiếm theo tên, email, username..."
									value={searchQuery}
									onChange={e => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Users Table */}
				<Card>
					<CardHeader>
						<CardTitle>Danh sách người dùng</CardTitle>
						<CardDescription>
							Tổng số {totalCount} người dùng - Trang {pageNumber} / {totalPages}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="text-center py-12">
								<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
								<p className="mt-4 text-gray-600">Đang tải...</p>
							</div>
						) : filteredUsers.length === 0 ? (
							<div className="text-center py-12 text-gray-500">
								<Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
								<p>Không tìm thấy người dùng nào</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-gray-200">
											<th className="text-left py-3 px-4 font-semibold text-gray-900">
												Người dùng
											</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-900">Vai trò</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-900">Phòng ban</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-900">
												Trạng thái
											</th>
											<th className="text-right py-3 px-4 font-semibold text-gray-900">Thao tác</th>
										</tr>
									</thead>
									<tbody>
										{filteredUsers.map(user => (
											<tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
												<td className="py-3 px-4">
													<div>
														<p className="font-medium text-gray-900">
															{user.firstName} {user.lastName}
														</p>
														<p className="text-sm text-gray-500">@{user.username}</p>
													</div>
												</td>
												<td className="py-3 px-4 text-gray-700">{user.email}</td>
												<td className="py-3 px-4">
													<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
														{getRoleName(user.role)}
													</span>
												</td>
												<td className="py-3 px-4 text-gray-700">
													{getDepartmentName(user.department)}
												</td>
												<td className="py-3 px-4">
													{user.isActive ? (
														<span className="inline-flex items-center gap-1 text-green-700">
															<UserCheck className="h-4 w-4" />
															<span className="text-sm">Hoạt động</span>
														</span>
													) : (
														<span className="inline-flex items-center gap-1 text-red-700">
															<UserX className="h-4 w-4" />
															<span className="text-sm">Vô hiệu hóa</span>
														</span>
													)}
												</td>
												<td className="py-3 px-4">
													<div className="flex items-center justify-end gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleEditClick(user)}
															className="gap-1"
														>
															<Pencil className="h-4 w-4" />
															Sửa
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDeleteClick(user)}
															className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
															disabled={user.id === currentUser?.id}
														>
															<Trash2 className="h-4 w-4" />
															Xóa
														</Button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="mt-6 flex items-center justify-between">
								<div className="text-sm text-gray-600">
									Hiển thị {filteredUsers.length} / {totalCount} người dùng
								</div>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPageNumber(p => Math.max(1, p - 1))}
										disabled={pageNumber === 1}
									>
										Trước
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
										disabled={pageNumber === totalPages}
									>
										Sau
									</Button>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Dialogs */}
			<UserFormDialog
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
				onSuccess={handleCreateSuccess}
			/>

			<UserFormDialog
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				onSuccess={handleEditSuccess}
				user={selectedUser}
			/>

			<DeleteUserDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				onSuccess={handleDeleteSuccess}
				user={selectedUser}
			/>
		</DashboardLayout>
	);
}
