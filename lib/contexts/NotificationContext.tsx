'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { NotificationDto } from '@/lib/types/notification';
import { useAuth } from './auth-context';

interface NotificationContextType {
	notifications: NotificationDto[];
	unreadCount: number;
	isConnected: boolean;
	markAsRead: (notificationId: string) => Promise<void>;
	markAllAsRead: () => Promise<void>;
	refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error('useNotifications must be used within NotificationProvider');
	}
	return context;
};

// Helper to get token from localStorage
const getToken = (): string | null => {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem('accessToken');
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { user } = useAuth();
	const [isConnected, setIsConnected] = useState(false);
	const [notifications, setNotifications] = useState<NotificationDto[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const connectionRef = useRef<signalR.HubConnection | null>(null);

	const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5104/api';

	// SignalR Hub URL - remove ONLY the trailing /api, not any occurrence in the domain
	const HUB_URL = API_URL.replace(/\/api$/, '');

	// Fetch notifications from API
	const refreshNotifications = useCallback(async () => {
		const token = getToken();
		if (!token) return;

		try {
			const response = await fetch(`${API_URL}/notifications/unread`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				if (data.isSuccess && data.data) {
					setNotifications(data.data);
					setUnreadCount(data.data.length);
				}
			}
		} catch (error) {
			console.error('Error fetching notifications:', error);
		}
	}, [API_URL]);

	// Mark notification as read
	const markAsRead = useCallback(
		async (notificationId: string) => {
			const token = getToken();
			if (!token) return;

			try {
				const response = await fetch(`${API_URL}/notifications/${notificationId}/mark-read`, {
					method: 'PUT',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.ok) {
					// Update local state
					setNotifications(prev => prev.filter(n => n.id !== notificationId));
					setUnreadCount(prev => Math.max(0, prev - 1));
				}
			} catch (error) {
				console.error('Error marking notification as read:', error);
			}
		},
		[API_URL]
	);

	// Mark all notifications as read
	const markAllAsRead = useCallback(async () => {
		const token = getToken();
		if (!token) return;

		try {
			const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				setNotifications([]);
				setUnreadCount(0);
			}
		} catch (error) {
			console.error('Error marking all notifications as read:', error);
		}
	}, [API_URL]);

	// Setup SignalR connection
	useEffect(() => {
		const token = getToken();

		if (!user || !token) {
			// Cleanup existing connection
			if (connectionRef.current) {
				connectionRef.current.stop().catch(console.error);
				connectionRef.current = null;
			}
			return;
		}

		console.log('[NotificationContext] Connecting to SignalR:', {
			HUB_URL: `${HUB_URL}/hubs/notifications`,
			hasToken: !!token,
			userId: user.id,
		});

		const newConnection = new signalR.HubConnectionBuilder()
			.withUrl(`${HUB_URL}/hubs/notifications`, {
				accessTokenFactory: () => token,
			})
			.withAutomaticReconnect()
			.configureLogging(signalR.LogLevel.Information)
			.build();

		// Handle incoming notifications
		newConnection.on('ReceiveNotification', (notification: NotificationDto) => {
			console.log('Received notification:', notification);
			setNotifications(prev => [notification, ...prev]);
			setUnreadCount(prev => prev + 1);

			// Optional: Show browser notification
			if ('Notification' in window && Notification.permission === 'granted') {
				new Notification(notification.title, {
					body: notification.message,
					icon: '/logo.png',
				});
			}
		});

		// Start connection
		newConnection
			.start()
			.then(() => {
				console.log('SignalR Connected');
				setIsConnected(true);
				refreshNotifications(); // Load initial notifications
			})
			.catch(err => console.error('SignalR Connection Error:', err));

		// Handle reconnection
		newConnection.onreconnected(() => {
			console.log('SignalR Reconnected');
			setIsConnected(true);
			refreshNotifications();
		});

		newConnection.onreconnecting(() => {
			console.log('SignalR Reconnecting...');
			setIsConnected(false);
		});

		newConnection.onclose(() => {
			console.log('SignalR Disconnected');
			setIsConnected(false);
		});

		connectionRef.current = newConnection;

		// Request browser notification permission
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission();
		}

		// Cleanup
		return () => {
			if (connectionRef.current) {
				connectionRef.current.stop();
			}
		};
	}, [user, HUB_URL, refreshNotifications]);

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				unreadCount,
				isConnected,
				markAsRead,
				markAllAsRead,
				refreshNotifications,
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
};
