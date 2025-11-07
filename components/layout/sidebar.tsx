"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
	LayoutDashboard,
	Users,
	FileText,
	Settings,
	LogOut,
	Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface NavItem {
	title: string
	href: string
	icon: React.ReactNode
}

const navItems: NavItem[] = [
	{
		title: "Tổng quan",
		href: "/dashboard",
		icon: <LayoutDashboard className="h-5 w-5" />,
	},
	{
		title: "Bệnh nhân",
		href: "/patients",
		icon: <Users className="h-5 w-5" />,
	},
	{
		title: "Hồ sơ",
		href: "/records",
		icon: <FileText className="h-5 w-5" />,
	},
	{
		title: "Cài đặt",
		href: "/settings",
		icon: <Settings className="h-5 w-5" />,
	},
]

interface SidebarProps {
	className?: string
	mobileOpen?: boolean
	onMobileClose?: () => void
}

export function Sidebar({ className, mobileOpen, onMobileClose }: SidebarProps) {
	const pathname = usePathname()

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
				{navItems.map((item) => {
					const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
					return (
						<Link
							key={item.href}
							href={item.href}
							onClick={onMobileClose}
                     className={cn(
                       "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                       isActive
                         ? "bg-blue-50 text-blue-600 [&_svg]:text-blue-600 font-semibold"
                         : "text-gray-600 hover:bg-gray-50 [&_svg]:text-gray-500"
                     )}
						>
							{item.icon}
							<span>{item.title}</span>
						</Link>
					)
				})}
			</nav>

			{/* Footer */}
			<div className="border-t border-gray-200 p-4">
				<Button
					variant="ghost"
					className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
					onClick={() => {
						// Handle logout
						console.log("Logout")
					}}
				>
					<LogOut className="h-5 w-5" />
					<span>Đăng xuất</span>
				</Button>
			</div>
		</div>
	)

	return (
		<>
			{/* Desktop Sidebar */}
			<aside
				className={cn(
					"hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:z-40 border-r border-gray-200 bg-white",
					className
				)}
			>
				<SidebarContent />
			</aside>

			{/* Mobile Sidebar */}
			<Sheet open={mobileOpen} onOpenChange={(open) => !open && onMobileClose?.()}>
				<SheetContent side="left" className="w-64 p-0">
					<SidebarContent />
				</SheetContent>
			</Sheet>
		</>
	)
}

export function SidebarTrigger({ onClick }: { onClick: () => void }) {
	return (
		<Button
			variant="ghost"
			size="icon"
			className="md:hidden"
			onClick={onClick}
		>
			<Menu className="h-5 w-5" />
			<span className="sr-only">Toggle sidebar</span>
		</Button>
	)
}

