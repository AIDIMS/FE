'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Patient } from '@/lib/types/patient';
import { MoreVertical, ArrowDown, Eye, Pencil, Trash2 } from 'lucide-react';
import { formatDate, formatGender } from '@/lib/utils/date';
import { PatientBadge } from '@/components/ui/patient-badge';

interface PatientTableProps {
	patients: Patient[];
	onView: (patient: Patient) => void;
	onEdit: (patient: Patient) => void;
	onDelete: (patient: Patient) => void;
	isLoading?: boolean;
}

export function PatientTable({
	patients,
	onView,
	onEdit,
	onDelete,
	isLoading = false,
}: PatientTableProps) {
	const router = useRouter();

	const handleViewClick = (patient: Patient, e: React.MouseEvent) => {
		e.stopPropagation();
		router.push(`/patients/${patient.id}`);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="flex items-center gap-2 text-gray-500">
					<svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
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
					Đang tải...
				</div>
			</div>
		);
	}

	if (patients.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
				<div className="rounded-full bg-blue-50 p-4 mb-4">
					<svg
						className="h-12 w-12 text-blue-600"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
				</div>
				<h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có bệnh nhân nào</h3>
				<p className="text-sm text-gray-500 max-w-sm">
					Bắt đầu bằng cách thêm bệnh nhân đầu tiên vào hệ thống
				</p>
			</div>
		);
	}

	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<div className="overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow className="border-b border-gray-200 bg-gray-50/50 hover:bg-transparent">
						<TableHead className="w-12 h-12">
							<input
								type="checkbox"
								className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
							/>
						</TableHead>
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
							Mã BN
						</TableHead>
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
							Họ và tên
						</TableHead>
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
							Ngày sinh
						</TableHead>
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
							Giới tính
						</TableHead>
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
							<div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors">
								Lần khám gần nhất
								<ArrowDown className="h-3 w-3" />
							</div>
						</TableHead>
						<TableHead className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
							Ngày thêm
						</TableHead>
						<TableHead className="w-12"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{patients.map((patient, index) => (
						<TableRow
							key={patient.id}
							className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors cursor-pointer group"
							onClick={() => router.push(`/patients/${patient.id}`)}
						>
							<TableCell className="h-16">
								<input
									type="checkbox"
									className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
									onClick={e => e.stopPropagation()}
								/>
							</TableCell>
							<TableCell className="font-medium text-gray-900">
								<span className="font-mono text-sm">{patient.patientCode}</span>
							</TableCell>
							<TableCell>
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold shadow-md ring-2 ring-blue-100">
										{getInitials(patient.fullName)}
									</div>
									<div className="flex flex-col">
										<span className="font-semibold text-gray-900">{patient.fullName}</span>
										<span className="text-xs text-gray-500">
											{patient.phoneNumber || 'Chưa có SĐT'}
										</span>
									</div>
								</div>
							</TableCell>
							<TableCell className="text-sm text-gray-600">
								{formatDate(patient.dateOfBirth)}
							</TableCell>
							<TableCell>
								<PatientBadge variant="default">{formatGender(patient.gender)}</PatientBadge>
							</TableCell>
							<TableCell className="text-sm text-gray-600">
								{patient.lastVisitDate ? formatDate(patient.lastVisitDate) : 'Chưa có lần khám'}
							</TableCell>
							<TableCell className="text-sm text-gray-600">
								{formatDate(patient.createdAt)}
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
											onClick={e => e.stopPropagation()}
										>
											<MoreVertical className="h-4 w-4" />
											<span className="sr-only">Mở menu</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-48">
										<DropdownMenuItem
											onClick={e => handleViewClick(patient, e)}
											className="cursor-pointer"
										>
											<Eye className="mr-2 h-4 w-4" />
											Xem chi tiết
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={e => {
												e.stopPropagation();
												onEdit(patient);
											}}
											className="cursor-pointer"
										>
											<Pencil className="mr-2 h-4 w-4" />
											Sửa
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={e => {
												e.stopPropagation();
												onDelete(patient);
											}}
											className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
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
