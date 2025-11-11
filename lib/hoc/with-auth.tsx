'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
	return function ProtectedComponent(props: P) {
		const router = useRouter();
		const { isAuthenticated, isLoading } = useAuth();

		useEffect(() => {
			if (!isLoading && !isAuthenticated) {
				router.push('/auth/login');
			}
		}, [isAuthenticated, isLoading, router]);

		// Show loading state while checking auth
		if (isLoading) {
			return (
				<div className="flex h-screen items-center justify-center">
					<div className="text-center">
						<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
						<p className="mt-4 text-gray-600">Đang tải...</p>
					</div>
				</div>
			);
		}

		// Don't render component if not authenticated
		if (!isAuthenticated) {
			return null;
		}

		return <Component {...props} />;
	};
}
