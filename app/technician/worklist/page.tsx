'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Camera,
	Search,
	Filter,
	Clock,
	User,
	FileText,
	AlertCircle,
	CheckCircle2,
	XCircle,
	MoreVertical,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface ImagingOrder {
	id: string;
	visit_id: string;
	patient_name: string;
	patient_code: string;
	patient_gender: 'male' | 'female' | 'other';
	patient_age: number;
	modality_requested: string;
	body_part_requested: string;
	reason_for_study: string | null;
	requesting_doctor: string;
	status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
	priority: 'normal' | 'urgent' | 'stat';
	created_at: string;
	scheduled_time?: string;
}

export default function TechnicianWorklist() {
	const router = useRouter();
	const [orders, setOrders] = useState<ImagingOrder[]>([]);
	const [filteredOrders, setFilteredOrders] = useState<ImagingOrder[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [modalityFilter, setModalityFilter] = useState<string>('all');
	const [statusFilter, setStatusFilter] = useState<string>('pending');
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		loadOrders();
	}, []);

	useEffect(() => {
		filterOrders();
	}, [orders, searchQuery, modalityFilter, statusFilter]);

	const loadOrders = async () => {
		setIsLoading(true);
		try {
			// Mock data - sẽ thay thế bằng API call
			await new Promise(resolve => setTimeout(resolve, 500));

			const mockOrders: ImagingOrder[] = [
				{
					id: 'ord1',
					visit_id: 'visit1',
					patient_name: 'Nguyễn Văn A',
					patient_code: 'BN001',
					patient_gender: 'male',
					patient_age: 45,
					modality_requested: 'CT',
					body_part_requested: 'Đầu',
					reason_for_study: 'Nghi ngờ chấn thương sọ não sau tai nạn',
					requesting_doctor: 'BS. Trần Thị B',
					status: 'pending',
					priority: 'urgent',
					created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
				},
				{
					id: 'ord2',
					visit_id: 'visit2',
					patient_name: 'Trần Thị C',
					patient_code: 'BN002',
					patient_gender: 'female',
					patient_age: 32,
					modality_requested: 'X-Ray',
					body_part_requested: 'Ngực',
					reason_for_study: 'Kiểm tra phổi, ho kéo dài',
					requesting_doctor: 'BS. Lê Văn D',
					status: 'pending',
					priority: 'normal',
					created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
				},
				{
					id: 'ord3',
					visit_id: 'visit3',
					patient_name: 'Lê Minh E',
					patient_code: 'BN003',
					patient_gender: 'male',
					patient_age: 28,
					modality_requested: 'MRI',
					body_part_requested: 'Cột sống',
					reason_for_study: 'Đau lưng mãn tính',
					requesting_doctor: 'BS. Phạm Thị F',
					status: 'in_progress',
					priority: 'normal',
					created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
				},
				{
					id: 'ord4',
					visit_id: 'visit4',
					patient_name: 'Phạm Thị G',
					patient_code: 'BN004',
					patient_gender: 'female',
					patient_age: 55,
					modality_requested: 'CT',
					body_part_requested: 'Bụng',
					reason_for_study: 'Đau bụng, nghi ngờ viêm ruột thừa',
					requesting_doctor: 'BS. Hoàng Văn H',
					status: 'pending',
					priority: 'stat',
					created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
				},
				{
					id: 'ord5',
					visit_id: 'visit5',
					patient_name: 'Hoàng Văn I',
					patient_code: 'BN005',
					patient_gender: 'male',
					patient_age: 67,
					modality_requested: 'X-Ray',
					body_part_requested: 'Cột sống',
					reason_for_study: 'Kiểm tra xương',
					requesting_doctor: 'BS. Trần Thị B',
					status: 'completed',
					priority: 'normal',
					created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
				},
			];

			setOrders(mockOrders);
		} catch (error) {
			console.error('Error loading orders:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const filterOrders = () => {
		let filtered = [...orders];

		// Filter by status
		if (statusFilter !== 'all') {
			filtered = filtered.filter(order => order.status === statusFilter);
		}

		// Filter by modality
		if (modalityFilter !== 'all') {
			filtered = filtered.filter(order => order.modality_requested === modalityFilter);
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				order =>
					order.patient_name.toLowerCase().includes(query) ||
					order.patient_code.toLowerCase().includes(query) ||
					order.body_part_requested.toLowerCase().includes(query)
			);
		}

		// Sort by priority and time
		filtered.sort((a, b) => {
			// Priority order: stat > urgent > normal
			const priorityOrder = { stat: 0, urgent: 1, normal: 2 };
			if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
				return priorityOrder[a.priority] - priorityOrder[b.priority];
			}
			// Then by time (oldest first)
			return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
		});

		setFilteredOrders(filtered);
	};

	const handleOrderClick = (orderId: string) => {
		router.push(`/technician/orders/${orderId}`);
	};

	const getWaitingTime = (createdAt: string) => {
		const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		return `${hours}h ${remainingMinutes}m`;
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'pending':
				return <Clock className="h-4 w-4" />;
			case 'in_progress':
				return <AlertCircle className="h-4 w-4" />;
			case 'completed':
				return <CheckCircle2 className="h-4 w-4" />;
			case 'cancelled':
				return <XCircle className="h-4 w-4" />;
			default:
				return <Clock className="h-4 w-4" />;
		}
	};

	const getStatusLabel = (status: string) => {
		const labels = {
			pending: 'Chờ thực hiện',
			in_progress: 'Đang thực hiện',
			completed: 'Hoàn thành',
			cancelled: 'Đã hủy',
		};
		return labels[status as keyof typeof labels] || status;
	};

	const getPriorityBadge = (priority: string) => {
		switch (priority) {
			case 'stat':
				return (
					<span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded border border-red-300">
						STAT
					</span>
				);
			case 'urgent':
				return (
					<span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase rounded border border-orange-300">
						Urgent
					</span>
				);
			default:
				return null;
		}
	};

	const stats = {
		pending: orders.filter(o => o.status === 'pending').length,
		in_progress: orders.filter(o => o.status === 'in_progress').length,
		completed: orders.filter(o => o.status === 'completed').length,
		total: orders.length,
	};

	return (
		<DashboardLayout>
			<div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
				<div className="px-6 py-8">
					{/* Header Stats - Technical Style with Colors */}
					<div className="grid grid-cols-4 gap-4 mb-8">
						<Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white overflow-hidden relative">
							<div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
							<CardContent className="p-4 relative z-10">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-amber-100 text-xs uppercase tracking-wide mb-1">Chờ</p>
										<p className="text-3xl font-bold tabular-nums">{stats.pending}</p>
									</div>
									<div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
										<Clock className="h-5 w-5 text-white" />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden relative">
							<div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
							<CardContent className="p-4 relative z-10">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-blue-100 text-xs uppercase tracking-wide mb-1">Đang làm</p>
										<p className="text-3xl font-bold tabular-nums">{stats.in_progress}</p>
									</div>
									<div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
										<AlertCircle className="h-5 w-5 text-white" />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden relative">
							<div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
							<CardContent className="p-4 relative z-10">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-emerald-100 text-xs uppercase tracking-wide mb-1">
											Hoàn thành
										</p>
										<p className="text-3xl font-bold tabular-nums">{stats.completed}</p>
									</div>
									<div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
										<CheckCircle2 className="h-5 w-5 text-white" />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-0 shadow-lg bg-gradient-to-br from-slate-700 to-slate-800 text-white overflow-hidden relative">
							<div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
							<CardContent className="p-4 relative z-10">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-slate-300 text-xs uppercase tracking-wide mb-1">Tổng</p>
										<p className="text-3xl font-bold tabular-nums">{stats.total}</p>
									</div>
									<div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
										<Camera className="h-5 w-5 text-white" />
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Filters & Search - Technical Style */}
					<Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
						<CardContent className="p-4">
							<div className="flex flex-col md:flex-row gap-4">
								{/* Search */}
								<div className="flex-1 relative">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
									<Input
										type="text"
										placeholder="Tìm bệnh nhân, mã BN..."
										value={searchQuery}
										onChange={e => setSearchQuery(e.target.value)}
										className="pl-10 h-10 bg-white border-slate-300 focus:border-blue-600"
									/>
								</div>

								{/* Modality Filter */}
								<Select value={modalityFilter} onValueChange={setModalityFilter}>
									<SelectTrigger className="w-full md:w-40 h-10 bg-white border-slate-300">
										<SelectValue placeholder="Loại máy" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Tất cả</SelectItem>
										<SelectItem value="CT">CT Scan</SelectItem>
										<SelectItem value="MRI">MRI</SelectItem>
										<SelectItem value="X-Ray">X-Ray</SelectItem>
										<SelectItem value="Ultrasound">Siêu âm</SelectItem>
									</SelectContent>
								</Select>

								{/* Status Filter */}
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="w-full md:w-40 h-10 bg-white border-slate-300">
										<SelectValue placeholder="Trạng thái" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Tất cả</SelectItem>
										<SelectItem value="pending">Chờ</SelectItem>
										<SelectItem value="in_progress">Đang làm</SelectItem>
										<SelectItem value="completed">Xong</SelectItem>
										<SelectItem value="cancelled">Đã hủy</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					{/* Orders List - Technical Table Style */}
					<Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
						<CardHeader className="border-b border-slate-200 pb-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Camera className="h-5 w-5 text-slate-600" />
									<CardTitle className="text-base font-semibold text-slate-900">
										Danh sách chỉ định
									</CardTitle>
								</div>
								<div className="text-sm text-slate-500">{filteredOrders.length} chỉ định</div>
							</div>
						</CardHeader>
						<CardContent className="p-0">
							{isLoading ? (
								<div className="flex items-center justify-center py-16">
									<div className="flex items-center gap-2 text-slate-500">
										<div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
										<span>Đang tải...</span>
									</div>
								</div>
							) : filteredOrders.length === 0 ? (
								<div className="text-center py-16">
									<Camera className="h-12 w-12 text-slate-300 mx-auto mb-3" />
									<p className="text-slate-500 font-medium">Không có chỉ định nào</p>
								</div>
							) : (
								<div className="divide-y divide-slate-100">
									{filteredOrders.map(order => (
										<div
											key={order.id}
											onClick={() => handleOrderClick(order.id)}
											className="p-4 hover:bg-slate-50 cursor-pointer transition-colors group"
										>
											<div className="flex items-start gap-4">
												{/* Modality Icon */}
												<div className="flex-shrink-0 h-12 w-12 rounded-lg bg-slate-900 text-white flex items-center justify-center">
													<span className="text-xs font-bold">{order.modality_requested}</span>
												</div>

												{/* Main Info */}
												<div className="flex-1 min-w-0">
													<div className="flex items-start justify-between gap-2 mb-2">
														<div className="flex items-center gap-2 flex-wrap">
															<h3 className="text-sm font-semibold text-slate-900">
																{order.patient_name}
															</h3>
															<span className="text-xs font-mono text-slate-500">
																{order.patient_code}
															</span>
															<span className="text-xs text-slate-400">•</span>
															<span className="text-xs text-slate-500">
																{order.patient_gender === 'male' ? 'Nam' : 'Nữ'},{' '}
																{order.patient_age}t
															</span>
															{getPriorityBadge(order.priority)}
														</div>
														<div className="flex items-center gap-2 text-xs text-slate-500">
															<Clock className="h-3.5 w-3.5" />
															<span className="font-mono">{getWaitingTime(order.created_at)}</span>
														</div>
													</div>

													<div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
														<div>
															<p className="text-slate-500 mb-0.5">Vùng chụp</p>
															<p className="text-slate-900 font-medium">
																{order.body_part_requested}
															</p>
														</div>
														<div>
															<p className="text-slate-500 mb-0.5">Bác sĩ chỉ định</p>
															<p className="text-slate-900 font-medium">
																{order.requesting_doctor}
															</p>
														</div>
														<div>
															<p className="text-slate-500 mb-0.5">Lý do</p>
															<p className="text-slate-700 line-clamp-1">
																{order.reason_for_study || 'Không có'}
															</p>
														</div>
													</div>

													<div className="mt-2 flex items-center gap-2">
														<div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-700">
															{getStatusIcon(order.status)}
															<span>{getStatusLabel(order.status)}</span>
														</div>
													</div>
												</div>

												{/* Arrow indicator */}
												<div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
													<div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
														<svg
															className="h-4 w-4 text-white"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M9 5l7 7-7 7"
															/>
														</svg>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</DashboardLayout>
	);
}
