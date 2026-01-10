'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { RoleGuard } from '@/components/auth/role-guard';
import { Input } from '@/components/ui/input';
import {
	Camera,
	Search,
	Clock,
	AlertCircle,
	CheckCircle2,
	XCircle,
	ChevronRight,
	RefreshCw,
} from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { imagingOrderService } from '@/lib/api';
import { toast } from '@/lib/utils/toast';
import { ImagingOrder as ImagingOrderType } from '@/lib/types/patient';
import { UserRole } from '@/lib/types';

interface ImagingOrder extends ImagingOrderType {
	patient_gender?: 'male' | 'female' | 'other';
	patient_age?: number;
	priority?: 'normal' | 'urgent' | 'stat';
	scheduled_time?: string;
}

export default function TechnicianWorklist() {
	const router = useRouter();
	const [orders, setOrders] = useState<ImagingOrder[]>([]);
	const [filteredOrders, setFilteredOrders] = useState<ImagingOrder[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [modalityFilter, setModalityFilter] = useState<string>('all');
	const [statusFilter, setStatusFilter] = useState<string>('Pending');
	const [isLoading, setIsLoading] = useState(true);

	const loadOrders = useCallback(async () => {
		setIsLoading(true);
		try {
			const result = await imagingOrderService.getAll(1, 100);

			if (result.isSuccess && result.data?.items) {
				const mappedOrders: ImagingOrder[] = result.data.items.map(order => ({
					...order,
					priority: 'normal' as const,
				}));
				setOrders(mappedOrders);
			} else {
				toast.error('Lỗi', result.message || 'Không thể tải danh sách chỉ định');
			}
		} catch (error) {
			console.error('Error loading orders:', error);
			toast.error('Lỗi', 'Đã xảy ra lỗi khi tải danh sách chỉ định');
		} finally {
			setIsLoading(false);
		}
	}, []);

	const filterOrders = useCallback(() => {
		let filtered = [...orders];

		if (statusFilter !== 'all') {
			filtered = filtered.filter(
				order => order.status.toLowerCase() === statusFilter.toLowerCase()
			);
		}

		if (modalityFilter !== 'all') {
			filtered = filtered.filter(order => order.modalityRequested === modalityFilter);
		}

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				order =>
					order.patientName.toLowerCase().includes(query) ||
					order.bodyPartRequested.toLowerCase().includes(query)
			);
		}

		filtered.sort((a, b) => {
			const priorityOrder = { stat: 0, urgent: 1, normal: 2 };
			const aPriority = a.priority || 'normal';
			const bPriority = b.priority || 'normal';
			if (priorityOrder[aPriority] !== priorityOrder[bPriority]) {
				return priorityOrder[aPriority] - priorityOrder[bPriority];
			}
			return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
		});

		setFilteredOrders(filtered);
	}, [orders, searchQuery, modalityFilter, statusFilter]);

	useEffect(() => {
		loadOrders();
	}, [loadOrders]);

	useEffect(() => {
		filterOrders();
	}, [orders, searchQuery, modalityFilter, statusFilter, filterOrders]);

	const handleOrderClick = (orderId: string) => {
		router.push(`/technician/orders/${orderId}`);
	};

	const getWaitingTime = (createdAt: string) => {
		const now = new Date();
		const createdAtDate = new Date(createdAt);
		const waitingMs = now.getTime() - createdAtDate.getTime();
		const minutes = Math.max(0, Math.floor(waitingMs / 60000));
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		return `${hours}h ${remainingMinutes}m`;
	};

	const getBodyPartLabel = (bodyPart: string) => {
		const bodyPartMap: Record<string, string> = {
			Head: 'Đầu',
			Brain: 'Não',
			Skull: 'Sọ',
			Neck: 'Cổ',
			Face: 'Mặt',
			Chest: 'Ngực',
			Lung: 'Phổi',
			Lungs: 'Phổi',
			Heart: 'Tim',
			Breast: 'Vú',
			Abdomen: 'Bụng',
			Stomach: 'Dạ dày',
			Liver: 'Gan',
			Kidney: 'Thận',
			Pelvis: 'Khung chậu',
			Spine: 'Cột sống',
			'Cervical Spine': 'CS cổ',
			'Lumbar Spine': 'CS thắt lưng',
			Shoulder: 'Vai',
			Arm: 'Cánh tay',
			Elbow: 'Khuỷu tay',
			Wrist: 'Cổ tay',
			Hand: 'Bàn tay',
			Hip: 'Hông',
			Thigh: 'Đùi',
			Knee: 'Đầu gối',
			Ankle: 'Mắt cá',
			Foot: 'Bàn chân',
			'Whole Body': 'Toàn thân',
			WholeBody: 'Toàn thân',
		};
		return bodyPartMap[bodyPart] || bodyPart;
	};

	const getStatusBadge = (status: string) => {
		const statusLower = status.toLowerCase();
		const configs: Record<string, { label: string; icon: React.ReactNode; class: string }> = {
			pending: {
				label: 'Chờ thực hiện',
				icon: <Clock className="h-3.5 w-3.5" />,
				class: 'status-waiting',
			},
			inprogress: {
				label: 'Đang thực hiện',
				icon: <AlertCircle className="h-3.5 w-3.5" />,
				class: 'status-in-progress',
			},
			in_progress: {
				label: 'Đang thực hiện',
				icon: <AlertCircle className="h-3.5 w-3.5" />,
				class: 'status-in-progress',
			},
			completed: {
				label: 'Hoàn thành',
				icon: <CheckCircle2 className="h-3.5 w-3.5" />,
				class: 'status-completed',
			},
			cancelled: {
				label: 'Đã hủy',
				icon: <XCircle className="h-3.5 w-3.5" />,
				class: 'status-cancelled',
			},
		};
		const config = configs[statusLower] || configs.pending;
		return (
			<span className={config.class}>
				{config.icon}
				{config.label}
			</span>
		);
	};

	const getModalityBadge = (modality: string) => {
		const modalityClasses: Record<string, string> = {
			CTScan: 'modality-ct',
			CT: 'modality-ct',
			MRI: 'modality-mri',
			XRay: 'modality-xray',
			'X-Ray': 'modality-xray',
			Ultrasound: 'modality-us',
			US: 'modality-us',
		};
		return (
			<span className={modalityClasses[modality] || 'modality-badge bg-slate-800 text-white'}>
				{modality}
			</span>
		);
	};

	const stats = {
		pending: orders.filter(o => o.status.toLowerCase() === 'pending').length,
		in_progress: orders.filter(o => ['inprogress', 'in_progress'].includes(o.status.toLowerCase()))
			.length,
		completed: orders.filter(o => o.status.toLowerCase() === 'completed').length,
		total: orders.length,
	};

	return (
		<DashboardLayout>
			<RoleGuard allowedRoles={[UserRole.Admin, UserRole.Technician]}>
				<div className="w-full min-h-screen bg-medical-pattern">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
						{/* Header */}
						<div className="mb-8">
							<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center shadow-lg shadow-[#7C3AED]/20">
										<Camera className="w-6 h-6 text-white" />
									</div>
									<div>
										<h1 className="text-2xl font-bold text-slate-900">Chẩn đoán hình ảnh</h1>
										<p className="text-slate-500">Danh sách chỉ định chụp chiếu</p>
									</div>
								</div>
								<Button
									onClick={() => loadOrders()}
									variant="outline"
									className="h-10 px-4 rounded-xl border-slate-200 hover:bg-slate-50"
								>
									<RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
									Làm mới
								</Button>
							</div>
						</div>

						{/* Stats Cards */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
							<div className="stat-card-amber">
								<div className="relative z-10 flex items-center justify-between">
									<div>
										<p className="text-amber-100 text-xs uppercase tracking-wide mb-1">
											Chờ thực hiện
										</p>
										<p className="text-3xl font-bold">{stats.pending}</p>
									</div>
									<div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
										<Clock className="h-5 w-5 text-white" />
									</div>
								</div>
							</div>

							<div className="stat-card-primary">
								<div className="relative z-10 flex items-center justify-between">
									<div>
										<p className="text-blue-100 text-xs uppercase tracking-wide mb-1">
											Đang thực hiện
										</p>
										<p className="text-3xl font-bold">{stats.in_progress}</p>
									</div>
									<div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
										<AlertCircle className="h-5 w-5 text-white" />
									</div>
								</div>
							</div>

							<div className="stat-card-emerald">
								<div className="relative z-10 flex items-center justify-between">
									<div>
										<p className="text-emerald-100 text-xs uppercase tracking-wide mb-1">
											Hoàn thành
										</p>
										<p className="text-3xl font-bold">{stats.completed}</p>
									</div>
									<div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
										<CheckCircle2 className="h-5 w-5 text-white" />
									</div>
								</div>
							</div>

							<div className="stat-card-slate">
								<div className="relative z-10 flex items-center justify-between">
									<div>
										<p className="text-slate-300 text-xs uppercase tracking-wide mb-1">Tổng cộng</p>
										<p className="text-3xl font-bold">{stats.total}</p>
									</div>
									<div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
										<Camera className="h-5 w-5 text-white" />
									</div>
								</div>
							</div>
						</div>

						{/* Filters */}
						<div className="medical-card-elevated mb-6">
							<div className="p-4">
								<div className="flex flex-col md:flex-row gap-4">
									<div className="flex-1 relative">
										<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
										<Input
											type="text"
											placeholder="Tìm bệnh nhân, vùng chụp..."
											value={searchQuery}
											onChange={e => setSearchQuery(e.target.value)}
											className="pl-11 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-[#0D47A1]"
										/>
									</div>

									<Select value={modalityFilter} onValueChange={setModalityFilter}>
										<SelectTrigger className="w-full md:w-44 h-11 rounded-xl bg-white border-slate-200">
											<SelectValue placeholder="Loại máy" />
										</SelectTrigger>
										<SelectContent className="rounded-xl">
											<SelectItem value="all">Tất cả loại máy</SelectItem>
											<SelectItem value="CTScan">CT Scan</SelectItem>
											<SelectItem value="MRI">MRI</SelectItem>
											<SelectItem value="XRay">X-Ray</SelectItem>
											<SelectItem value="Ultrasound">Siêu âm</SelectItem>
										</SelectContent>
									</Select>

									<Select value={statusFilter} onValueChange={setStatusFilter}>
										<SelectTrigger className="w-full md:w-44 h-11 rounded-xl bg-white border-slate-200">
											<SelectValue placeholder="Trạng thái" />
										</SelectTrigger>
										<SelectContent className="rounded-xl">
											<SelectItem value="all">Tất cả trạng thái</SelectItem>
											<SelectItem value="Pending">Chờ thực hiện</SelectItem>
											<SelectItem value="InProgress">Đang thực hiện</SelectItem>
											<SelectItem value="Completed">Hoàn thành</SelectItem>
											<SelectItem value="Cancelled">Đã hủy</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>

						{/* Orders List */}
						<div className="medical-card-elevated">
							<div className="medical-card-header rounded-t-xl">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="w-9 h-9 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center">
											<Camera className="h-5 w-5 text-[#7C3AED]" />
										</div>
										<div>
											<h3 className="text-base font-semibold text-slate-900">Danh sách chỉ định</h3>
											<p className="text-xs text-slate-500">{filteredOrders.length} chỉ định</p>
										</div>
									</div>
								</div>
							</div>

							<div className="p-0">
								{isLoading ? (
									<div className="flex items-center justify-center py-16">
										<div className="flex items-center gap-3">
											<div className="medical-spinner"></div>
											<span className="text-slate-600 font-medium">Đang tải...</span>
										</div>
									</div>
								) : filteredOrders.length === 0 ? (
									<div className="text-center py-16">
										<div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
											<Camera className="h-8 w-8 text-slate-400" />
										</div>
										<p className="text-slate-600 font-medium mb-1">Không có chỉ định nào</p>
										<p className="text-sm text-slate-400">Thay đổi bộ lọc để xem thêm</p>
									</div>
								) : (
									<div className="divide-y divide-slate-100">
										{filteredOrders.map(order => (
											<div
												key={order.id}
												onClick={() => handleOrderClick(order.id)}
												className="p-5 hover:bg-slate-50 cursor-pointer transition-all group"
											>
												<div className="flex items-start gap-4">
													{/* Modality Badge */}
													<div className="shrink-0">
														{getModalityBadge(order.modalityRequested)}
													</div>

													{/* Main Info */}
													<div className="flex-1 min-w-0">
														<div className="flex items-start justify-between gap-3 mb-3">
															<div>
																<h3 className="text-base font-semibold text-slate-900 mb-0.5">
																	{order.patientName}
																</h3>
																<p className="text-sm text-slate-500">
																	{getBodyPartLabel(order.bodyPartRequested)}
																</p>
															</div>
															<div className="flex items-center gap-2 text-xs text-slate-500">
																<Clock className="h-3.5 w-3.5" />
																<span className="font-mono font-medium">
																	{getWaitingTime(order.createdAt)}
																</span>
															</div>
														</div>

														<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
															<div>
																<p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
																	Bác sĩ chỉ định
																</p>
																<p className="text-slate-700 font-medium">
																	{order.requestingDoctorName}
																</p>
															</div>
															<div>
																<p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
																	Lý do
																</p>
																<p className="text-slate-600 line-clamp-1">
																	{order.reasonForStudy || '—'}
																</p>
															</div>
															<div>
																<p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
																	Trạng thái
																</p>
																{getStatusBadge(order.status)}
															</div>
														</div>
													</div>

													{/* Arrow */}
													<ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[#7C3AED] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
												</div>
											</div>
										))}
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
