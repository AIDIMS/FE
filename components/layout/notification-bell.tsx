'use client';

import React from 'react';
import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/lib/contexts/NotificationContext';
import { NotificationDto, NotificationType } from '@/lib/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

const getNotificationIcon = (type: NotificationType) => {
	switch (type) {
		case NotificationType.VisitCreated:
			return '🏥';
		case NotificationType.ImagingOrderAssigned:
			return '📋';
		case NotificationType.AiAnalysisCompleted:
			return '🤖';
		case NotificationType.DiagnosisCompleted:
			return '✅';
		default:
			return '📢';
	}
};

const getNotificationColor = (type: NotificationType) => {
	switch (type) {
		case NotificationType.VisitCreated:
			return 'bg-blue-100 text-blue-800 border-blue-200';
		case NotificationType.ImagingOrderAssigned:
			return 'bg-orange-100 text-orange-800 border-orange-200';
		case NotificationType.AiAnalysisCompleted:
			return 'bg-purple-100 text-purple-800 border-purple-200';
		case NotificationType.DiagnosisCompleted:
			return 'bg-green-100 text-green-800 border-green-200';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-200';
	}
};

const NotificationItem: React.FC<{
	notification: NotificationDto;
	onMarkAsRead: (id: string) => void;
	onClick: () => void;
}> = ({ notification, onMarkAsRead, onClick }) => {
	return (
		<div
			className="flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100 last:border-b-0"
			onClick={onClick}
		>
			<div
				className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl border ${getNotificationColor(notification.type)}`}
			>
				{getNotificationIcon(notification.type)}
			</div>
			<div className="flex-1 min-w-0">
				<div className="flex items-start justify-between gap-2">
					<h4 className="font-semibold text-sm text-slate-900 line-clamp-1">
						{notification.title}
					</h4>
					<Button
						variant="ghost"
						size="sm"
						className="h-6 w-6 p-0 shrink-0"
						onClick={e => {
							e.stopPropagation();
							onMarkAsRead(notification.id);
						}}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
				<p className="text-xs text-slate-600 mt-1 line-clamp-2">{notification.message}</p>
				<p className="text-xs text-slate-400 mt-1">
					{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })}
				</p>
			</div>
		</div>
	);
};

export const NotificationBell: React.FC = () => {
	const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } = useNotifications();
	const router = useRouter();

	const handleNotificationClick = (notification: NotificationDto) => {
		markAsRead(notification.id);

		// Navigate based on notification type
		if (notification.relatedVisitId) {
			router.push(`/visits/${notification.relatedVisitId}`);
		} else if (notification.relatedStudyId) {
			router.push(`/records`);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Bell className={`h-5 w-5 ${isConnected ? 'text-slate-700' : 'text-slate-400'}`} />
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
						>
							{unreadCount > 99 ? '99+' : unreadCount}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-96 p-0">
				<div className="flex items-center justify-between p-4 border-b border-slate-200">
					<h3 className="font-semibold text-slate-900">Thông báo</h3>
					<div className="flex items-center gap-2">
						{!isConnected && (
							<Badge variant="outline" className="text-xs">
								Offline
							</Badge>
						)}
						{unreadCount > 0 && (
							<Button
								variant="ghost"
								size="sm"
								className="h-7 text-xs"
								onClick={e => {
									e.stopPropagation();
									markAllAsRead();
								}}
							>
								<Check className="h-3 w-3 mr-1" />
								Đánh dấu tất cả đã đọc
							</Button>
						)}
					</div>
				</div>

				<ScrollArea className="h-[400px]">
					{notifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-40 text-slate-400">
							<Bell className="h-12 w-12 mb-2 opacity-20" />
							<p className="text-sm">Không có thông báo mới</p>
						</div>
					) : (
						<div>
							{notifications.map(notification => (
								<NotificationItem
									key={notification.id}
									notification={notification}
									onMarkAsRead={markAsRead}
									onClick={() => handleNotificationClick(notification)}
								/>
							))}
						</div>
					)}
				</ScrollArea>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
