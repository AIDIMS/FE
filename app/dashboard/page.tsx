'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { RoleGuard } from '@/components/auth/role-guard';
import {
	Users,
	UserPlus,
	Stethoscope,
	Camera,
	Clock,
	Activity,
	Calendar,
	ClipboardList,
	FileText,
	ArrowRight,
	TrendingUp,
	TrendingDown,
	BarChart3,
	PieChart,
	RefreshCw,
	Heart,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth-context';
import { UserRole } from '@/lib/types';
import { dashboardService } from '@/lib/api/services/dashboard.service';
import type { DashboardData } from '@/lib/types/dashboard';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
	const { user } = useAuth();
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const currentDate = new Date().toLocaleDateString('vi-VN', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	const loadDashboard = async () => {
		setIsLoading(true);
		try {
			const result = await dashboardService.getAll();
			if (result.isSuccess && result.data) {
				setDashboardData(result.data);
			}
		} catch (error) {
			console.error('Error loading dashboard:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadDashboard();
	}, []);

	const stats = dashboardData
		? [
				{
					title: 'Tổng bệnh nhân',
					value: dashboardData.statistics.totalPatients.toLocaleString(),
					subtitle: 'Trong hệ thống',
					change: `${dashboardData.statistics.totalPatientsChange > 0 ? '+' : ''}${dashboardData.statistics.totalPatientsChange.toFixed(1)}%`,
					changeType: dashboardData.statistics.totalPatientsChange > 0 ? 'increase' : 'decrease',
					icon: Users,
					gradient: 'from-[#0D47A1] to-[#1976D2]',
				},
				{
					title: 'Ca khám hôm nay',
					value: dashboardData.statistics.visitsToday.toString(),
					subtitle: 'Đang điều trị',
					change: `${dashboardData.statistics.visitsTodayChange > 0 ? '+' : ''}${dashboardData.statistics.visitsTodayChange} ca`,
					changeType:
						dashboardData.statistics.visitsTodayChange > 0
							? 'increase'
							: dashboardData.statistics.visitsTodayChange < 0
								? 'decrease'
								: 'neutral',
					icon: Stethoscope,
					gradient: 'from-[#0D9488] to-[#14B8A6]',
				},
				{
					title: 'Chỉ định CĐHA',
					value: dashboardData.statistics.imagingOrdersTotal.toString(),
					subtitle: `${dashboardData.statistics.imagingOrdersPending} đang chờ`,
					change: 'Hôm nay',
					changeType: 'neutral' as const,
					icon: Camera,
					gradient: 'from-[#7C3AED] to-[#A78BFA]',
				},
				{
					title: 'Thời gian chờ TB',
					value: `${dashboardData.statistics.averageWaitTimeMinutes} phút`,
					subtitle: 'Trung bình',
					change: `${dashboardData.statistics.averageWaitTimeChange > 0 ? '+' : ''}${dashboardData.statistics.averageWaitTimeChange.toFixed(1)}%`,
					changeType: dashboardData.statistics.averageWaitTimeChange < 0 ? 'decrease' : 'increase',
					icon: Clock,
					gradient: 'from-[#D97706] to-[#FBBF24]',
				},
			]
		: [];

	const getQuickActions = () => {
		const actions = [
			{
				title: 'Tiếp nhận bệnh nhân',
				description: 'Đăng ký và check-in',
				icon: UserPlus,
				href: '/receptionist',
				color: 'text-[#0D47A1]',
				bg: 'bg-blue-50',
				roles: [UserRole.Admin, UserRole.Receptionist],
			},
			{
				title: 'Quản lý hồ sơ',
				description: 'Danh sách bệnh nhân',
				icon: FileText,
				href: '/patients',
				color: 'text-emerald-600',
				bg: 'bg-emerald-50',
				roles: [UserRole.Admin, UserRole.Doctor, UserRole.Receptionist],
			},
			{
				title: 'Hàng đợi khám bệnh',
				description: 'Danh sách chờ khám',
				icon: ClipboardList,
				href: '/doctor/queue',
				color: 'text-violet-600',
				bg: 'bg-violet-50',
				roles: [UserRole.Admin, UserRole.Doctor],
			},
			{
				title: 'Chẩn đoán hình ảnh',
				description: 'Danh sách yêu cầu chụp',
				icon: Camera,
				href: '/technician/worklist',
				color: 'text-amber-600',
				bg: 'bg-amber-50',
				roles: [UserRole.Admin, UserRole.Technician],
			},
		];

		return actions.filter(action => !action.roles || action.roles.includes(user?.role as UserRole));
	};

	const getDepartmentColor = (index: number) => {
		const colors = ['bg-[#0D47A1]', 'bg-[#0D9488]', 'bg-[#7C3AED]', 'bg-[#D97706]', 'bg-slate-500'];
		return colors[index % colors.length];
	};

	const maxVisits = dashboardData
		? Math.max(
				...dashboardData.weeklyActivity.activities.map(a =>
					Math.max(a.visitCount, a.imagingOrderCount)
				)
			)
		: 1;

	const quickActions = getQuickActions();

	return (
		<DashboardLayout>
			<RoleGuard allowedRoles={[UserRole.Admin]}>
				<div className="w-full min-h-screen bg-medical-pattern">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
						{/* Header */}
						<div className="mb-8">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
								<div>
									<div className="flex items-center gap-3 mb-2">
										<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D47A1] to-[#1565C0] flex items-center justify-center shadow-lg shadow-[#0D47A1]/20">
											<Heart className="w-5 h-5 text-white" />
										</div>
										<h1 className="text-2xl font-bold text-slate-900">
											Xin chào, {user?.firstName}!
										</h1>
									</div>
									<p className="text-slate-500">
										Chào mừng bạn đến với Hệ thống Quản lý Hình ảnh Y khoa
									</p>
								</div>
								<div className="flex items-center gap-3">
									<Button
										variant="outline"
										size="sm"
										onClick={loadDashboard}
										disabled={isLoading}
										className="h-10 px-4 rounded-xl border-slate-200 hover:bg-slate-50"
									>
										<RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
										Làm mới
									</Button>
									<div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
										<Calendar className="h-4 w-4 text-[#0D47A1]" />
										<span className="text-sm font-medium text-slate-700">{currentDate}</span>
									</div>
								</div>
							</div>
						</div>

						{/* Statistics Cards */}
						{isLoading ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
								{[1, 2, 3, 4].map(i => (
									<div key={i} className="medical-card p-5">
										<div className="animate-pulse space-y-3">
											<div className="h-12 w-12 bg-slate-200 rounded-xl"></div>
											<div className="h-4 bg-slate-200 rounded w-24"></div>
											<div className="h-8 bg-slate-200 rounded w-16"></div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
								{stats.map((stat, index) => {
									const IconComponent = stat.icon;
									return (
										<div
											key={index}
											className="medical-card-elevated p-5 group hover:shadow-lg transition-all duration-300"
										>
											<div className="flex items-start justify-between mb-4">
												<div
													className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
												>
													<IconComponent className="h-6 w-6 text-white" />
												</div>
												<div className="flex items-center gap-1 text-xs font-medium">
													{stat.changeType === 'increase' && (
														<span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
															<TrendingUp className="h-3 w-3" />
															{stat.change}
														</span>
													)}
													{stat.changeType === 'decrease' && (
														<span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
															<TrendingDown className="h-3 w-3" />
															{stat.change}
														</span>
													)}
													{stat.changeType === 'neutral' && (
														<span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
															{stat.change}
														</span>
													)}
												</div>
											</div>
											<div className="space-y-1">
												<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
													{stat.title}
												</p>
												<p className="text-3xl font-bold text-slate-900">{stat.value}</p>
												<p className="text-sm text-slate-500">{stat.subtitle}</p>
											</div>
										</div>
									);
								})}
							</div>
						)}

						{/* Main Content Grid */}
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{/* Department Statistics */}
							<div className="lg:col-span-2 medical-card-elevated">
								<div className="medical-card-header rounded-t-xl">
									<div className="flex items-center gap-3">
										<div className="w-9 h-9 rounded-lg bg-[#0D47A1]/10 flex items-center justify-center">
											<PieChart className="h-5 w-5 text-[#0D47A1]" />
										</div>
										<div>
											<h3 className="text-base font-semibold text-slate-900">Phân bổ theo khoa</h3>
											<p className="text-xs text-slate-500">Tổng quan nhân sự</p>
										</div>
									</div>
								</div>
								<div className="p-6">
									{isLoading ? (
										<div className="animate-pulse space-y-6">
											{[1, 2].map(i => (
												<div key={i} className="space-y-2">
													<div className="h-4 bg-slate-200 rounded w-32"></div>
													<div className="h-3 bg-slate-200 rounded"></div>
												</div>
											))}
										</div>
									) : dashboardData && dashboardData.departmentStatistics.departments.length > 0 ? (
										<>
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
												{dashboardData.departmentStatistics.departments.map((dept, index) => (
													<div key={index} className="space-y-3">
														<div className="flex items-center justify-between">
															<span className="font-medium text-slate-900">
																{dept.departmentName}
															</span>
															<span className="text-sm font-semibold text-slate-700">
																{dept.staffCount} nhân viên
															</span>
														</div>
														<div className="flex items-center gap-3">
															<div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
																<div
																	className={`h-full ${getDepartmentColor(index)} transition-all duration-700 rounded-full`}
																	style={{ width: `${dept.percentage}%` }}
																></div>
															</div>
															<span className="text-xs font-semibold text-slate-500 w-10 text-right">
																{dept.percentage.toFixed(0)}%
															</span>
														</div>
													</div>
												))}
											</div>
											<div className="mt-6 pt-6 border-t border-slate-100">
												<div className="grid grid-cols-2 gap-4">
													<div className="text-center p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50">
														<p className="text-2xl font-bold text-slate-900">
															{dashboardData.departmentStatistics.totalStaff}
														</p>
														<p className="text-xs font-medium text-slate-500 mt-1">
															Tổng nhân viên
														</p>
													</div>
													<div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50">
														<p className="text-2xl font-bold text-emerald-700">
															{dashboardData.departmentStatistics.totalActiveStaff}
														</p>
														<p className="text-xs font-medium text-slate-500 mt-1">
															Đang hoạt động
														</p>
													</div>
												</div>
											</div>
										</>
									) : (
										<div className="text-center py-12 text-slate-500">
											<PieChart className="h-12 w-12 mx-auto mb-3 text-slate-300" />
											<p className="text-sm">Chưa có dữ liệu phân bổ theo khoa</p>
										</div>
									)}
								</div>
							</div>

							{/* Quick Access */}
							<div className="medical-card-elevated">
								<div className="medical-card-header rounded-t-xl">
									<div className="flex items-center gap-3">
										<div className="w-9 h-9 rounded-lg bg-[#0D47A1]/10 flex items-center justify-center">
											<Activity className="h-5 w-5 text-[#0D47A1]" />
										</div>
										<div>
											<h3 className="text-base font-semibold text-slate-900">Truy cập nhanh</h3>
											<p className="text-xs text-slate-500">Các chức năng thường dùng</p>
										</div>
									</div>
								</div>
								<div className="p-5">
									<div className="space-y-3">
										{quickActions.map((action, index) => {
											const IconComponent = action.icon;
											return (
												<Link key={index} href={action.href}>
													<div className="group p-4 rounded-xl border border-slate-200/80 hover:border-[#0D47A1]/30 hover:shadow-md transition-all duration-200 bg-white">
														<div className="flex items-center gap-4">
															<div
																className={`h-11 w-11 rounded-xl ${action.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
															>
																<IconComponent className={`h-5 w-5 ${action.color}`} />
															</div>
															<div className="flex-1 min-w-0">
																<h4 className="font-semibold text-sm text-slate-900 group-hover:text-[#0D47A1] transition-colors">
																	{action.title}
																</h4>
																<p className="text-xs text-slate-500 mt-0.5">
																	{action.description}
																</p>
															</div>
															<ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#0D47A1] group-hover:translate-x-1 transition-all" />
														</div>
													</div>
												</Link>
											);
										})}
									</div>
								</div>
							</div>
						</div>

						{/* Weekly Activity Chart */}
						<div className="mt-6 medical-card-elevated">
							<div className="medical-card-header rounded-t-xl">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="w-9 h-9 rounded-lg bg-[#0D47A1]/10 flex items-center justify-center">
											<BarChart3 className="h-5 w-5 text-[#0D47A1]" />
										</div>
										<div>
											<h3 className="text-base font-semibold text-slate-900">
												Hoạt động trong tuần
											</h3>
											<p className="text-xs text-slate-500">Thống kê 7 ngày gần nhất</p>
										</div>
									</div>
									<div className="flex items-center gap-5 text-xs">
										<div className="flex items-center gap-2">
											<div className="w-3 h-3 rounded-sm bg-[#0D47A1]"></div>
											<span className="text-slate-600 font-medium">Ca khám</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-3 h-3 rounded-sm bg-[#7C3AED]"></div>
											<span className="text-slate-600 font-medium">CĐHA</span>
										</div>
									</div>
								</div>
							</div>
							<div className="p-6">
								{isLoading ? (
									<div className="animate-pulse flex items-end justify-between gap-4 h-52">
										{[1, 2, 3, 4, 5, 6, 7].map(i => (
											<div key={i} className="flex-1 space-y-2">
												<div className="bg-slate-200 rounded-t h-36"></div>
												<div className="bg-slate-200 rounded h-4 w-8 mx-auto"></div>
											</div>
										))}
									</div>
								) : dashboardData && dashboardData.weeklyActivity.activities.length > 0 ? (
									<div className="flex items-end justify-between gap-3 h-52">
										{dashboardData.weeklyActivity.activities.map((stat, index) => {
											const visitHeight = maxVisits > 0 ? (stat.visitCount / maxVisits) * 100 : 0;
											const imagingHeight =
												maxVisits > 0 ? (stat.imagingOrderCount / maxVisits) * 100 : 0;
											const dayMap: Record<string, string> = {
												'Thứ Hai': 'T2',
												'Thứ Ba': 'T3',
												'Thứ Tư': 'T4',
												'Thứ Năm': 'T5',
												'Thứ Sáu': 'T6',
												'Thứ Bảy': 'T7',
												'Chủ Nhật': 'CN',
											};
											const dayLabel = dayMap[stat.dayOfWeekVi] || stat.dayOfWeekVi.substring(0, 2);

											return (
												<div key={index} className="flex-1 flex flex-col items-center gap-3">
													<div className="w-full flex items-end justify-center gap-1.5 h-44">
														<div className="relative flex-1 flex flex-col items-center group">
															<div
																className="w-full bg-[#0D47A1] rounded-t-md transition-all hover:bg-[#0D47A1]/80"
																style={{
																	height: `${visitHeight}%`,
																	minHeight: stat.visitCount > 0 ? '6px' : '0',
																}}
															>
																{stat.visitCount > 0 && (
																	<div className="opacity-0 group-hover:opacity-100 absolute -top-9 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-opacity z-10 shadow-lg">
																		{stat.visitCount} ca
																	</div>
																)}
															</div>
														</div>
														<div className="relative flex-1 flex flex-col items-center group">
															<div
																className="w-full bg-[#7C3AED] rounded-t-md transition-all hover:bg-[#7C3AED]/80"
																style={{
																	height: `${imagingHeight}%`,
																	minHeight: stat.imagingOrderCount > 0 ? '6px' : '0',
																}}
															>
																{stat.imagingOrderCount > 0 && (
																	<div className="opacity-0 group-hover:opacity-100 absolute -top-9 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-opacity z-10 shadow-lg">
																		{stat.imagingOrderCount} ca
																	</div>
																)}
															</div>
														</div>
													</div>
													<span className="text-xs font-semibold text-slate-500">{dayLabel}</span>
												</div>
											);
										})}
									</div>
								) : (
									<div className="text-center py-16 text-slate-500">
										<BarChart3 className="h-12 w-12 mx-auto mb-3 text-slate-300" />
										<p className="text-sm">Chưa có dữ liệu hoạt động trong tuần</p>
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
