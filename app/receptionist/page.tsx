'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Clock, Users, UserPlus, Phone, UserCheck, AlertCircle } from 'lucide-react';
import { Patient, PatientVisit } from '@/lib/types/patient';
import { formatDate } from '@/lib/utils/date';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { PatientForm } from '@/components/patients/patient-form';
import CheckInForm, { CheckInFormData } from '@/components/receptionist/check-in-form';

interface PatientSearchResult extends Patient {
	lastVisit?: string;
}

interface WaitingPatient extends PatientVisit {
	patient_name: string;
	patient_code: string;
}

export default function ReceptionistDashboard() {
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
	const [waitingQueue, setWaitingQueue] = useState<WaitingPatient[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
	const [isCheckInOpen, setIsCheckInOpen] = useState(false);
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

	useEffect(() => {
		loadWaitingQueue();
	}, []);

	const loadWaitingQueue = async () => {
		// Mock data - sẽ thay thế bằng API call
		await new Promise(resolve => setTimeout(resolve, 300));

		const mockQueue: WaitingPatient[] = [
			{
				id: 'visit1',
				patient_id: 'p1',
				patient_name: 'Nguyễn Văn A',
				patient_code: 'BN001',
				assigned_doctor_id: null,
				symptoms: 'Đau đầu, chóng mặt',
				status: 'waiting',
				created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
				created_by: null,
				updated_at: null,
				updated_by: null,
				is_deleted: false,
				deleted_at: null,
				deleted_by: null,
			},
			{
				id: 'visit2',
				patient_id: 'p2',
				patient_name: 'Trần Thị B',
				patient_code: 'BN002',
				assigned_doctor_id: 'doc1',
				symptoms: 'Ho, sốt',
				status: 'waiting',
				created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
				created_by: null,
				updated_at: null,
				updated_by: null,
				is_deleted: false,
				deleted_at: null,
				deleted_by: null,
			},
		];

		setWaitingQueue(mockQueue);
	};

	const handleSearch = async (query: string) => {
		setSearchQuery(query);

		if (query.length < 2) {
			setSearchResults([]);
			return;
		}

		setIsSearching(true);
		try {
			// Mock search - sẽ thay thế bằng API call
			await new Promise(resolve => setTimeout(resolve, 500));

			const mockResults: PatientSearchResult[] = [
				{
					id: 'p1',
					patient_code: 'BN001',
					full_name: 'Nguyễn Văn A',
					date_of_birth: '1990-01-15',
					gender: 'male' as const,
					phone: '0901234567',
					address: '123 Đường ABC, Q1, TP.HCM',
					lastVisit: '2025-11-10',
					created_at: new Date().toISOString(),
					created_by: null,
					updated_at: null,
					updated_by: null,
					is_deleted: false,
					deleted_at: null,
					deleted_by: null,
				},
			].filter(
				p =>
					p.full_name.toLowerCase().includes(query.toLowerCase()) ||
					p.patient_code.toLowerCase().includes(query.toLowerCase()) ||
					p.phone?.includes(query)
			);

			setSearchResults(mockResults);
		} catch (error) {
			console.error('Error searching patients:', error);
		} finally {
			setIsSearching(false);
		}
	};

	const handleCheckIn = (patient: Patient) => {
		setSelectedPatient(patient);
		setIsCheckInOpen(true);
		setSearchResults([]);
		setSearchQuery('');
	};

	const getWaitingTime = (createdAt: string) => {
		const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
		if (minutes < 60) return `${minutes} phút`;
		const hours = Math.floor(minutes / 60);
		return `${hours} giờ ${minutes % 60} phút`;
	};

	return (
		<DashboardLayout>
			<div className="w-full min-h-screen bg-slate-50">
				<div className="px-6 py-8">
					{/* Header Stats - Minimal */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						<Card className="border border-slate-200 bg-white shadow-sm">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-slate-500 text-sm font-medium mb-1">Đang chờ</p>
										<p className="text-4xl font-bold text-slate-900 mb-1">{waitingQueue.length}</p>
										<p className="text-slate-500 text-xs">bệnh nhân</p>
									</div>
									<div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
										<Clock className="h-7 w-7 text-slate-600" />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border border-slate-200 bg-white shadow-sm">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-slate-500 text-sm font-medium mb-1">Đã đăng ký hôm nay</p>
										<p className="text-4xl font-bold text-slate-900 mb-1">12</p>
										<p className="text-slate-500 text-xs">lượt khám</p>
									</div>
									<div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
										<Users className="h-7 w-7 text-slate-600" />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border border-slate-200 bg-white shadow-sm">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-slate-500 text-sm font-medium mb-1">Bệnh nhân mới</p>
										<p className="text-4xl font-bold text-slate-900 mb-1">3</p>
										<p className="text-slate-500 text-xs">hôm nay</p>
									</div>
									<div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
										<UserPlus className="h-7 w-7 text-slate-600" />
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Main Search Section - Minimal */}
					<Card className="mb-8 border border-slate-200 bg-white shadow-sm">
						<CardHeader className="border-b border-slate-200 pb-4">
							<div className="flex items-center gap-3">
								<Search className="h-5 w-5 text-slate-600" />
								<div>
									<CardTitle className="text-lg font-semibold text-slate-900">
										Tìm kiếm bệnh nhân
									</CardTitle>
									<p className="text-sm text-slate-500 mt-1">
										Nhập tên, mã bệnh nhân hoặc số điện thoại
									</p>
								</div>
							</div>
						</CardHeader>
						<CardContent className="p-6">
							<div className="relative max-w-3xl mx-auto">
								<div className="relative">
									<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
									<Input
										type="text"
										placeholder="Tìm kiếm bệnh nhân..."
										value={searchQuery}
										onChange={e => handleSearch(e.target.value)}
										className="pl-12 pr-4 py-6 text-base border-2 border-slate-300 focus:border-blue-600 rounded-xl bg-white"
										autoFocus
									/>
								</div>

								{/* Search Results Dropdown - Minimal */}
								{searchResults.length > 0 && (
									<div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-96 overflow-y-auto">
										{searchResults.map(patient => (
											<div
												key={patient.id}
												onClick={() => handleCheckIn(patient)}
												className="group p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
											>
												<div className="flex items-center justify-between">
													<div className="flex-1">
														<div className="flex items-center gap-3 mb-2">
															<p className="font-semibold text-slate-900 text-base">
																{patient.full_name}
															</p>
															<span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs rounded font-mono font-semibold">
																{patient.patient_code}
															</span>
														</div>
														<div className="flex items-center gap-4 text-sm text-slate-600">
															<span className="flex items-center gap-1.5">
																<Phone className="h-3.5 w-3.5" />
																{patient.phone}
															</span>
															{patient.lastVisit && (
																<span className="text-xs text-slate-500">
																	Khám lần cuối: {formatDate(patient.lastVisit)}
																</span>
															)}
														</div>
													</div>
													<Button
														size="default"
														className="bg-blue-600 hover:bg-blue-700 text-white"
													>
														<UserCheck className="h-4 w-4 mr-2" />
														Đăng ký khám
													</Button>
												</div>
											</div>
										))}
									</div>
								)}

								{/* No Results */}
								{searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
									<div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-8 text-center">
										<Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
										<p className="text-slate-600 font-medium mb-4">Không tìm thấy bệnh nhân</p>
										<Button
											onClick={() => setIsAddPatientOpen(true)}
											className="bg-blue-600 hover:bg-blue-700 text-white"
										>
											<Plus className="h-4 w-4 mr-2" />
											Thêm bệnh nhân mới
										</Button>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Waiting Queue - Minimal */}
					<Card className="border border-slate-200 bg-white shadow-sm">
						<CardHeader className="border-b border-slate-200 pb-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Clock className="h-5 w-5 text-slate-600" />
									<div>
										<CardTitle className="text-lg font-semibold text-slate-900">
											Danh sách chờ khám
										</CardTitle>
										<p className="text-sm text-slate-500 mt-1">
											{waitingQueue.length} bệnh nhân đang chờ
										</p>
									</div>
								</div>
								<Button
									onClick={() => setIsAddPatientOpen(true)}
									className="bg-blue-600 hover:bg-blue-700 text-white"
								>
									<UserPlus className="h-4 w-4 mr-2" />
									Thêm bệnh nhân mới
								</Button>
							</div>
						</CardHeader>
						<CardContent className="p-6">
							{waitingQueue.length === 0 ? (
								<div className="text-center py-16">
									<Users className="h-16 w-16 text-slate-300 mx-auto mb-3" />
									<p className="text-slate-500 text-base font-medium">Chưa có bệnh nhân chờ khám</p>
								</div>
							) : (
								<div className="space-y-px bg-slate-100">
									{waitingQueue.map((visit, index) => (
										<div
											key={visit.id}
											className={`group p-5 cursor-pointer transition-all ${
												index === 0
													? 'bg-blue-50 hover:bg-blue-100/80'
													: 'bg-white hover:bg-slate-50'
											}`}
										>
											<div className="flex items-center gap-5">
												{/* Queue Number */}
												<div className="relative">
													<div
														className={`flex items-center justify-center w-14 h-14 rounded-2xl font-bold text-xl transition-all ${
															index === 0
																? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
																: 'bg-white text-slate-900 border-2 border-slate-200 group-hover:border-slate-300'
														}`}
													>
														{index + 1}
													</div>
													{index === 0 && (
														<div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
													)}
												</div>

												{/* Patient Info */}
												<div className="flex-1 grid grid-cols-4 gap-6 items-center">
													<div>
														<p className="text-xs text-slate-500 mb-1">Mã BN</p>
														<p className="text-sm font-semibold text-slate-900">
															{visit.patient_code}
														</p>
													</div>
													<div>
														<p className="text-xs text-slate-500 mb-1">Họ tên</p>
														<p className="text-sm font-semibold text-slate-900">
															{visit.patient_name}
														</p>
													</div>
													<div>
														<p className="text-xs text-slate-500 mb-1">Triệu chứng</p>
														<p className="text-sm text-slate-700 line-clamp-1">
															{visit.symptoms || '-'}
														</p>
													</div>
													<div className="text-right">
														<p className="text-xs text-slate-500 mb-1">Thời gian chờ</p>
														<p className="text-base font-bold text-slate-900">
															{getWaitingTime(visit.created_at)}
														</p>
													</div>
												</div>
											</div>

											{index === 0 && (
												<div className="mt-4 pt-3 border-t border-blue-200/50 ml-[76px]">
													<div className="inline-flex items-center gap-2 text-sm text-slate-600">
														<div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
														<span className="font-medium">Tiếp theo</span>
													</div>
												</div>
											)}
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Add Patient Dialog */}
					<Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>Thêm bệnh nhân mới</DialogTitle>
								<DialogDescription>Điền thông tin bệnh nhân mới vào hệ thống</DialogDescription>
							</DialogHeader>
							<PatientForm
								onSubmit={async data => {
									console.log('New patient:', data);
									setIsAddPatientOpen(false);
								}}
								onCancel={() => setIsAddPatientOpen(false)}
							/>
						</DialogContent>
					</Dialog>

					{/* Check-in Dialog */}
					<Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
						<DialogContent className="max-w-xl">
							<DialogHeader>
								<DialogTitle>Đăng ký khám mới</DialogTitle>
								<DialogDescription>
									Tạo phiếu khám cho bệnh nhân: {selectedPatient?.full_name}
								</DialogDescription>
							</DialogHeader>
							{selectedPatient && (
								<CheckInForm
									patient={selectedPatient}
									onSubmit={async (data: CheckInFormData) => {
										console.log('Check-in:', data);
										setIsCheckInOpen(false);
										setSelectedPatient(null);
										await loadWaitingQueue();
									}}
									onCancel={() => {
										setIsCheckInOpen(false);
										setSelectedPatient(null);
									}}
								/>
							)}
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</DashboardLayout>
	);
}
