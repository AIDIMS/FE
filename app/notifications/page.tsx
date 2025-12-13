'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Bell,
	Check,
	CheckCheck,
	RefreshCw,
	Stethoscope,
	ClipboardList,
	BrainCircuit,
	CheckCircle,
	Megaphone,
	TrendingUp,
	Eye,
} from 'lucide-react';
import { notificationService } from '@/lib/api/services/notification.service';
import { NotificationDto, NotificationType } from '@/lib/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/lib/contexts/NotificationContext';

// Helper function to render icon based on notification type
const renderNotificationIcon = (type: NotificationType, className: string) => {
	switch (type) {
		case NotificationType.VisitCreated:
			return <Stethoscope className={className} />;
		case NotificationType.ImagingOrderAssigned:
			return <ClipboardList className={className} />;
		case NotificationType.AiAnalysisCompleted:
			return <BrainCircuit className={className} />;
		case NotificationType.DiagnosisCompleted:
			return <CheckCircle className={className} />;
		default:
			return <Megaphone className={className} />;
	}
};

const getNotificationColor = (type: NotificationType) => {
	switch (type) {
		case NotificationType.VisitCreated:
			return {
				bg: 'bg-blue-500',
				light: 'bg-blue-50',
				border: 'border-blue-100',
				text: 'text-blue-700',
				badge: 'bg-blue-100 text-blue-700',
			};
		case NotificationType.ImagingOrderAssigned:
			return {
				bg: 'bg-purple-500',
				light: 'bg-purple-50',
				border: 'border-purple-100',
				text: 'text-purple-700',
				badge: 'bg-purple-100 text-purple-700',
			};
		case NotificationType.AiAnalysisCompleted:
			return {
				bg: 'bg-green-500',
				light: 'bg-green-50',
				border: 'border-green-100',
				text: 'text-green-700',
				badge: 'bg-green-100 text-green-700',
			};
		case NotificationType.DiagnosisCompleted:
			return {
				bg: 'bg-emerald-500',
				light: 'bg-emerald-50',
				border: 'border-emerald-100',
				text: 'text-emerald-700',
				badge: 'bg-emerald-100 text-emerald-700',
			};
		default:
			return {
				bg: 'bg-slate-500',
				light: 'bg-slate-50',
				border: 'border-slate-100',
				text: 'text-slate-700',
				badge: 'bg-slate-100 text-slate-700',
			};
	}
};

const getNotificationTypeLabel = (type: NotificationType) => {
	switch (type) {
		case NotificationType.VisitCreated:
			return 'Ca khám mới';
		case NotificationType.ImagingOrderAssigned:
			return 'Yêu cầu chụp';
		case NotificationType.AiAnalysisCompleted:
			return 'AI hoàn tất';
		case NotificationType.DiagnosisCompleted:
			return 'Chẩn đoán';
		default:
			return 'Thông báo';
	}
};

interface NotificationItemProps {
	notification: NotificationDto;
	onMarkAsRead?: (id: string) => void;
	onClick?: () => void;
	showActions?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
	notification,
	onMarkAsRead,
	onClick,
	showActions = true,
}) => {
	const colors = getNotificationColor(notification.type);
	const typeLabel = getNotificationTypeLabel(notification.type);

	return (
		<div
			className={`group relative p-5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-all duration-200 cursor-pointer ${
				!notification.isRead ? 'bg-blue-50/20' : ''
			}`}
			onClick={onClick}
		>
			{/* Unread Indicator */}
			{!notification.isRead && (
				<div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600" />
			)}

			<div className="flex items-start gap-4 pl-3">
				{/* Icon with gradient background */}
				<div className="relative flex-shrink-0">
					<div
						className={`w-12 h-12 rounded-xl ${colors.bg} shadow-lg shadow-${colors.bg}/20 flex items-center justify-center transform transition-transform group-hover:scale-105`}
					>
						{renderNotificationIcon(notification.type, 'h-6 w-6 text-white')}
					</div>
					{!notification.isRead && (
						<div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white animate-pulse" />
					)}
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0 space-y-2">
					{/* Header with badge and time */}
					<div className="flex items-center justify-between gap-3">
						<Badge
							variant="secondary"
							className={`${colors.badge} text-xs font-medium px-2 py-0.5`}
						>
							{typeLabel}
						</Badge>
						<span className="text-xs text-slate-500 font-medium">
							{formatDistanceToNow(new Date(notification.createdAt), {
								addSuffix: true,
								locale: vi,
							})}
						</span>
					</div>

					{/* Title */}
					<h4
						className={`text-base font-semibold leading-tight ${
							!notification.isRead ? 'text-slate-900' : 'text-slate-700'
						}`}
					>
						{notification.title}
					</h4>

					{/* Message */}
					<p className="text-sm text-slate-600 leading-relaxed">{notification.message}</p>

					{/* Actions */}
					{showActions && (
						<div className="flex items-center gap-2 pt-1">
							{!notification.isRead && onMarkAsRead && (
								<Button
									variant="ghost"
									size="sm"
									className="h-8 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3"
									onClick={e => {
										e.stopPropagation();
										onMarkAsRead(notification.id);
									}}
								>
									<Check className="h-3.5 w-3.5 mr-1.5" />
									Đánh dấu đã đọc
								</Button>
							)}
							<Button
								variant="ghost"
								size="sm"
								className="h-8 text-xs font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-100 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
							>
								<Eye className="h-3.5 w-3.5 mr-1.5" />
								Xem chi tiết
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default function NotificationsPage() {
	const router = useRouter();
	const { refreshNotifications } = useNotifications();
	const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
	const [allNotifications, setAllNotifications] = useState<NotificationDto[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);

	const loadNotifications = async (page = 1) => {
		setIsLoading(true);
		try {
			const result = await notificationService.getMyNotifications(page, 20);
			if (result.isSuccess && result.data) {
				// Check if data is a NotificationListResponse or just an array
				if (Array.isArray(result.data)) {
					// Data is an array directly
					setAllNotifications(result.data);
					setTotalCount(result.data.length);
					setTotalPages(1);
					setCurrentPage(1);
				} else {
					// Data is NotificationListResponse with pagination
					setAllNotifications(result.data.items);
					setTotalPages(result.data.totalPages);
					setTotalCount(result.data.totalCount);
					setCurrentPage(page);
				}
			}
		} catch (error) {
			console.error('Error loading notifications:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadNotifications();
	}, []);

	const handleMarkAsRead = async (notificationId: string) => {
		try {
			await notificationService.markAsRead(notificationId);
			// Update local state
			setAllNotifications(prev =>
				prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
			);
			// Refresh notification context
			refreshNotifications();
		} catch (error) {
			console.error('Error marking notification as read:', error);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			await notificationService.markAllAsRead();
			// Update local state
			setAllNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
			// Refresh notification context
			refreshNotifications();
		} catch (error) {
			console.error('Error marking all notifications as read:', error);
		}
	};

	const handleNotificationClick = (notification: NotificationDto) => {
		// Mark as read if unread
		if (!notification.isRead) {
			handleMarkAsRead(notification.id);
		}

		// Navigate based on notification type
		if (notification.relatedVisitId) {
			router.push(`/visits/${notification.relatedVisitId}`);
		} else if (notification.relatedStudyId) {
			router.push(`/records`);
		}
	};

	const handleRefresh = () => {
		loadNotifications(currentPage);
		refreshNotifications();
	};

	const filteredNotifications =
		activeTab === 'unread' ? allNotifications.filter(n => !n.isRead) : allNotifications;

	const unreadCount = allNotifications.filter(n => !n.isRead).length;

	return (
		<DashboardLayout>
			<div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl">
					{/* Header */}
					<div className="mb-8">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
							<div>
								<h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
									Trung tâm thông báo
								</h1>
								<p className="text-slate-600 text-sm sm:text-base">
									Quản lý và theo dõi tất cả thông báo của bạn
								</p>
							</div>
							<div className="flex items-center gap-2 sm:gap-3">
								<Button
									onClick={handleRefresh}
									variant="outline"
									size="sm"
									className="border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-colors"
									disabled={isLoading}
								>
									<RefreshCw className={`h-4 w-4 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
									<span className="hidden sm:inline">Làm mới</span>
								</Button>
								{unreadCount > 0 && (
									<Button
										onClick={handleMarkAllAsRead}
										size="sm"
										className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all"
									>
										<CheckCheck className="h-4 w-4 sm:mr-2" />
										<span className="hidden sm:inline">Đánh dấu tất cả</span>
									</Button>
								)}
							</div>
						</div>

						{/* Stats Cards - Professional Design */}
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
							{/* Total Card */}
							<Card className="relative overflow-hidden border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<Bell className="h-4 w-4 text-slate-500" />
												<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
													Tổng số
												</p>
											</div>
											<p className="text-3xl sm:text-4xl font-bold text-slate-900">{totalCount}</p>
											<p className="text-xs text-slate-500">thông báo</p>
										</div>
										<div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
											<Bell className="h-7 w-7 text-white" />
										</div>
									</div>
								</CardContent>
								<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
							</Card>

							{/* Unread Card */}
							<Card className="relative overflow-hidden border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<TrendingUp className="h-4 w-4 text-slate-500" />
												<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
													Chưa đọc
												</p>
											</div>
											<p className="text-3xl sm:text-4xl font-bold text-slate-900">{unreadCount}</p>
											<p className="text-xs text-slate-500">thông báo mới</p>
										</div>
										<div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
											<Check className="h-7 w-7 text-white" />
										</div>
									</div>
								</CardContent>
								<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
							</Card>

							{/* Read Card */}
							<Card className="relative overflow-hidden border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<CheckCheck className="h-4 w-4 text-slate-500" />
												<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
													Đã đọc
												</p>
											</div>
											<p className="text-3xl sm:text-4xl font-bold text-slate-900">
												{totalCount - unreadCount}
											</p>
											<p className="text-xs text-slate-500">thông báo</p>
										</div>
										<div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
											<CheckCheck className="h-7 w-7 text-white" />
										</div>
									</div>
								</CardContent>
								<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
							</Card>
						</div>
					</div>

					{/* Notifications List */}
					<Card className="border-slate-200 shadow-md bg-white">
						<CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
							<Tabs
								value={activeTab}
								onValueChange={(value: string) => setActiveTab(value as 'all' | 'unread')}
								className="w-full"
							>
								<TabsList className="grid w-full max-w-md grid-cols-2 bg-white border border-slate-200 p-1">
									<TabsTrigger
										value="all"
										className="data-[state=active]:bg-slate-900 data-[state=active]:text-white font-medium"
									>
										Tất cả ({allNotifications.length})
									</TabsTrigger>
									<TabsTrigger
										value="unread"
										className="data-[state=active]:bg-slate-900 data-[state=active]:text-white font-medium"
									>
										Chưa đọc ({unreadCount})
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</CardHeader>
						<CardContent className="p-0">
							{isLoading ? (
								<div className="py-20 text-center">
									<div className="inline-flex flex-col items-center gap-4">
										<div className="relative">
											<div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
											<Bell className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-blue-600" />
										</div>
										<p className="text-slate-600 font-medium">Đang tải thông báo...</p>
									</div>
								</div>
							) : filteredNotifications.length === 0 ? (
								<div className="py-20 text-center">
									<div className="inline-flex flex-col items-center gap-4 max-w-md mx-auto px-4">
										<div className="relative">
											<div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
												<Bell className="h-10 w-10 text-slate-400" />
											</div>
											<div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
												<Check className="h-4 w-4 text-slate-500" />
											</div>
										</div>
										<div className="space-y-2">
											<p className="text-lg font-semibold text-slate-900">
												{activeTab === 'unread'
													? 'Không có thông báo chưa đọc'
													: 'Không có thông báo'}
											</p>
											<p className="text-sm text-slate-500">
												{activeTab === 'unread'
													? 'Bạn đã đọc hết tất cả thông báo. Tuyệt vời!'
													: 'Chưa có thông báo nào được gửi đến bạn'}
											</p>
										</div>
									</div>
								</div>
							) : (
								<div className="divide-y divide-slate-100">
									{filteredNotifications.map(notification => (
										<NotificationItem
											key={notification.id}
											notification={notification}
											onMarkAsRead={handleMarkAsRead}
											onClick={() => handleNotificationClick(notification)}
										/>
									))}
								</div>
							)}

							{/* Pagination */}
							{totalPages > 1 && !isLoading && (
								<div className="flex items-center justify-center gap-2 p-6 border-t border-slate-100 bg-slate-50/50">
									<Button
										variant="outline"
										size="sm"
										onClick={() => loadNotifications(currentPage - 1)}
										disabled={currentPage === 1}
										className="font-medium"
									>
										Trang trước
									</Button>
									<div className="flex items-center gap-1">
										{Array.from({ length: totalPages }, (_, i) => i + 1)
											.filter(page => {
												// Show first, last, current, and adjacent pages
												return (
													page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
												);
											})
											.map((page, index, array) => (
												<React.Fragment key={page}>
													{index > 0 && array[index - 1] !== page - 1 && (
														<span className="px-2 text-slate-400">...</span>
													)}
													<Button
														variant={page === currentPage ? 'default' : 'outline'}
														size="sm"
														onClick={() => loadNotifications(page)}
														className={
															page === currentPage
																? 'bg-slate-900 hover:bg-slate-800 font-semibold min-w-[36px]'
																: 'font-medium min-w-[36px]'
														}
													>
														{page}
													</Button>
												</React.Fragment>
											))}
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => loadNotifications(currentPage + 1)}
										disabled={currentPage === totalPages}
										className="font-medium"
									>
										Trang sau
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</DashboardLayout>
	);
}
