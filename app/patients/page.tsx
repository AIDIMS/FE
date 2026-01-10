'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PatientForm } from '@/components/patients/patient-form';
import { PatientTable } from '@/components/patients/patient-table';
import { Patient } from '@/lib/types/patient';
import { patientService } from '@/lib/api/services/patient.service';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { RoleGuard } from '@/components/auth/role-guard';
import { Plus, Search, Filter, Users, Check, UserPlus, Calendar, Activity } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserRole } from '@/lib/types';
import { Pagination } from '@/components/ui/pagination';

export default function PatientsPage() {
	const [patients, setPatients] = useState<Patient[]>([]);
	const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
	const [pageNumber, setPageNumber] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const pageSize = 10;

	const [selectedGender, setSelectedGender] = useState<'all' | 'Male' | 'Female' | 'Other'>('all');
	const [selectedAgeRange, setSelectedAgeRange] = useState<'all' | 'child' | 'adult' | 'senior'>(
		'all'
	);

	const getTodayPatientsCount = () => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return patients.filter(patient => {
			if (!patient.createdAt) return false;
			const createdDate = new Date(patient.createdAt);
			createdDate.setHours(0, 0, 0, 0);
			return createdDate.getTime() === today.getTime();
		}).length;
	};

	useEffect(() => {
		loadPatients();
	}, [pageNumber]);

	const loadPatients = async () => {
		setIsLoading(true);
		try {
			const result = await patientService.getAll(pageNumber, pageSize);
			if (result.isSuccess && result.data) {
				setPatients(result.data.items);
				setFilteredPatients(result.data.items);
				setTotalPages(result.data.totalPages);
			}
		} catch (error) {
			console.error('Error loading patients:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		let filtered = patients;

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				patient =>
					patient.patientCode.toLowerCase().includes(query) ||
					patient.fullName.toLowerCase().includes(query) ||
					patient.phoneNumber?.toLowerCase().includes(query) ||
					patient.address?.toLowerCase().includes(query)
			);
		}

		if (selectedGender !== 'all') {
			filtered = filtered.filter(patient => patient.gender === selectedGender);
		}

		if (selectedAgeRange !== 'all') {
			filtered = filtered.filter(patient => {
				if (!patient.dateOfBirth) return false;
				const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
				if (selectedAgeRange === 'child') return age < 18;
				if (selectedAgeRange === 'adult') return age >= 18 && age < 60;
				if (selectedAgeRange === 'senior') return age >= 60;
				return true;
			});
		}

		setFilteredPatients(filtered);
	}, [searchQuery, patients, selectedGender, selectedAgeRange]);

	const handleAddNew = () => {
		setSelectedPatient(null);
		setIsFormOpen(true);
	};

	const handleEdit = (patient: Patient) => {
		setSelectedPatient(patient);
		setIsFormOpen(true);
	};

	const handleDelete = async (patient: Patient) => {
		if (!confirm(`Bạn có chắc chắn muốn xóa bệnh nhân "${patient.fullName}"?`)) return;

		try {
			setPatients(prev => prev.filter(p => p.id !== patient.id));
			setFilteredPatients(prev => prev.filter(p => p.id !== patient.id));
		} catch (error) {
			console.error('Error deleting patient:', error);
			alert('Có lỗi xảy ra khi xóa bệnh nhân');
		}
	};

	const handleSubmit = async (
		data: Omit<
			Patient,
			| 'id'
			| 'created_at'
			| 'created_by'
			| 'updated_at'
			| 'updated_by'
			| 'is_deleted'
			| 'deleted_at'
			| 'deleted_by'
		>
	) => {
		try {
			await new Promise(resolve => setTimeout(resolve, 1000));

			if (selectedPatient) {
				const updated: Patient = {
					...selectedPatient,
					...data,
					updatedAt: new Date().toISOString(),
				};
				setPatients(prev => prev.map(p => (p.id === selectedPatient.id ? updated : p)));
				setFilteredPatients(prev => prev.map(p => (p.id === selectedPatient.id ? updated : p)));
			} else {
				const newPatient: Patient = {
					...data,
					id: Date.now().toString(),
					createdAt: new Date().toISOString(),
					updatedAt: null,
					lastVisitDate: null,
				};
				setPatients(prev => [...prev, newPatient]);
				setFilteredPatients(prev => [...prev, newPatient]);
			}

			setIsFormOpen(false);
			setSelectedPatient(null);
		} catch (error) {
			console.error('Error saving patient:', error);
			alert('Có lỗi xảy ra khi lưu bệnh nhân');
		}
	};

	return (
		<DashboardLayout>
			<RoleGuard allowedRoles={[UserRole.Admin, UserRole.Doctor, UserRole.Receptionist]}>
				<div className="w-full min-h-screen bg-medical-pattern">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
						{/* Header */}
						<div className="mb-8">
							<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0D47A1] to-[#1565C0] flex items-center justify-center shadow-lg shadow-[#0D47A1]/20">
										<Users className="w-6 h-6 text-white" />
									</div>
									<div>
										<h1 className="text-2xl font-bold text-slate-900">Quản lý bệnh nhân</h1>
										<p className="text-slate-500">Quản lý thông tin và hồ sơ bệnh nhân</p>
									</div>
								</div>
								<Button onClick={handleAddNew} className="btn-medical-primary h-11 px-5 rounded-xl">
									<Plus className="h-5 w-5 mr-2" />
									Thêm bệnh nhân mới
								</Button>
							</div>
						</div>

						{/* Stats Cards */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
							<div className="stat-card-primary">
								<div className="relative z-10 flex items-center justify-between">
									<div>
										<p className="text-blue-100 text-sm font-medium mb-1">Tổng bệnh nhân</p>
										<p className="text-4xl font-bold">{patients.length}</p>
										<p className="text-blue-200 text-xs mt-1">trong hệ thống</p>
									</div>
									<div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
										<Users className="h-7 w-7 text-white" />
									</div>
								</div>
							</div>

							<div className="stat-card-emerald">
								<div className="relative z-10 flex items-center justify-between">
									<div>
										<p className="text-emerald-100 text-sm font-medium mb-1">Bệnh nhân mới</p>
										<p className="text-4xl font-bold">{getTodayPatientsCount()}</p>
										<p className="text-emerald-200 text-xs mt-1">đăng ký hôm nay</p>
									</div>
									<div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
										<UserPlus className="h-7 w-7 text-white" />
									</div>
								</div>
							</div>

							<div className="stat-card-teal">
								<div className="relative z-10 flex items-center justify-between">
									<div>
										<p className="text-teal-100 text-sm font-medium mb-1">Đang điều trị</p>
										<p className="text-4xl font-bold">0</p>
										<p className="text-teal-200 text-xs mt-1">bệnh nhân</p>
									</div>
									<div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
										<Activity className="h-7 w-7 text-white" />
									</div>
								</div>
							</div>
						</div>

						{/* Search and Filters */}
						<div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
							<div className="relative flex-1 max-w-md w-full">
								<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
								<Input
									placeholder="Tìm theo mã BN, tên, SĐT, địa chỉ..."
									value={searchQuery}
									onChange={e => setSearchQuery(e.target.value)}
									className="pl-11 h-11 bg-white border-slate-200 rounded-xl shadow-sm focus:border-[#0D47A1] focus:ring-[#0D47A1]/20"
								/>
							</div>

							<div className="flex gap-2">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											className="h-11 px-4 rounded-xl border-slate-200 bg-white"
										>
											<Filter className="h-4 w-4 mr-2 text-slate-500" />
											Giới tính
											{selectedGender !== 'all' && (
												<span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-[#0D47A1] text-white rounded">
													1
												</span>
											)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-48 rounded-xl">
										<DropdownMenuItem
											onClick={() => setSelectedGender('all')}
											className="rounded-lg"
										>
											{selectedGender === 'all' && (
												<Check className="h-4 w-4 mr-2 text-[#0D47A1]" />
											)}
											{selectedGender !== 'all' && <div className="w-4 mr-2" />}
											Tất cả
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => setSelectedGender('Male')}
											className="rounded-lg"
										>
											{selectedGender === 'Male' && (
												<Check className="h-4 w-4 mr-2 text-[#0D47A1]" />
											)}
											{selectedGender !== 'Male' && <div className="w-4 mr-2" />}
											Nam
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setSelectedGender('Female')}
											className="rounded-lg"
										>
											{selectedGender === 'Female' && (
												<Check className="h-4 w-4 mr-2 text-[#0D47A1]" />
											)}
											{selectedGender !== 'Female' && <div className="w-4 mr-2" />}
											Nữ
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											className="h-11 px-4 rounded-xl border-slate-200 bg-white"
										>
											<Calendar className="h-4 w-4 mr-2 text-slate-500" />
											Độ tuổi
											{selectedAgeRange !== 'all' && (
												<span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-[#0D47A1] text-white rounded">
													1
												</span>
											)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-48 rounded-xl">
										<DropdownMenuItem
											onClick={() => setSelectedAgeRange('all')}
											className="rounded-lg"
										>
											{selectedAgeRange === 'all' && (
												<Check className="h-4 w-4 mr-2 text-[#0D47A1]" />
											)}
											{selectedAgeRange !== 'all' && <div className="w-4 mr-2" />}
											Tất cả
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => setSelectedAgeRange('child')}
											className="rounded-lg"
										>
											{selectedAgeRange === 'child' && (
												<Check className="h-4 w-4 mr-2 text-[#0D47A1]" />
											)}
											{selectedAgeRange !== 'child' && <div className="w-4 mr-2" />}
											Trẻ em (&lt; 18)
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setSelectedAgeRange('adult')}
											className="rounded-lg"
										>
											{selectedAgeRange === 'adult' && (
												<Check className="h-4 w-4 mr-2 text-[#0D47A1]" />
											)}
											{selectedAgeRange !== 'adult' && <div className="w-4 mr-2" />}
											Người lớn (18-59)
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setSelectedAgeRange('senior')}
											className="rounded-lg"
										>
											{selectedAgeRange === 'senior' && (
												<Check className="h-4 w-4 mr-2 text-[#0D47A1]" />
											)}
											{selectedAgeRange !== 'senior' && <div className="w-4 mr-2" />}
											Cao tuổi (≥ 60)
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>

						{/* Patient Table */}
						<div className="medical-card-elevated overflow-hidden">
							<div className="medical-card-header rounded-t-xl">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="w-9 h-9 rounded-lg bg-[#0D47A1]/10 flex items-center justify-center">
											<Users className="h-5 w-5 text-[#0D47A1]" />
										</div>
										<div>
											<h3 className="text-base font-semibold text-slate-900">
												Danh sách bệnh nhân
											</h3>
											<p className="text-xs text-slate-500">
												{filteredPatients.length} bệnh nhân
												{searchQuery && ` (${filteredPatients.length} kết quả)`}
											</p>
										</div>
									</div>
								</div>
							</div>
							<div className="p-0">
								<PatientTable
									patients={filteredPatients}
									onView={() => {}}
									onEdit={handleEdit}
									onDelete={handleDelete}
									isLoading={isLoading}
								/>
							</div>
							{totalPages > 1 && (
								<Pagination
									currentPage={pageNumber}
									totalPages={totalPages}
									onPageChange={setPageNumber}
								/>
							)}
						</div>

						{/* Form Dialog */}
						<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
							<DialogContent className="!max-w-[85vw] !w-full !max-h-[90vh] overflow-y-auto rounded-2xl border-slate-200 sm:!max-w-[85vw] md:!max-w-[75vw] lg:!max-w-[65vw] xl:!max-w-[55vw]">
								<DialogHeader className="pb-4 border-b border-slate-200">
									<DialogTitle className="text-xl font-bold text-slate-900">
										{selectedPatient ? 'Sửa thông tin bệnh nhân' : 'Thêm bệnh nhân mới'}
									</DialogTitle>
									<DialogDescription className="text-sm text-slate-500 mt-1">
										{selectedPatient
											? 'Cập nhật thông tin bệnh nhân trong hệ thống'
											: 'Điền đầy đủ thông tin để thêm bệnh nhân mới'}
									</DialogDescription>
								</DialogHeader>
								<div className="pt-6">
									<PatientForm
										patient={selectedPatient}
										onSubmit={handleSubmit}
										onCancel={() => {
											setIsFormOpen(false);
											setSelectedPatient(null);
										}}
									/>
								</div>
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</RoleGuard>
		</DashboardLayout>
	);
}
