'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Clock, Users, FileText, Filter } from 'lucide-react';
import { PatientVisit } from '@/lib/types/patient';
import { visitService } from '@/lib/api/services/visit.service';
import { userService } from '@/lib/api';
import { useAuth } from '@/lib/contexts/auth-context';
import { UserRole } from '@/lib/types';

interface QueuePatient extends PatientVisit {
	patientGender: 'Male' | 'Female' | 'Other' | null;
	patientDob: string | null;
	patientPhone: string | null;
	waitingTimeMinutes: number;
}

export default function DoctorQueueDashboard() {
	const router = useRouter();
	const { user: currentUser } = useAuth();
	const [queue, setQueue] = useState<QueuePatient[]>([]);
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
		if (!currentUser) {
			return;
		}

		setIsLoading(true);
		try {
			let result;

			if (isAdmin) {
				// Admin: get all visits or filter by selected doctor
				if (selectedDoctorId === 'all') {
					result = await visitService.getAll(1, 100);
				} else {
					result = await visitService.getByDoctorId(selectedDoctorId, 1, 100);
				}
			} else if (currentUser?.id) {
				// Doctor: get only their assigned visits
				result = await visitService.getByDoctorId(currentUser.id, 1, 100);
			}

			if (result?.isSuccess && result.data) {
				// Filter only waiting status and map to QueuePatient
				const visits = result.data.items
					.filter(v => v.status?.toLowerCase() === 'waiting' && !v.isDeleted)
					.map(v => {
						return {
							...v,
							patientGender: null,
							patientDob: null,
							patientPhone: null,
							waitingTimeMinutes: 0,
						};
					}) as QueuePatient[];

				// Sort by created time (oldest first)
				visits.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

				setQueue(visits);
			} else {
				setQueue([]);
			}
		} catch (error) {
			console.error('Error loading queue:', error);
		} finally {
			setIsLoading(false);
		}
	}, [currentUser, isAdmin, selectedDoctorId]);

	useEffect(() => {
		// Initialize time only on client side to avoid hydration mismatch
		setCurrentTime(new Date());

		// Update current time every minute
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 60000);

		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		if (!currentUser) return;

		if (isAdmin) {
			loadDoctors();
		}
		loadQueue();
	}, [currentUser, selectedDoctorId, isAdmin, loadQueue, loadDoctors]);

	const getWaitingTime = (createdAt: string) => {
		// Backend already returns Vietnam timezone (UTC+7)
		const now = new Date();
		const createdAtDate = new Date(createdAt);
		const waitingMs = now.getTime() - createdAtDate.getTime();
		const minutes = Math.max(0, Math.floor(waitingMs / 60000));
		if (minutes < 60) return `${minutes} phút`;
		const hours = Math.floor(minutes / 60);
		return `${hours} giờ ${minutes % 60} phút`;
	};

	const handlePatientClick = (visitId: string) => {
		router.push(`/visits/${visitId}`);
	};

	const calculateAge = (dob: string | null) => {
		if (!dob) return null;
		const birthDate = new Date(dob);
		const age = new Date().getFullYear() - birthDate.getFullYear();
		return age;
	};

	const getGenderLabel = (gender: string | null) => {
		if (!gender) return '';
		const genderLower = gender.toLowerCase();
		const labels: Record<string, string> = { male: 'Nam', female: 'Nữ', other: 'Khác' };
		return labels[genderLower] || gender;
	};

	return (
		<DashboardLayout>
			<div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
				<div className="px-6 py-8">
					{/* Header */}
					<div className="mb-8">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent mb-2">
									Hàng đợi khám bệnh
								</h1>
								<p className="text-slate-600 flex items-center gap-2">
									<Clock className="h-4 w-4" />
									Cập nhật lúc: {currentTime ? currentTime.toLocaleTimeString('vi-VN') : '--:--:--'}
								</p>
							</div>
							<Button
								onClick={() => loadQueue()}
								variant="outline"
								className="border-blue-600 text-blue-700 hover:bg-blue-50 shadow-sm"
							>
								<Clock className="h-4 w-4 mr-2" />
								Làm mới
							</Button>
						</div>

						{/* Stats Cards - Vinmec Style */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden relative">
								<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
								<CardContent className="p-6 relative z-10">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-blue-100 text-sm font-medium mb-1">Đang chờ khám</p>
											<p className="text-4xl font-bold">{queue.length}</p>
											<p className="text-blue-100 text-xs mt-2">bệnh nhân</p>
										</div>
										<div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
											<Users className="h-8 w-8 text-white" />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white overflow-hidden relative">
								<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
								<CardContent className="p-6 relative z-10">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-amber-100 text-sm font-medium mb-1">Chờ lâu nhất</p>
											<p className="text-3xl font-bold">
												{queue.length > 0 ? getWaitingTime(queue[0].createdAt) : '0 phút'}
											</p>
											<p className="text-amber-100 text-xs mt-2">thời gian chờ</p>
										</div>
										<div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
											<Clock className="h-8 w-8 text-white" />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden relative">
								<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
								<CardContent className="p-6 relative z-10">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-emerald-100 text-sm font-medium mb-1">Đã khám hôm nay</p>
											<p className="text-4xl font-bold">8</p>
											<p className="text-emerald-100 text-xs mt-2">ca khám</p>
										</div>
										<div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
											<FileText className="h-8 w-8 text-white" />
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>

					{/* Queue List */}
					<Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
						<CardHeader className="border-b border-slate-200 pb-6 bg-gradient-to-r from-slate-50 to-white">
							<div className="flex items-center justify-between">
								<CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
									<div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
										<Users className="h-5 w-5 text-blue-700" />
									</div>
									Danh sách bệnh nhân chờ khám
								</CardTitle>
								{isAdmin && (
									<div className="flex items-center gap-2">
										<Filter className="h-4 w-4 text-gray-500" />
										<Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
											<SelectTrigger className="w-[200px]">
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
							</div>
						</CardHeader>
						<CardContent className="p-0">
							{isLoading ? (
								<div className="py-16 text-center">
									<div className="inline-flex items-center gap-3 px-6 py-4 bg-blue-50 rounded-xl border border-blue-200">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
										<p className="text-blue-700 font-medium">Đang tải danh sách...</p>
									</div>
								</div>
							) : queue.length === 0 ? (
								<div className="py-16 text-center">
									<div className="inline-block p-6 bg-slate-50 rounded-2xl mb-4">
										<Users className="h-16 w-16 text-slate-300 mx-auto" />
									</div>
									<p className="text-lg font-semibold text-slate-700 mb-2">
										Không có bệnh nhân đang chờ
									</p>
									<p className="text-sm text-slate-500">
										Bạn đã khám xong tất cả bệnh nhân trong hàng đợi
									</p>
								</div>
							) : (
								<div className="space-y-px bg-slate-100">
									{queue.map((patient, index) => {
										const age = calculateAge(patient.patientDob);
										// Calculate waiting time in minutes
										const now = new Date();
										const createdAtDate = new Date(patient.createdAt);
										const waitingMs = now.getTime() - createdAtDate.getTime();
										const waitingMinutes = Math.max(0, Math.floor(waitingMs / 60000));
										return (
											<div
												key={patient.id}
												onClick={() => handlePatientClick(patient.id)}
												className={`p-5 cursor-pointer transition-all group ${
													index === 0
														? 'bg-blue-50 hover:bg-blue-100/80'
														: 'bg-white hover:bg-slate-50'
												}`}
											>
												<div className="flex items-center gap-6">
													{/* Queue Number - Modern Minimal */}
													<div className="relative">
														<div
															className={`flex items-center justify-center w-14 h-14 rounded-2xl font-bold transition-all ${
																index === 0
																	? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
																	: 'bg-white text-slate-900 border-2 border-slate-200 group-hover:border-slate-300'
															}`}
														>
															<span className="text-xl">{index + 1}</span>
														</div>
														{index === 0 && (
															<div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
														)}
													</div>

													{/* Patient Info - Clean Typography */}
													<div className="flex-1 grid grid-cols-[2fr_1fr_4fr_1fr] gap-6 items-center">
														{/* Name & Code */}
														<div className="min-w-0">
															<h3 className="text-base font-semibold text-slate-900 mb-1 tracking-tight truncate">
																{patient.patientName}
															</h3>
															<p className="text-xs text-slate-500 font-mono tracking-wider">
																{patient.patientCode}
															</p>
														</div>
														{/* Demographics - Clean */}
														<div className="space-y-0.5">
															<p className="text-sm text-slate-600 font-medium">
																{getGenderLabel(patient.patientGender)}
															</p>
															{age && <p className="text-xs text-slate-400">{age} tuổi</p>}
														</div>
														{/* Symptoms - Typography Focus */}
														<div className="border-l border-slate-200 pl-6 min-w-0">
															<p className="text-sm text-slate-700 leading-relaxed line-clamp-2">
																{patient.symptoms || 'Chưa có triệu chứng'}
															</p>
														</div>
														{/* Waiting Time - Minimal Color */}
														<div className="text-right border-l border-slate-200 pl-4">
															<div className="flex flex-col items-end">
																<div className="flex items-baseline gap-1.5">
																	<span
																		className={`text-3xl font-bold tabular-nums tracking-tight ${
																			waitingMinutes >= 30 ? 'text-slate-900' : 'text-slate-400'
																		}`}
																	>
																		{waitingMinutes}
																	</span>
																	<span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
																		phút
																	</span>
																</div>
																{waitingMinutes >= 30 && (
																	<div className="mt-1 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-medium tracking-wide uppercase rounded">
																		Chờ lâu
																	</div>
																)}
															</div>
														</div>
													</div>
												</div>

												{/* First Patient Indicator - Minimal */}
												{index === 0 && (
													<div className="mt-4 pt-4 border-t border-slate-100 ml-20">
														<div className="inline-flex items-center gap-2 text-sm text-slate-600">
															<div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
															<span className="font-medium">Tiếp theo</span>
														</div>
													</div>
												)}
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</DashboardLayout>
	);
}
