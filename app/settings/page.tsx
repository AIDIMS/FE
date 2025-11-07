"use client"

import React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default function SettingsPage() {
	return (
		<DashboardLayout>
			<div className="container mx-auto px-4 py-6 max-w-7xl">
				<div className="mb-6">
					<div className="flex items-center gap-3 mb-2">
						<Settings className="h-8 w-8 text-primary" />
						<h1 className="text-3xl font-bold">Cài đặt</h1>
					</div>
					<p className="text-muted-foreground">
						Quản lý cài đặt hệ thống và tài khoản
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Cài đặt hệ thống</CardTitle>
						<CardDescription>
							Trang này đang được phát triển
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">
							Nội dung sẽ được cập nhật sau.
						</p>
					</CardContent>
				</Card>
			</div>
		</DashboardLayout>
	)
}

