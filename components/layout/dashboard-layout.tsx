"use client"

import React, { useState } from "react"
import { Sidebar } from "./sidebar"
import { Navbar } from "./navbar"

interface DashboardLayoutProps {
	children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

	return (
		<div className="flex h-screen overflow-hidden bg-background">
			{/* Sidebar */}
			<Sidebar
				mobileOpen={mobileSidebarOpen}
				onMobileClose={() => setMobileSidebarOpen(false)}
			/>

			{/* Main content */}
			<div className="flex flex-1 flex-col overflow-hidden md:pl-64">
				{/* Navbar */}
				<Navbar onSidebarToggle={() => setMobileSidebarOpen(true)} />

				{/* Page content */}
				<main className="flex-1 overflow-y-auto bg-gray-50">
					{children}
				</main>
			</div>
		</div>
	)
}

