'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
	Users,
	Stethoscope,
	UserPlus,
	Camera,
	Settings,
	LogOut,
	Menu,
	UserCog,
	Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useAuth } from '@/lib/contexts/auth-context';

interface NavItem {
	title: string;
	href: string;
	icon: React.ReactNode;
	roles?: number[]; // 0=admin, 1=doctor, 2=receptionist, 3=technician
}

const navItems: NavItem[] = [
	{
		title: 'Quản lý người dùng',
		href: '/users',
		icon: <UserCog className="h-5 w-5" />,
		roles: [0], // Admin only
	},
	{
		title: 'Lễ tân',
		href: '/receptionist',
		icon: <UserPlus className="h-5 w-5" />,
		roles: [0, 2], // Admin & Receptionist
	},
	{
		title: 'Hàng chờ khám',
		href: '/doctor/queue',
		icon: <Stethoscope className="h-5 w-5" />,
		roles: [0, 1], // Admin & Doctor
	},
	{
		title: 'Danh sách chụp',
		href: '/technician/worklist',
		icon: <Camera className="h-5 w-5" />,
		roles: [0, 3], // Admin & Technician
	},
	{
		title: 'Bệnh nhân',
		href: '/patients',
		icon: <Users className="h-5 w-5" />,
		roles: [0, 1, 2], // Admin, Doctor, Receptionist
	},
	{
		title: 'Thông báo',
		href: '/notifications',
		icon: <Bell className="h-5 w-5" />,
		roles: [0, 1, 2, 3], // All roles
	},
	{
		title: 'Cài đặt',
		href: '/settings',
		icon: <Settings className="h-5 w-5" />,
		roles: [0, 1, 2, 3], // All roles
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
					// Filter by user role
					if (item.roles && user?.role !== undefined && !item.roles.includes(user.role)) {
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
