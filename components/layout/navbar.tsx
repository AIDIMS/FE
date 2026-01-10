'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { User, ChevronRight, Check } from 'lucide-react';
import { SidebarTrigger } from './sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts';
import { getRoleName } from '@/lib/utils/role';
import { NotificationBell } from './notification-bell';

interface NavbarProps {
	readonly onSidebarToggle: () => void;
}

const breadcrumbMap: Record<string, string> = {
	'/dashboard': 'Tổng quan',
	'/users': 'Quản lý người dùng',
	'/patients': 'Bệnh nhân',
	'/visits': 'Ca khám',
	'/records': 'Hồ sơ',
	'/notifications': 'Thông báo',
	'/settings': 'Cài đặt',
	'/profile': 'Hồ sơ cá nhân',
	'/receptionist': 'Lễ tân',
	'/doctor/queue': 'Hàng chờ khám',
	'/technician/worklist': 'Danh sách chụp',
};

export function Navbar({ onSidebarToggle }: NavbarProps) {
	const pathname = usePathname();
	const { user } = useAuth();

	// Build dynamic breadcrumbs
	const getBreadcrumbs = () => {
		const segments = pathname.split('/').filter(Boolean);
		const breadcrumbs: Array<{ label: string; href: string }> = [];

		// If at dashboard, only show DicomPro
		if (pathname === '/dashboard' || pathname === '/') {
			return [{ label: 'DicomPro', href: '/dashboard' }];
		}

		// Always start with dashboard
		breadcrumbs.push({ label: 'DicomPro', href: '/dashboard' });

		if (segments.length === 0) return breadcrumbs;

		// Build path incrementally
		let currentPath = '';
		segments.forEach(segment => {
			currentPath += `/${segment}`;

			// Skip if it's the same as dashboard (already added)
			if (currentPath === '/dashboard') return;

			// Check if it's a known route
			if (breadcrumbMap[currentPath]) {
				breadcrumbs.push({
					label: breadcrumbMap[currentPath],
					href: currentPath,
				});
			} else if (currentPath.startsWith('/patients/') && segments.length > 1) {
				// Dynamic route for patient detail
				breadcrumbs.push({
					label: 'Chi tiết bệnh nhân',
					href: currentPath,
				});
			} else if (currentPath.startsWith('/visits/') && segments.length > 1) {
				// Dynamic route for visit detail
				breadcrumbs.push({
					label: 'Chi tiết ca khám',
					href: currentPath,
				});
			} else if (currentPath.startsWith('/records/')) {
				breadcrumbs.push({
					label: 'Chi tiết hồ sơ',
					href: currentPath,
				});
			} else if (currentPath.startsWith('/technician/orders/')) {
				breadcrumbs.push({
					label: 'Chi tiết chỉ định',
					href: currentPath,
				});
			}
		});

		return breadcrumbs;
	};

	const breadcrumbs = getBreadcrumbs();

	return (
		<header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 md:px-6">
			<SidebarTrigger onClick={onSidebarToggle} />

			{/* Breadcrumbs */}
			<div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
				{breadcrumbs.map((crumb, index) => (
					<React.Fragment key={`${crumb.href}-${index}`}>
						{index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
						{index === breadcrumbs.length - 1 ? (
							<span className="text-gray-900 font-medium">{crumb.label}</span>
						) : (
							<Link href={crumb.href} className="hover:text-gray-700 transition-colors">
								{crumb.label}
							</Link>
						)}
					</React.Fragment>
				))}
			</div>

			{/* Right side actions */}
			<div className="flex flex-1 items-center justify-end gap-4">
				{/* Notifications */}
				<NotificationBell />

				{/* User menu */}
				<div className="flex items-center gap-3">
					<div className="hidden sm:flex items-center gap-2">
						<div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0D47A1] to-[#1565C0] flex items-center justify-center text-white text-sm font-bold shrink-0">
							{user?.firstName?.charAt(0)}
							{user?.lastName?.charAt(0)}
						</div>
						<div className="flex flex-col">
							<span className="text-sm font-medium text-gray-900">
								{user ? getRoleName(user.role) : ''}
							</span>
							<div className="flex items-center gap-1">
								<Check className="h-3 w-3 text-blue-500" />
								<span className="text-xs text-gray-500">Online</span>
							</div>
						</div>
					</div>
					<Link href="/profile">
						<Button variant="ghost" size="icon" className="rounded-full sm:hidden">
							<div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
								<User className="h-5 w-5 text-gray-600" />
							</div>
						</Button>
					</Link>
				</div>
			</div>
		</header>
	);
}
