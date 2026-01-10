'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { RoleGuard } from '@/components/auth/role-guard';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Clock, Users, FileText, Filter, RefreshCw, Stethoscope, ChevronRight } from 'lucide-react';
import { PatientVisit } from '@/lib/types/patient';
import { visitService } from '@/lib/api/services/visit.service';
import { userService } from '@/lib/api';
import { useAuth } from '@/lib/contexts/auth-context';
import { UserRole } from '@/lib/types';

type QueuePatient = PatientVisit;

export default function DoctorQueueDashboard() {
	const router = useRouter();
	const { user: currentUser } = useAuth();
	const [queue, setQueue] = useState<QueuePatient[]>([]);
	const [completedToday, setCompletedToday] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [currentTime, setCurrentTime] = useState<Date | null>(null);
	const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
	const [doctors, setDoctors] = useState<Array<{ id: string; name: string }>>([]);

	const isAdmin = currentUser?.role === UserRole.Admin;

	const loadDoctors = useCallback(async () => {
		try {
			const result = await userService.getAll(1, 100);
			if (result.isSuccess && result.data) {
				const doctorList = result.data.items
					.filter(u => u.role === UserRole.Doctor && !u.isDeleted)
					.map(u => ({
						id: u.id,
						name: `${u.firstName} ${u.lastName}`,
					}));
				setDoctors(doctorList);
			}
		} catch (error) {
			console.error('Error loading doctors:', error);
		}
	}, []);

	const loadQueue = useCallback(async () => {
		if (!currentUser) return;

		setIsLoading(true);
		try {
			let result;

			if (isAdmin) {
				if (selectedDoctorId === 'all') {
					result = await visitService.getAll(1, 100);
				} else {
					result = await visitService.getByDoctorId(selectedDoctorId, 1, 100);
				}
			} else if (currentUser?.id) {
				result = await visitService.getByDoctorId(currentUser.id, 1, 100);
			}

			if (result?.isSuccess && result.data) {
				const allVisits = result.data.items.filter(v => !v.isDeleted);

				// Filter waiting visits - sort by updatedAt (patient may return from imaging)
				const waitingVisits = allVisits
					.filter(v => v.status && v.status.toLowerCase() === 'waiting')
					.sort((a, b) => {
						const dateA = new Date(a.updatedAt || a.createdAt).getTime();
						const dateB = new Date(b.updatedAt || b.createdAt).getTime();
						return dateA - dateB; // ASC - người vào hàng đợi trước xếp trước
					});

				// Count completed visits today
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const completedCount = allVisits.filter(v => {
					if (!v.status || v.status.toLowerCase() !== 'completed') return false;
					const updatedDate = v.updatedAt ? new Date(v.updatedAt) : null;
					if (!updatedDate) return false;
					updatedDate.setHours(0, 0, 0, 0);
					return updatedDate.getTime() === today.getTime();
				}).length;

				setQueue(waitingVisits);
				setCompletedToday(completedCount);
			} else {
				setQueue([]);
				setCompletedToday(0);
			}
		} catch (error) {
			console.error('Error loading queue:', error);
		} finally {
			setIsLoading(false);
		}
	}, [currentUser, isAdmin, selectedDoctorId]);

	useEffect(() => {
		setCurrentTime(new Date());
		const timer = setInterval(() => setCurrentTime(new Date()), 60000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		if (!currentUser) return;
		if (isAdmin) loadDoctors();
		loadQueue();
	}, [currentUser, selectedDoctorId, isAdmin, loadQueue, loadDoctors]);

	const getWaitingTime = (visit: PatientVisit) => {
		const now = new Date();
		const waitingSince = new Date(visit.updatedAt || visit.createdAt);
		const waitingMs = now.getTime() - waitingSince.getTime();
		const minutes = Math.max(0, Math.floor(waitingMs / 60000));
		if (minutes < 60) return `${minutes} phút`;
		const hours = Math.floor(minutes / 60);
		return `${hours}h ${minutes % 60}m`;
	};

	const getWaitingMinutes = (visit: PatientVisit) => {
		const now = new Date();
		const waitingSince = new Date(visit.updatedAt || visit.createdAt);
		return Math.max(0, Math.floor((now.getTime() - waitingSince.getTime()) / 60000));
	};

	const handlePatientClick = (visitId: string) => {
		router.push(`/visits/${visitId}`);
	};

	return (
		<DashboardLayout>
			<RoleGuard allowedRoles={[UserRole.Admin, UserRole.Doctor]}>
				<div className="w-full min-h-screen bg-medical-pattern">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
						{/* Header */}
						<div className="mb-8">
							<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0D47A1] to-[#1565C0] flex items-center justify-center shadow-lg shadow-[#0D47A1]/20">
										<Stethoscope className="w-6 h-6 text-white" />
									</div>
									<div>
										<h1 className="text-2xl font-bold text-slate-900">Hàng đợi khám bệnh</h1>
										<p className="text-slate-500 flex items-center gap-2 mt-1">
											<Clock className="h-4 w-4" />
											Cập nhật: {currentTime ? currentTime.toLocaleTimeString('vi-VN') : '--:--:--'}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-3">
									{isAdmin && (
										<div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2">
											<Filter className="h-4 w-4 text-slate-400" />
											<Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
												<SelectTrigger className="w-48 border-0 h-8 bg-transparent focus:ring-0">
													<SelectValue placeholder="Chọn bác sĩ" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="all">Tất cả bác sĩ</SelectItem>
													{doctors.map(doctor => (
														<SelectItem key={doctor.id} value={doctor.id}>
															{doctor.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									)}
									<Button
										onClick={() => loadQueue()}
										variant="outline"
										className="h-10 px-4 rounded-xl border-slate-200 hover:bg-slate-50"
									>
										<RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
										Làm mới
									</Button>
								</div>
							</div>
						</div>

						{/* Stats Cards */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
							<div className="stat-card-primary">
								<div className="relative z-10 flex items-center justify-between">
									<div>
										<p className="text-blue-100 text-sm font-medium mb-1">Đang chờ khám</p>
										<p className="text-4xl font-bold">{queue.length}</p>
										<p className="text-blue-200 text-xs mt-1">bệnh nhân</p>
									</div>
									<div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
										<Users className="h-7 w-7 text-white" />
									</div>
								</div>
							</div>

							<div className="stat-card-amber">
								<div className="relative z-10 flex items-center justify-between">
									<div>
										<p className="text-amber-100 text-sm font-medium mb-1">Chờ lâu nhất</p>
										<p className="text-3xl font-bold">
											{queue.length > 0 ? getWaitingTime(queue[0]) : '0 phút'}
										</p>
										<p className="text-amber-200 text-xs mt-1">thời gian chờ</p>
									</div>
									<div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
										<Clock className="h-7 w-7 text-white" />
									</div>
								</div>
							</div>

							<div className="stat-card-emerald">
								<div className="relative z-10 flex items-center justify-between">
									<div>
										<p className="text-emerald-100 text-sm font-medium mb-1">Đã khám hôm nay</p>
										<p className="text-4xl font-bold">{completedToday}</p>
										<p className="text-emerald-200 text-xs mt-1">ca khám</p>
									</div>
									<div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
										<FileText className="h-7 w-7 text-white" />
									</div>
								</div>
							</div>
						</div>

						{/* Queue List */}
						<div className="medical-card-elevated">
							<div className="medical-card-header rounded-t-xl">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-[#0D47A1]/10 flex items-center justify-center">
										<Users className="h-5 w-5 text-[#0D47A1]" />
									</div>
									<div>
										<h2 className="text-lg font-semibold text-slate-900">Danh sách bệnh nhân</h2>
										<p className="text-sm text-slate-500">{queue.length} bệnh nhân đang chờ khám</p>
									</div>
								</div>
							</div>

							<div className="p-0">
								{isLoading ? (
									<div className="py-16 text-center">
										<div className="inline-flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-xl">
											<div className="medical-spinner"></div>
											<p className="text-slate-600 font-medium">Đang tải danh sách...</p>
										</div>
									</div>
								) : queue.length === 0 ? (
									<div className="py-16 text-center">
										<div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
											<Users className="h-8 w-8 text-slate-400" />
										</div>
										<p className="text-lg font-semibold text-slate-700 mb-1">
											Không có bệnh nhân đang chờ
										</p>
										<p className="text-sm text-slate-500">
											Bạn đã khám xong tất cả bệnh nhân trong hàng đợi
										</p>
									</div>
								) : (
									<div className="divide-y divide-slate-100">
										{queue.map((patient, index) => {
											const waitingMinutes = getWaitingMinutes(patient);
											const isUrgent = waitingMinutes >= 30;

											return (
												<div
													key={patient.id}
													onClick={() => handlePatientClick(patient.id)}
													className={`p-5 cursor-pointer transition-all duration-200 group ${
														index === 0
															? 'bg-gradient-to-r from-[#0D47A1]/5 to-transparent hover:from-[#0D47A1]/10'
															: 'hover:bg-slate-50'
													}`}
												>
													<div className="flex items-center gap-6">
														{/* Queue Number */}
														<div className="relative">
															<div
																className={`queue-number ${
																	index === 0
																		? 'queue-number-active'
																		: 'queue-number-default group-hover:border-slate-300'
																}`}
															>
																{index + 1}
															</div>
															{index === 0 && (
																<div className="absolute -top-1 -right-1 w-3 h-3 bg-[#0D47A1] rounded-full animate-pulse-soft" />
															)}
														</div>

														{/* Patient Info */}
														<div className="flex-1 grid grid-cols-[2fr_1fr_3fr_auto] gap-6 items-center">
															{/* Name & Code */}
															<div className="min-w-0">
																<h3 className="text-base font-semibold text-slate-900 mb-0.5 truncate">
																	{patient.patientName}
																</h3>
																<p className="text-xs text-slate-500 font-mono tracking-wide">
																	{patient.patientCode}
																</p>
															</div>

															{/* Doctor */}
															<div>
																<p className="text-sm text-slate-700 font-medium">
																	{patient.assignedDoctorName || 'Chưa phân công'}
																</p>
																<p className="text-xs text-slate-400">Bác sĩ</p>
															</div>

															{/* Symptoms */}
															<div className="border-l border-slate-200 pl-6">
																<p className="text-sm text-slate-600 line-clamp-2">
																	{patient.symptoms || 'Chưa có triệu chứng'}
																</p>
															</div>

															{/* Waiting Time */}
															<div className="text-right">
																<div className="flex flex-col items-end">
																	<span
																		className={`text-3xl font-bold tabular-nums ${
																			isUrgent ? 'text-red-600' : 'text-slate-400'
																		}`}
																	>
																		{waitingMinutes}
																	</span>
																	<span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
																		phút
																	</span>
																	{isUrgent && (
																		<span className="mt-1.5 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold tracking-wide uppercase rounded">
																			Chờ lâu
																		</span>
																	)}
																</div>
															</div>
														</div>

														{/* Arrow */}
														<ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[#0D47A1] group-hover:translate-x-1 transition-all" />
													</div>

													{/* First Patient Indicator */}
													{index === 0 && (
														<div className="mt-4 pt-3 border-t border-[#0D47A1]/10 ml-20">
															<div className="inline-flex items-center gap-2 text-sm text-[#0D47A1] font-medium">
																<div className="w-2 h-2 bg-[#0D47A1] rounded-full animate-pulse-soft" />
																<span>Bệnh nhân tiếp theo</span>
															</div>
														</div>
													)}
												</div>
											);
										})}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</RoleGuard>
		</DashboardLayout>
	);
}
