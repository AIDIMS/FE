'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { NotificationType, type Notification } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NotificationToastProps {
	notification: Notification;
	onClose: () => void;
	autoClose?: boolean;
	autoCloseDelay?: number;
}

const iconMap = {
	[NotificationType.SUCCESS]: CheckCircle,
	[NotificationType.ERROR]: AlertCircle,
	[NotificationType.WARNING]: AlertTriangle,
	[NotificationType.INFO]: Info,
};

const colorMap = {
	[NotificationType.SUCCESS]: 'bg-green-50 border-green-200 text-green-800',
	[NotificationType.ERROR]: 'bg-red-50 border-red-200 text-red-800',
	[NotificationType.WARNING]: 'bg-yellow-50 border-yellow-200 text-yellow-800',
	[NotificationType.INFO]: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconColorMap = {
	[NotificationType.SUCCESS]: 'text-green-500',
	[NotificationType.ERROR]: 'text-red-500',
	[NotificationType.WARNING]: 'text-yellow-500',
	[NotificationType.INFO]: 'text-blue-500',
};

export function NotificationToast({
	notification,
	onClose,
	autoClose = true,
	autoCloseDelay = 5000,
}: NotificationToastProps) {
	const [isExiting, setIsExiting] = useState(false);
	const Icon = iconMap[notification.type];

	const handleClose = useCallback(() => {
		setIsExiting(true);
		setTimeout(() => {
			onClose();
		}, 300);
	}, [onClose]);

	useEffect(() => {
		if (autoClose) {
			const timer = setTimeout(() => {
				handleClose();
			}, autoCloseDelay);

			return () => clearTimeout(timer);
		}
	}, [autoClose, autoCloseDelay, handleClose]);

	return (
		<div
			className={cn(
				'flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ease-in-out min-w-[320px] max-w-md',
				colorMap[notification.type],
				isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
			)}
		>
			<Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', iconColorMap[notification.type])} />

			<div className="flex-1 min-w-0">
				<h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
				<p className="text-sm opacity-90">{notification.message}</p>

				{notification.action && (
					<button
						onClick={() => {
							notification.action?.onClick();
							handleClose();
						}}
						className="mt-2 text-sm font-medium underline hover:no-underline"
					>
						{notification.action.label}
					</button>
				)}
			</div>

			<button
				onClick={handleClose}
				className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
				aria-label="Đóng thông báo"
			>
				<X className="h-4 w-4" />
			</button>
		</div>
	);
}
