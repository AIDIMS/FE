'use client';

import React, { useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { hasPermission, getDefaultPathForRole } from '@/lib/config/permissions';
import { UserRole } from '@/lib/types/auth';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoleGuardProps {
	children: React.ReactNode;
	allowedRoles?: UserRole[];
}

/**
 * RoleGuard component - Protects routes based on user role
 *
 * Usage:
 * 1. Wrap page content with RoleGuard (uses route-based permissions from config)
 * 2. Or specify allowedRoles prop for custom permissions
 */
export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { user, isLoading } = useAuth();

	// Calculate authorization status synchronously using useMemo
	const authStatus = useMemo(() => {
		if (isLoading) {
			return { status: 'loading' as const };
		}

		if (!user) {
			return { status: 'unauthenticated' as const };
		}

		// Check authorization
		let hasAccess = false;

		if (allowedRoles) {
			// Use custom allowed roles if provided
			hasAccess = allowedRoles.includes(user.role);
		} else {
			// Use route-based permissions from config
			hasAccess = hasPermission(pathname || '', user.role);
		}

		return { status: hasAccess ? ('authorized' as const) : ('unauthorized' as const) };
	}, [user, isLoading, pathname, allowedRoles]);

	// Handle unauthenticated - redirect to login
	if (authStatus.status === 'unauthenticated') {
		// Use setTimeout to avoid calling router.push during render
		if (typeof window !== 'undefined') {
			setTimeout(() => {
				router.push(`/auth/login?redirect=${encodeURIComponent(pathname || '/dashboard')}`);
			}, 0);
		}
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="flex items-center gap-3 text-slate-500">
					<div className="h-5 w-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
					<span>Đang chuyển hướng...</span>
				</div>
			</div>
		);
	}

	// Loading state
	if (authStatus.status === 'loading') {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="flex items-center gap-3 text-slate-500">
					<div className="h-5 w-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
					<span>Đang kiểm tra quyền truy cập...</span>
				</div>
			</div>
		);
	}

	// Access denied
	if (authStatus.status === 'unauthorized') {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center max-w-md px-6">
					<div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
						<ShieldX className="h-8 w-8 text-red-600" />
					</div>
					<h2 className="text-xl font-bold text-slate-900 mb-2">Không có quyền truy cập</h2>
					<p className="text-slate-600 mb-6">
						Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng
						đây là lỗi.
					</p>
					<div className="flex items-center justify-center gap-3">
						<Button variant="outline" onClick={() => router.back()} className="gap-2">
							<ArrowLeft className="h-4 w-4" />
							Quay lại
						</Button>
						<Button
							onClick={() => {
								const defaultPath = user ? getDefaultPathForRole(user.role) : '/auth/login';
								router.push(defaultPath);
							}}
							className="gap-2 bg-blue-600 hover:bg-blue-700"
						>
							<Home className="h-4 w-4" />
							Trang chính
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Authorized - render children
	return <>{children}</>;
}

/**
 * Higher-order component version of RoleGuard
 */
export function withRoleGuard<P extends object>(
	Component: React.ComponentType<P>,
	allowedRoles?: UserRole[]
) {
	return function GuardedComponent(props: P) {
		return (
			<RoleGuard allowedRoles={allowedRoles}>
				<Component {...props} />
			</RoleGuard>
		);
	};
}
