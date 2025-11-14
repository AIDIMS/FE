"use client"

import React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Bell, Search, User, Menu, ChevronRight, Check } from "lucide-react"
import { SidebarTrigger } from "./sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/auth-context"

interface NavbarProps {
	onSidebarToggle: () => void
}

const breadcrumbMap: Record<string, string> = {
	"/dashboard": "Tổng quan",
	"/users": "Quản lý người dùng",
	"/receptionist": "Lễ tân",
	"/doctor/queue": "Hàng chờ khám",
	"/technician/worklist": "Danh sách chụp",
	"/patients": "Bệnh nhân",
	"/visits": "Ca khám",
	"/settings": "Cài đặt",
}

export function Navbar({ onSidebarToggle }: NavbarProps) {
	const pathname = usePathname()
	const { user } = useAuth()
	
	// Get role label
	const getRoleLabel = () => {
		if (!user) return "Người dùng"
		switch (user.role) {
			case 0: return "Admin"
			case 1: return "Bác sĩ"
			case 2: return "Lễ tân"
			case 3: return "Kỹ thuật viên"
			default: return "Người dùng"
		}
	}
	
	// Build dynamic breadcrumbs
	const getBreadcrumbs = () => {
		const segments = pathname.split("/").filter(Boolean)
		const breadcrumbs: Array<{ label: string; href: string }> = []
		
		// If at dashboard, only show DicomPro
		if (pathname === "/dashboard" || pathname === "/") {
			return [{ label: "DicomPro", href: "/dashboard" }]
		}
		
		// Always start with dashboard
		breadcrumbs.push({ label: "DicomPro", href: "/dashboard" })
		
		if (segments.length === 0) return breadcrumbs
		
		// Build path incrementally
		let currentPath = ""
		segments.forEach((segment, index) => {
			currentPath += `/${segment}`
			
			// Skip if it's the same as dashboard (already added)
			if (currentPath === "/dashboard") return
			
			// Check if it's a known route
			if (breadcrumbMap[currentPath]) {
				breadcrumbs.push({
					label: breadcrumbMap[currentPath],
					href: currentPath,
				})
			} else if (currentPath.startsWith("/patients/") && segments.length > 1) {
				// Dynamic route for patient detail
				breadcrumbs.push({
					label: "Chi tiết bệnh nhân",
					href: currentPath,
				})
			} else if (currentPath.startsWith("/visits/") && segments.length > 1) {
				// Dynamic route for visit detail
				breadcrumbs.push({
					label: "Chi tiết ca khám",
					href: currentPath,
				})
			} else if (currentPath.startsWith("/technician/orders/") && segments.length > 2) {
				// Dynamic route for technician execution
				breadcrumbs.push({
					label: "Thực hiện chụp",
					href: currentPath,
				})
			}
		})
		
		return breadcrumbs
	}
	
	const breadcrumbs = getBreadcrumbs()

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
							<Link 
								href={crumb.href} 
								className="hover:text-gray-700 transition-colors"
							>
								{crumb.label}
							</Link>
						)}
					</React.Fragment>
				))}
			</div>

			{/* Right side actions */}
			<div className="flex flex-1 items-center justify-end gap-4">
				{/* Notifications */}
				<Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-50">
					<Bell className="h-5 w-5" />
					<span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-red-500"></span>
					<span className="sr-only">Thông báo</span>
				</Button>

				{/* User menu */}
				<div className="flex items-center gap-3">
					<div className="hidden sm:flex items-center gap-2">
						<div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
							<User className="h-4 w-4 text-slate-600" />
						</div>
						<div className="flex flex-col">
							<span className="text-sm font-medium text-slate-900">
								{user ? `${user.firstName} ${user.lastName}` : "Người dùng"}
							</span>
							<span className="text-xs text-slate-500">{getRoleLabel()}</span>
						</div>
					</div>
					<Button variant="ghost" size="icon" className="rounded-full sm:hidden">
						<div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
							<User className="h-4 w-4 text-slate-600" />
						</div>
					</Button>
				</div>
			</div>
		</header>
	)
}

