'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/api';

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		const isAuthenticated = authService.isAuthenticated();

		if (!isAuthenticated) {
			// Save current path to redirect back after login
			const redirectUrl = `/auth/login?redirect=${encodeURIComponent(pathname || '/dashboard')}`;
			router.push(redirectUrl);
		}
	}, [router, pathname]);

	// Show loading or null while checking auth
	const isAuthenticated = authService.isAuthenticated();

	if (!isAuthenticated) {
		return null;
	}

	return <>{children}</>;
}
