'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
	Minus,
	BarChart3,
	PieChart,
	RefreshCw,
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
					iconBg: 'bg-blue-100',
					iconColor: 'text-blue-700',
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
					iconBg: 'bg-green-100',
					iconColor: 'text-green-700',
				},
				{
					title: 'Chỉ định chẩn đoán hình ảnh',
					value: dashboardData.statistics.imagingOrdersTotal.toString(),
					subtitle: `${dashboardData.statistics.imagingOrdersPending} đang chờ xử lý`,
					change: 'Bình thường',
					changeType: 'neutral' as const,
					icon: Camera,
					iconBg: 'bg-purple-100',
					iconColor: 'text-purple-700',
				},
				{
					title: 'Thời gian chờ trung bình',
					value: `${dashboardData.statistics.averageWaitTimeMinutes} phút`,
					subtitle: 'Hôm nay',
					change: `${dashboardData.statistics.averageWaitTimeChange > 0 ? '+' : ''}${dashboardData.statistics.averageWaitTimeChange.toFixed(1)}%`,
					changeType: dashboardData.statistics.averageWaitTimeChange < 0 ? 'decrease' : 'increase',
					icon: Clock,
					iconBg: 'bg-amber-100',
					iconColor: 'text-amber-700',
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
				iconBg: 'bg-blue-50',
				iconColor: 'text-blue-600',
				roles: [UserRole.Admin, UserRole.Receptionist],
			},
			{
				title: 'Quản lý hồ sơ',
				description: 'Danh sách bệnh nhân',
				icon: FileText,
				href: '/patients',
				iconBg: 'bg-green-50',
				iconColor: 'text-green-600',
				roles: [UserRole.Admin, UserRole.Doctor, UserRole.Receptionist],
			},
			{
				title: 'Hàng đợi khám bệnh',
				description: 'Danh sách chờ khám',
				icon: ClipboardList,
				href: '/doctor/queue',
				iconBg: 'bg-purple-50',
				iconColor: 'text-purple-600',
				roles: [UserRole.Admin, UserRole.Doctor],
			},
			{
				title: 'Chẩn đoán hình ảnh',
				description: 'Danh sách yêu cầu chụp',
				icon: Camera,
				href: '/technician/worklist',
				iconBg: 'bg-orange-50',
				iconColor: 'text-orange-600',
				roles: [UserRole.Admin, UserRole.Technician],
			},
		];

		return actions.filter(action => !action.roles || action.roles.includes(user?.role as UserRole));
	};

	// Map department colors
	const getDepartmentColor = (index: number) => {
		const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-slate-400'];
		return colors[index % colors.length];
	};

	// Get max visits for chart scaling
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
			<div className="w-full min-h-screen bg-slate-50">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
					{/* Header */}
					<div className="mb-6">
						<div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
								<div>
									<h1 className="text-2xl font-bold text-slate-900 mb-1">
										Hệ thống Quản lý Bệnh viện
									</h1>
									<p className="text-sm text-slate-600">
										Phần mềm Quản lý Hình ảnh Y khoa và Lưu trữ DICOM
									</p>
								</div>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={loadDashboard}
										disabled={isLoading}
										className="text-sm"
									>
										<RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
										Làm mới
									</Button>
									<div className="flex items-center gap-2 text-sm text-slate-600">
										<Calendar className="h-4 w-4" />
										<span className="font-medium hidden sm:inline">{currentDate}</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Statistics Cards */}
					{isLoading ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
							{[1, 2, 3, 4].map(i => (
								<Card key={i} className="bg-white border-slate-200 shadow-sm">
									<CardContent className="p-5">
										<div className="animate-pulse space-y-3">
											<div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
											<div className="h-4 bg-slate-200 rounded w-24"></div>
											<div className="h-8 bg-slate-200 rounded w-16"></div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
							{stats.map((stat, index) => {
								const IconComponent = stat.icon;
								return (
									<Card key={index} className="bg-white border-slate-200 shadow-sm">
										<CardContent className="p-5">
											<div className="flex items-start justify-between mb-3">
												<div
													className={`h-10 w-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}
												>
													<IconComponent className={`h-5 w-5 ${stat.iconColor}`} />
												</div>
												{stat.changeType === 'increase' && (
													<div className="flex items-center gap-1 text-green-600 text-xs font-medium">
														<TrendingUp className="h-3 w-3" />
														{stat.change}
													</div>
												)}
												{stat.changeType === 'decrease' && (
													<div className="flex items-center gap-1 text-green-600 text-xs font-medium">
														<TrendingDown className="h-3 w-3" />
														{stat.change}
													</div>
												)}
												{stat.changeType === 'neutral' && (
													<div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
														<Minus className="h-3 w-3" />
														{stat.change}
													</div>
												)}
											</div>
											<div className="space-y-1">
												<p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
													{stat.title}
												</p>
												<p className="text-2xl font-bold text-slate-900">{stat.value}</p>
												<p className="text-xs text-slate-500">{stat.subtitle}</p>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					)}

					{/* Main Content Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Department Statistics */}
						<Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
							<CardHeader className="border-b border-slate-100 bg-slate-50">
								<CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
									<PieChart className="h-5 w-5 text-slate-600" />
									Phân bổ theo khoa
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6">
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
												<div key={index} className="space-y-2">
													<div className="flex items-center justify-between text-sm">
														<span className="font-medium text-slate-900">
															{dept.departmentName}
														</span>
														<span className="text-slate-600 font-semibold">
															{dept.staffCount} nhân viên
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
															<div
																className={`h-full ${getDepartmentColor(index)} transition-all duration-500`}
																style={{ width: `${dept.percentage}%` }}
															></div>
														</div>
														<span className="text-xs font-medium text-slate-500 w-10 text-right">
															{dept.percentage.toFixed(0)}%
														</span>
													</div>
												</div>
											))}
										</div>
										<div className="mt-6 pt-6 border-t border-slate-200">
											<div className="grid grid-cols-2 gap-4">
												<div className="text-center p-4 bg-slate-50 rounded-lg">
													<p className="text-2xl font-bold text-slate-900">
														{dashboardData.departmentStatistics.totalStaff}
													</p>
													<p className="text-xs text-slate-600 mt-1">Tổng nhân viên</p>
												</div>
												<div className="text-center p-4 bg-slate-50 rounded-lg">
													<p className="text-2xl font-bold text-slate-900">
														{dashboardData.departmentStatistics.totalActiveStaff}
													</p>
													<p className="text-xs text-slate-600 mt-1">Đang hoạt động</p>
												</div>
											</div>
										</div>
									</>
								) : (
									<div className="text-center py-8 text-slate-500">
										<p className="text-sm">Chưa có dữ liệu phân bổ theo khoa</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Quick Access */}
						<Card className="bg-white border-slate-200 shadow-sm">
							<CardHeader className="border-b border-slate-100 bg-slate-50">
								<CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
									<Activity className="h-5 w-5 text-slate-600" />
									Truy cập nhanh
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6">
								<div className="space-y-3">
									{quickActions.map((action, index) => {
										const IconComponent = action.icon;
										return (
											<Link key={index} href={action.href}>
												<div className="group p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all bg-white">
													<div className="flex items-center gap-3">
														<div
															className={`h-10 w-10 rounded-lg ${action.iconBg} flex items-center justify-center flex-shrink-0`}
														>
															<IconComponent className={`h-5 w-5 ${action.iconColor}`} />
														</div>
														<div className="flex-1 min-w-0">
															<div className="flex items-center justify-between mb-1">
																<h3 className="font-semibold text-sm text-slate-900">
																	{action.title}
																</h3>
																<ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
															</div>
															<p className="text-xs text-slate-600">{action.description}</p>
														</div>
													</div>
												</div>
											</Link>
										);
									})}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Weekly Activity Chart */}
					<Card className="mt-6 bg-white border-slate-200 shadow-sm">
						<CardHeader className="border-b border-slate-100 bg-slate-50">
							<div className="flex items-center justify-between">
								<CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
									<BarChart3 className="h-5 w-5 text-slate-600" />
									Hoạt động trong tuần
								</CardTitle>
								<div className="flex items-center gap-4 text-xs">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-sm bg-blue-500"></div>
										<span className="text-slate-600">Ca khám</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-sm bg-purple-500"></div>
										<span className="text-slate-600">Chẩn đoán hình ảnh</span>
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent className="p-6">
							{isLoading ? (
								<div className="animate-pulse flex items-end justify-between gap-4 h-48">
									{[1, 2, 3, 4, 5, 6, 7].map(i => (
										<div key={i} className="flex-1 space-y-2">
											<div className="bg-slate-200 rounded-t h-32"></div>
											<div className="bg-slate-200 rounded h-4 w-8 mx-auto"></div>
										</div>
									))}
								</div>
							) : dashboardData && dashboardData.weeklyActivity.activities.length > 0 ? (
								<div className="flex items-end justify-between gap-4 h-48">
									{dashboardData.weeklyActivity.activities.map((stat, index) => {
										const visitHeight = (stat.visitCount / maxVisits) * 100;
										const imagingHeight = (stat.imagingOrderCount / maxVisits) * 100;
										// Get day abbreviation (T2, T3, etc)
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
											<div key={index} className="flex-1 flex flex-col items-center gap-2">
												<div className="w-full flex items-end justify-center gap-1 h-40">
													<div className="relative flex-1 flex flex-col items-center group">
														<div
															className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
															style={{
																height: `${visitHeight}%`,
																minHeight: stat.visitCount > 0 ? '4px' : '0',
															}}
														>
															{stat.visitCount > 0 && (
																<div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity z-10">
																	{stat.visitCount} ca
																</div>
															)}
														</div>
													</div>
													<div className="relative flex-1 flex flex-col items-center group">
														<div
															className="w-full bg-purple-500 rounded-t transition-all hover:bg-purple-600"
															style={{
																height: `${imagingHeight}%`,
																minHeight: stat.imagingOrderCount > 0 ? '4px' : '0',
															}}
														>
															{stat.imagingOrderCount > 0 && (
																<div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity z-10">
																	{stat.imagingOrderCount} ca
																</div>
															)}
														</div>
													</div>
												</div>
												<span className="text-xs font-medium text-slate-600">{dayLabel}</span>
											</div>
										);
									})}
								</div>
							) : (
								<div className="text-center py-16 text-slate-500">
									<p className="text-sm">Chưa có dữ liệu hoạt động trong tuần</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</DashboardLayout>
	);
}
