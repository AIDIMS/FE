'use client';

import React from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, UserCheck, UserX, Users } from 'lucide-react';
import { UserListDto } from '@/lib/types';
import { getDepartmentName, getRoleName } from '@/lib/utils/role';

interface UserTableProps {
	users: UserListDto[];
	onEdit: (user: UserListDto) => void;
	onDelete: (user: UserListDto) => void;
	isLoading: boolean;
	currentUserId?: string;
}

export function UserTable({ users, onEdit, onDelete, isLoading, currentUserId }: UserTableProps) {
	if (isLoading) {
		return (
			<div className="text-center py-16">
				<div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
				<p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
			</div>
		);
	}

	if (users.length === 0) {
		return (
			<div className="text-center py-16">
				<div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
					<Users className="h-8 w-8 text-gray-400" />
				</div>
				<p className="text-gray-900 font-semibold text-lg mb-1">Không tìm thấy người dùng</p>
				<p className="text-gray-500 text-sm">Chưa có người dùng nào trong hệ thống</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow className="border-b border-gray-200 bg-gray-50/50 hover:bg-transparent">
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider pl-6">
							Người dùng
						</TableHead>
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
							Email
						</TableHead>
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
							Vai trò
						</TableHead>
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
							Phòng ban
						</TableHead>
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
							Trạng thái
						</TableHead>
						<TableHead className="w-12 pr-6"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map(user => (
						<TableRow key={user.id} className="border-b border-gray-100 group">
							<TableCell className="py-4 pl-6">
								<div>
									<p className="font-semibold text-gray-900 text-sm">
										{user.firstName} {user.lastName}
									</p>
									<p className="text-sm text-gray-500 mt-0.5">@{user.username}</p>
								</div>
							</TableCell>
							<TableCell className="py-4">
								<p className="text-sm text-gray-700">{user.email}</p>
							</TableCell>
							<TableCell className="py-4">
								<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
									{getRoleName(user.role)}
								</span>
							</TableCell>
							<TableCell className="py-4">
								<p className="text-sm text-gray-700">{getDepartmentName(user.department)}</p>
							</TableCell>
							<TableCell className="py-4">
								{!user.isDeleted ? (
									<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-800">
										<UserCheck className="h-3.5 w-3.5" />
										<span className="text-xs font-semibold">Hoạt động</span>
									</span>
								) : (
									<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-800">
										<UserX className="h-3.5 w-3.5" />
										<span className="text-xs font-semibold">Vô hiệu hóa</span>
									</span>
								)}
							</TableCell>
							<TableCell className="pr-6">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
											onClick={e => e.stopPropagation()}
										>
											<MoreVertical className="h-4 w-4" />
											<span className="sr-only">Mở menu</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-48">
										<DropdownMenuItem
											onClick={() => onEdit(user)}
											className="cursor-pointer"
											disabled={user.isDeleted}
										>
											<Pencil className="mr-2 h-4 w-4" />
											Sửa
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => onDelete(user)}
											className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
											disabled={user.id === currentUserId || user.isDeleted}
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Xóa
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
