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
	const connectionAttempted = useRef(false);

	const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5104/api';
	// SignalR Hub URL (without /api prefix)
	const HUB_URL = API_URL.replace('/api', '');

	// Check if URL is valid (has protocol)
	const isValidUrl = API_URL.startsWith('http://') || API_URL.startsWith('https://');

	// Fetch notifications from API
	const refreshNotifications = useCallback(async () => {
		const token = getToken();
		if (!token || !isValidUrl) return;

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
		} catch {
			// Silently fail - notifications API might not be available
		}
	}, [API_URL]);

	// Mark notification as read
	const markAsRead = useCallback(
		async (notificationId: string) => {
			const token = getToken();
			if (!token || !isValidUrl) return;

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
			} catch {
				// Silently fail
			}
		},
		[API_URL]
	);

	// Mark all notifications as read
	const markAllAsRead = useCallback(async () => {
		const token = getToken();
		if (!token || !isValidUrl) return;

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
		} catch {
			// Silently fail
		}
	}, [API_URL]);

	// Setup SignalR connection
	useEffect(() => {
		const token = getToken();

		if (!user || !token) {
			// Cleanup existing connection
			if (connectionRef.current) {
				connectionRef.current.stop().catch(() => {});
				connectionRef.current = null;
			}
			connectionAttempted.current = false;
			return;
		}

		// Skip if URL is invalid
		if (!isValidUrl) {
			console.warn('SignalR: Invalid API URL, skipping connection');
			return;
		}

		// Prevent multiple connection attempts
		if (connectionAttempted.current && connectionRef.current) {
			return;
		}

		connectionAttempted.current = true;

		const newConnection = new signalR.HubConnectionBuilder()
			.withUrl(`${HUB_URL}/hubs/notifications`, {
				accessTokenFactory: () => token,
			})
			.withAutomaticReconnect({
				nextRetryDelayInMilliseconds: retryContext => {
					// Stop retrying after 3 attempts
					if (retryContext.previousRetryCount >= 3) {
						return null;
					}
					// Exponential backoff: 1s, 2s, 4s
					return Math.pow(2, retryContext.previousRetryCount) * 1000;
				},
			})
			.configureLogging(signalR.LogLevel.Warning) // Only log warnings and errors
			.build();

		// Handle incoming notifications
		newConnection.on('ReceiveNotification', (notification: NotificationDto) => {
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

		// Start connection with error handling
		newConnection
			.start()
			.then(() => {
				setIsConnected(true);
				refreshNotifications(); // Load initial notifications
			})
			.catch(() => {
				// SignalR connection failed - this is expected if backend is not running
				// The app will still work, just without real-time notifications
				setIsConnected(false);
			});

		// Handle reconnection
		newConnection.onreconnected(() => {
			setIsConnected(true);
			refreshNotifications();
		});

		newConnection.onreconnecting(() => {
			setIsConnected(false);
		});

		newConnection.onclose(() => {
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
				connectionRef.current.stop().catch(() => {});
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
