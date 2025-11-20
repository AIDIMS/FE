'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Menu, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/lib/contexts/auth-context';

interface NavItem {
	title: string;
	href: string;
	icon: React.ReactNode;
	adminOnly?: boolean;
}

const navItems: NavItem[] = [
	{
		title: 'Tổng quan',
		href: '/dashboard',
		icon: <LayoutDashboard className="h-5 w-5" />,
	},
	{
		title: 'Người dùng',
		href: '/users',
		icon: <UserCog className="h-5 w-5" />,
		adminOnly: true,
	},
	{
		title: 'Bệnh nhân',
		href: '/patients',
		icon: <Users className="h-5 w-5" />,
	},
	{
		title: 'Hồ sơ',
		href: '/records',
		icon: <FileText className="h-5 w-5" />,
	},
	{
		title: 'Cài đặt',
		href: '/settings',
		icon: <Settings className="h-5 w-5" />,
	},
];

interface SidebarProps {
	className?: string;
	mobileOpen?: boolean;
	onMobileClose?: () => void;
}

export function Sidebar({ className, mobileOpen, onMobileClose }: Readonly<SidebarProps>) {
	const pathname = usePathname();
	const router = useRouter();
	const { logout, user } = useAuth();
	const [isLoggingOut, setIsLoggingOut] = React.useState(false);

	const handleLogout = async () => {
		if (isLoggingOut) return;

		try {
			setIsLoggingOut(true);
			await logout();
		} catch (error) {
			console.error('Logout error:', error);
			router.push('/auth/login');
		} finally {
			setIsLoggingOut(false);
		}
	};

	const SidebarContent = () => (
		<div className="flex h-full flex-col bg-white">
			{/* Logo */}
			<div className="flex h-24 items-center justify-center border-b border-gray-200 px-6">
				<Link href="/dashboard" className="flex items-center justify-center">
					<Image
						src="/logo.png"
						alt="DicomPro Logo"
						width={160}
						height={160}
						className="h-20 w-auto object-contain"
						priority
					/>
				</Link>
			</div>

			{/* Navigation */}
			<nav className="flex-1 space-y-1 p-4">
				{navItems.map(item => {
					// Hide admin-only items for non-admin users
					if (item.adminOnly && user?.role !== 0) {
						return null;
					}

					const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
					return (
						<Link
							key={item.href}
							href={item.href}
							onClick={onMobileClose}
							className={cn(
								'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
								isActive
									? 'bg-blue-50 text-blue-600 [&_svg]:text-blue-600 font-semibold'
									: 'text-gray-600 hover:bg-gray-50 [&_svg]:text-gray-500'
							)}
						>
							{item.icon}
							<span>{item.title}</span>
						</Link>
					);
				})}
			</nav>

			{/* Footer */}
			<div className="border-t border-gray-200 p-4">
				<Button
					variant="ghost"
					disabled={isLoggingOut}
					className="w-full justify-start gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
					onClick={handleLogout}
				>
					<LogOut className="h-5 w-5" />
					<span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
				</Button>
			</div>
		</div>
	);

	return (
		<>
			{/* Desktop Sidebar */}
			<aside
				className={cn(
					'hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:z-40 border-r border-gray-200 bg-white',
					className
				)}
			>
				<SidebarContent />
			</aside>

			{/* Mobile Sidebar */}
			<Sheet open={mobileOpen} onOpenChange={open => !open && onMobileClose?.()}>
				<SheetContent side="left" className="w-64 p-0">
					<SidebarContent />
				</SheetContent>
			</Sheet>
		</>
	);
}

export function SidebarTrigger({ onClick }: Readonly<{ onClick: () => void }>) {
	return (
		<Button variant="ghost" size="icon" className="md:hidden" onClick={onClick}>
			<Menu className="h-5 w-5" />
			<span className="sr-only">Toggle sidebar</span>
		</Button>
	);
}
