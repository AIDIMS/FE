'use client';

import React from 'react';
import { useNotification } from '@/lib/contexts';
import { NotificationToast } from './notification-toast';

export function NotificationContainer() {
	const { notifications, removeNotification, markAsRead } = useNotification();

	// Only show the 5 most recent unread notifications as toasts
	const toastNotifications = notifications.filter(n => !n.read).slice(0, 5);

	const handleClose = (id: string) => {
		markAsRead(id);
	};

	if (toastNotifications.length === 0) {
		return null;
	}

	return (
		<div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
			<div className="flex flex-col gap-3 pointer-events-auto">
				{toastNotifications.map(notification => (
					<NotificationToast
						key={notification.id}
						notification={notification}
						onClose={() => handleClose(notification.id)}
					/>
				))}
			</div>
		</div>
	);
}
