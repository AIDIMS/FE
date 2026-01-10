'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { RoleGuard } from '@/components/auth/role-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, Plus, Search, UserCheck, UserX, Filter, Check } from 'lucide-react';
import { userService } from '@/lib/api';
import { UserListDto, UserRole, Department } from '@/lib/types';
import { useAuth } from '@/lib/contexts/auth-context';
import { UserFormDialog } from '@/components/users/user-form-dialog';
import { DeleteUserDialog } from '@/components/users/delete-user-dialog';
import { UserTable } from '@/components/users/user-table';
import { Pagination } from '@/components/ui/pagination';

export default function UsersPage() {
	const { user: currentUser } = useAuth();
	const [users, setUsers] = useState<UserListDto[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [pageNumber, setPageNumber] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const pageSize = 10;

	// Dialog states
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserListDto | null>(null);

	// Filter states
	const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
	const [selectedDepartment, setSelectedDepartment] = useState<Department | 'all'>('all');
	const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');

	// Check if current user is admin
	const isAdmin = currentUser?.role === UserRole.Admin;
	const loadUsers = async () => {
		try {
			setIsLoading(true);
			const result = await userService.getAll(pageNumber, pageSize);

			if (result.isSuccess && result.data) {
				setUsers(result.data.items);
				setTotalCount(result.data.totalCount);
				setTotalPages(result.data.totalPages);
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
		const matchesSearch =
			user.firstName.toLowerCase().includes(query) ||
			user.lastName.toLowerCase().includes(query) ||
			user.email.toLowerCase().includes(query) ||
			user.username.toLowerCase().includes(query);

		const matchesRole = selectedRole === 'all' || user.role === selectedRole;
		const matchesDepartment =
			selectedDepartment === 'all' || user.department === selectedDepartment;
		const matchesStatus =
			selectedStatus === 'all' ||
			(selectedStatus === 'active' && !user.isDeleted) ||
			(selectedStatus === 'inactive' && user.isDeleted);

		return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
	});

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
			<RoleGuard allowedRoles={[UserRole.Admin]}>
				<div className="container mx-auto px-4 py-6 max-w-7xl">
					{/* Header Section */}
					<div className="mb-8">
						<div className="flex items-center justify-between mb-4">
							<div>
								<h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý người dùng</h1>
								<p className="text-sm text-gray-600">
									Quản lý tài khoản và phân quyền người dùng trong hệ thống
								</p>
							</div>
							<Button
								onClick={() => setIsCreateDialogOpen(true)}
								className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all h-10 px-4"
							>
								<Plus className="h-4 w-4 mr-2" />
								Thêm người dùng
							</Button>
						</div>

						{/* Stats Cards */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
							<Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
								<CardContent className="p-5">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
												Tổng người dùng
											</p>
											<p className="text-3xl font-bold text-blue-900">{totalCount}</p>
											<p className="text-xs text-blue-600 mt-1">Tài khoản</p>
										</div>
										<div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
											<Users className="h-6 w-6 text-white" />
										</div>
									</div>
								</CardContent>
							</Card>
							<Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 shadow-sm hover:shadow-md transition-shadow">
								<CardContent className="p-5">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
												Đang hoạt động
											</p>
											<p className="text-3xl font-bold text-green-900">
												{users.filter(u => !u.isDeleted).length}
											</p>
											<p className="text-xs text-green-600 mt-1">Tài khoản</p>
										</div>
										<div className="h-12 w-12 rounded-2xl bg-green-600 flex items-center justify-center shadow-md">
											<UserCheck className="h-6 w-6 text-white" />
										</div>
									</div>
								</CardContent>
							</Card>
							<Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200 shadow-sm hover:shadow-md transition-shadow">
								<CardContent className="p-5">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">
												Vô hiệu hóa
											</p>
											<p className="text-3xl font-bold text-red-900">
												{users.filter(u => u.isDeleted).length}
											</p>
											<p className="text-xs text-red-600 mt-1">Tài khoản</p>
										</div>
										<div className="h-12 w-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-md">
											<UserX className="h-6 w-6 text-white" />
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
					{/* Search and Filter Bar */}
					<div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
						<div className="relative flex-1 max-w-md w-full">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								placeholder="Tìm kiếm theo tên, email, username..."
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className="pl-10 bg-white border-gray-300 focus:border-blue-600 focus:ring-blue-600 h-10 shadow-sm"
							/>
						</div>

						<div className="flex gap-2">
							{/* Role Filter */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white h-10 shadow-sm"
									>
										<Filter className="h-4 w-4 mr-2" />
										Vai trò
										{selectedRole !== 'all' && (
											<span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
												1
											</span>
										)}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuItem onClick={() => setSelectedRole('all')}>
										{selectedRole === 'all' && <Check className="h-4 w-4 mr-2 text-blue-600" />}
										{selectedRole !== 'all' && <div className="w-4 mr-2" />}
										Tất cả
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => setSelectedRole(UserRole.Admin)}>
										{selectedRole === UserRole.Admin && (
											<Check className="h-4 w-4 mr-2 text-blue-600" />
										)}
										{selectedRole !== UserRole.Admin && <div className="w-4 mr-2" />}
										Quản trị viên
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSelectedRole(UserRole.Doctor)}>
										{selectedRole === UserRole.Doctor && (
											<Check className="h-4 w-4 mr-2 text-blue-600" />
										)}
										{selectedRole !== UserRole.Doctor && <div className="w-4 mr-2" />}
										Bác sĩ
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSelectedRole(UserRole.Technician)}>
										{selectedRole === UserRole.Technician && (
											<Check className="h-4 w-4 mr-2 text-blue-600" />
										)}
										{selectedRole !== UserRole.Technician && <div className="w-4 mr-2" />}
										Kỹ thuật viên
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSelectedRole(UserRole.Receptionist)}>
										{selectedRole === UserRole.Receptionist && (
											<Check className="h-4 w-4 mr-2 text-blue-600" />
										)}
										{selectedRole !== UserRole.Receptionist && <div className="w-4 mr-2" />}
										Lễ tân
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Department Filter */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white h-10 shadow-sm"
									>
										<Filter className="h-4 w-4 mr-2" />
										Phòng ban
										{selectedDepartment !== 'all' && (
											<span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
												1
											</span>
										)}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuItem onClick={() => setSelectedDepartment('all')}>
										{selectedDepartment === 'all' && (
											<Check className="h-4 w-4 mr-2 text-blue-600" />
										)}
										{selectedDepartment !== 'all' && <div className="w-4 mr-2" />}
										Tất cả
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => setSelectedDepartment(Department.Administration)}
									>
										{selectedDepartment === Department.Administration && (
											<Check className="h-4 w-4 mr-2 text-blue-600" />
										)}
										{selectedDepartment !== Department.Administration && (
											<div className="w-4 mr-2" />
										)}
										Hành chính
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSelectedDepartment(Department.Pulmonology)}>
										{selectedDepartment === Department.Pulmonology && (
											<Check className="h-4 w-4 mr-2 text-blue-600" />
										)}
										{selectedDepartment !== Department.Pulmonology && <div className="w-4 mr-2" />}
										Phổi
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSelectedDepartment(Department.Radiology)}>
										{selectedDepartment === Department.Radiology && (
											<Check className="h-4 w-4 mr-2 text-blue-600" />
										)}
										{selectedDepartment !== Department.Radiology && <div className="w-4 mr-2" />}
										X-quang/CT
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSelectedDepartment(Department.LungFunction)}>
										{selectedDepartment === Department.LungFunction && (
											<Check className="h-4 w-4 mr-2 text-blue-600" />
										)}
										{selectedDepartment !== Department.LungFunction && <div className="w-4 mr-2" />}
										Chức năng hô hấp
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Status Filter */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white h-10 shadow-sm"
									>
										<Filter className="h-4 w-4 mr-2" />
										Trạng thái
										{selectedStatus !== 'all' && (
											<span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
												1
											</span>
										)}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuItem onClick={() => setSelectedStatus('all')}>
										{selectedStatus === 'all' && <Check className="h-4 w-4 mr-2 text-blue-600" />}
										{selectedStatus !== 'all' && <div className="w-4 mr-2" />}
										Tất cả
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => setSelectedStatus('active')}>
										{selectedStatus === 'active' && (
											<Check className="h-4 w-4 mr-2 text-blue-600" />
										)}
										{selectedStatus !== 'active' && <div className="w-4 mr-2" />}
										<UserCheck className="h-4 w-4 mr-2 text-green-600" />
										Đang hoạt động
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSelectedStatus('inactive')}>
										{selectedStatus === 'inactive' && (
											<Check className="h-4 w-4 mr-2 text-blue-600" />
										)}
										{selectedStatus !== 'inactive' && <div className="w-4 mr-2" />}
										<UserX className="h-4 w-4 mr-2 text-red-600" />
										Vô hiệu hóa
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>{' '}
					{/* Users Table */}
					<Card className="bg-white border-gray-200 shadow-md overflow-hidden">
						<CardHeader className="border-b border-gray-200 bg-white">
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="text-lg font-semibold text-gray-900">
										Danh sách người dùng
									</CardTitle>
									<CardDescription className="mt-1">
										{filteredUsers.length} người dùng
										{searchQuery && ` (${filteredUsers.length} kết quả tìm thấy)`}
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="p-0">
							<UserTable
								users={filteredUsers}
								onEdit={handleEditClick}
								onDelete={handleDeleteClick}
								isLoading={isLoading}
								currentUserId={currentUser?.id}
							/>
						</CardContent>
						{totalPages > 1 && (
							<Pagination
								currentPage={pageNumber}
								totalPages={totalPages}
								onPageChange={setPageNumber}
							/>
						)}
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
			</RoleGuard>
		</DashboardLayout>
	);
}
