'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Notification, NotificationType } from '@/lib/types';

interface NotificationContextType {
	notifications: Notification[];
	unreadCount: number;
	addNotification: (
		type: NotificationType,
		title: string,
		message: string,
		action?: { label: string; onClick: () => void }
	) => void;
	markAsRead: (id: string) => void;
	markAllAsRead: () => void;
	removeNotification: (id: string) => void;
	clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'notifications';
const MAX_NOTIFICATIONS = 50;

export function NotificationProvider({ children }: { readonly children: React.ReactNode }) {
	const [notifications, setNotifications] = useState<Notification[]>(() => {
		// Initialize from localStorage
		if (typeof window === 'undefined') return [];

		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				// Convert timestamp strings back to Date objects
				return parsed.map((n: Notification) => ({
					...n,
					timestamp: new Date(n.timestamp),
				}));
			}
		} catch (error) {
			console.error('Error loading notifications:', error);
		}
		return [];
	});

	// Save to localStorage whenever notifications change
	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
		} catch (error) {
			console.error('Error saving notifications:', error);
		}
	}, [notifications]);

	const addNotification = useCallback(
		(
			type: NotificationType,
			title: string,
			message: string,
			action?: { label: string; onClick: () => void }
		) => {
			const newNotification: Notification = {
				id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
				type,
				title,
				message,
				timestamp: new Date(),
				read: false,
				action,
			};

			setNotifications(prev => {
				// Add to beginning and limit total count
				const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
				return updated;
			});
		},
		[]
	);

	const markAsRead = useCallback((id: string) => {
		setNotifications(prev =>
			prev.map(notification =>
				notification.id === id ? { ...notification, read: true } : notification
			)
		);
	}, []);

	const markAllAsRead = useCallback(() => {
		setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
	}, []);

	const removeNotification = useCallback((id: string) => {
		setNotifications(prev => prev.filter(notification => notification.id !== id));
	}, []);

	const clearAll = useCallback(() => {
		setNotifications([]);
	}, []);

	const unreadCount = notifications.filter(n => !n.read).length;

	const value: NotificationContextType = {
		notifications,
		unreadCount,
		addNotification,
		markAsRead,
		markAllAsRead,
		removeNotification,
		clearAll,
	};

	return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotification() {
	const context = useContext(NotificationContext);
	if (context === undefined) {
		throw new Error('useNotification must be used within a NotificationProvider');
	}
	return context;
}
