'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, AlertCircle, FileText, User, Calendar } from 'lucide-react';
import { PatientVisit } from '@/lib/types/patient';
import { formatDate } from '@/lib/utils/date';

interface QueuePatient extends PatientVisit {
	patient_name: string;
	patient_code: string;
	patient_gender: 'male' | 'female' | 'other' | null;
	patient_dob: string | null;
	patient_phone: string | null;
	waiting_time_minutes: number;
}

export default function DoctorQueueDashboard() {
	const router = useRouter();
	const [queue, setQueue] = useState<QueuePatient[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentTime, setCurrentTime] = useState<Date | null>(null);

	useEffect(() => {
		// Initialize time only on client side to avoid hydration mismatch
		setCurrentTime(new Date());

		loadQueue();

		// Update current time every minute
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 60000);

		return () => clearInterval(timer);
	}, []);

	const loadQueue = async () => {
		setIsLoading(true);
		try {
			// Mock data - sẽ thay thế bằng API call
			// Query: SELECT * FROM patient_visits pv
			//        JOIN patients p ON pv.patient_id = p.id
			//        WHERE pv.status = 'waiting' AND pv.assigned_doctor_id = currentUserId
			//        ORDER BY pv.created_at ASC
			await new Promise(resolve => setTimeout(resolve, 500));

			const mockQueue: QueuePatient[] = [
				{
					id: 'visit1',
					patient_id: 'p1',
					patient_name: 'Nguyễn Văn A',
					patient_code: 'BN001',
					patient_gender: 'male',
					patient_dob: '1990-05-15',
					patient_phone: '0901234567',
					assigned_doctor_id: 'doc1',
					symptoms: 'Đau đầu kéo dài 3 ngày, chóng mặt, buồn nôn. Tiền sử huyết áp cao.',
					status: 'waiting',
					created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 phút trước
					created_by: null,
					updated_at: null,
					updated_by: null,
					is_deleted: false,
					deleted_at: null,
					deleted_by: null,
					waiting_time_minutes: 45,
				},
				{
					id: 'visit2',
					patient_id: 'p2',
					patient_name: 'Trần Thị B',
					patient_code: 'BN002',
					patient_gender: 'female',
					patient_dob: '1985-12-20',
					patient_phone: '0909876543',
					assigned_doctor_id: 'doc1',
					symptoms: 'Ho khan, đau ngực, sốt nhẹ. Kéo dài 5 ngày.',
					status: 'waiting',
					created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 phút trước
					created_by: null,
					updated_at: null,
					updated_by: null,
					is_deleted: false,
					deleted_at: null,
					deleted_by: null,
					waiting_time_minutes: 30,
				},
				{
					id: 'visit3',
					patient_id: 'p3',
					patient_name: 'Lê Văn C',
					patient_code: 'BN003',
					patient_gender: 'male',
					patient_dob: '1978-03-10',
					patient_phone: '0912345678',
					assigned_doctor_id: 'doc1',
					symptoms: 'Đau bụng dưới bên phải, buồn nôn. Có tiền sử viêm ruột thừa.',
					status: 'waiting',
					created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 phút trước
					created_by: null,
					updated_at: null,
					updated_by: null,
					is_deleted: false,
					deleted_at: null,
					deleted_by: null,
					waiting_time_minutes: 15,
				},
				{
					id: 'visit4',
					patient_id: 'p4',
					patient_name: 'Phạm Thị D',
					patient_code: 'BN004',
					patient_gender: 'female',
					patient_dob: '1992-08-25',
					patient_phone: '0918765432',
					assigned_doctor_id: 'doc1',
					symptoms: 'Đau khớp gối, sưng tấy. Khó di chuyển.',
					status: 'waiting',
					created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 phút trước
					created_by: null,
					updated_at: null,
					updated_by: null,
					is_deleted: false,
					deleted_at: null,
					deleted_by: null,
					waiting_time_minutes: 8,
				},
			];

			setQueue(mockQueue);
		} catch (error) {
			console.error('Error loading queue:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const getWaitingTime = (createdAt: string) => {
		const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
		if (minutes < 60) return `${minutes} phút`;
		const hours = Math.floor(minutes / 60);
		return `${hours} giờ ${minutes % 60} phút`;
	};

	const getWaitingColor = (minutes: number) => {
		if (minutes < 15) return 'text-green-600';
		if (minutes < 30) return 'text-yellow-600';
		return 'text-red-600';
	};

	const getWaitingBgColor = (minutes: number) => {
		if (minutes < 15) return 'bg-green-50 border-green-200';
		if (minutes < 30) return 'bg-yellow-50 border-yellow-200';
		return 'bg-red-50 border-red-200';
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

	const getGenderLabel = (gender: 'male' | 'female' | 'other' | null) => {
		if (!gender) return '';
		const labels = { male: 'Nam', female: 'Nữ', other: 'Khác' };
		return labels[gender];
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
												{queue.length > 0 ? getWaitingTime(queue[0].created_at) : '0 phút'}
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
							<CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
								<div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
									<Users className="h-5 w-5 text-blue-700" />
								</div>
								Danh sách bệnh nhân chờ khám
							</CardTitle>
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
										const age = calculateAge(patient.patient_dob);
										const waitingMinutes = Math.floor(
											(Date.now() - new Date(patient.created_at).getTime()) / 60000
										);

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
													<div className="flex-1 grid grid-cols-[2.5fr_1.5fr_3fr_1.2fr] gap-8 items-center">
														{/* Name & Code */}
														<div>
															<h3 className="text-base font-semibold text-slate-900 mb-1 tracking-tight">
																{patient.patient_name}
															</h3>
															<p className="text-xs text-slate-500 font-mono tracking-wider">
																{patient.patient_code}
															</p>
														</div>

														{/* Demographics - Clean */}
														<div className="space-y-0.5">
															<p className="text-sm text-slate-600 font-medium">
																{getGenderLabel(patient.patient_gender)}
															</p>
															{age && <p className="text-xs text-slate-400">{age} tuổi</p>}
														</div>

														{/* Symptoms - Typography Focus */}
														<div className="border-l border-slate-200 pl-6">
															<p className="text-sm text-slate-700 leading-relaxed line-clamp-2">
																{patient.symptoms}
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
																		min
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
