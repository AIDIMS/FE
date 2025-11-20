'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/api';
import type { UserDto } from '@/lib/types';

interface AuthContextType {
	user: UserDto | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (username: string, password: string) => Promise<boolean>;
	logout: () => Promise<void>;
	refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
	const [user, setUser] = useState<UserDto | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	const pathname = usePathname();

	// Load user from localStorage on mount
	useEffect(() => {
		const loadUser = () => {
			try {
				const storedUser = authService.getCurrentUser();
				const isAuth = authService.isAuthenticated();

				if (isAuth && storedUser) {
					setUser(storedUser);

					// Sync token to cookie for middleware
					const token =
						globalThis.window === undefined ? localStorage.getItem('accessToken') : null;
					if (token) {
						document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Strict`;
					}
				} else {
					setUser(null);
					// Clear cookie if not authenticated
					document.cookie = 'accessToken=; path=/; max-age=0';
				}
			} catch (error) {
				console.error('Error loading user:', error);
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		};

		loadUser();
	}, []);

	// Check auth on route change
	useEffect(() => {
		const checkAuth = () => {
			const isAuth = authService.isAuthenticated();
			const protectedRoutes = ['/dashboard', '/patients', '/records', '/settings'];
			const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));

			if (isProtectedRoute && !isAuth) {
				router.push('/auth/login');
			}
		};

		if (!isLoading) {
			checkAuth();
		}
	}, [pathname, isLoading, router]);

	const login = async (username: string, password: string): Promise<boolean> => {
		try {
			const result = await authService.login({ username, password });

			if (result.isSuccess && result.data) {
				setUser(result.data.user);

				// Set cookie for middleware
				document.cookie = `accessToken=${result.data.accessToken}; path=/; max-age=86400; SameSite=Strict`;

				return true;
			}
			return false;
		} catch (error) {
			console.error('Login error:', error);
			return false;
		}
	};

	const logout = async () => {
		try {
			await authService.logout();
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			setUser(null);
			document.cookie = 'accessToken=; path=/; max-age=0';
			router.push('/auth/login');
		}
	};

	const refreshUser = () => {
		const storedUser = authService.getCurrentUser();
		setUser(storedUser);
	};

	const value = React.useMemo<AuthContextType>(
		() => ({
			user,
			isAuthenticated: !!user && authService.isAuthenticated(),
			isLoading,
			login,
			logout,
			refreshUser,
		}),
		[user, isLoading, login, logout, refreshUser]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
