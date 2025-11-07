"use client"

import React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, Users, FileText, TrendingUp, Pencil } from "lucide-react"

export default function DashboardPage() {
	const stats = [
		{
			title: "Tổng bệnh nhân",
			value: "1,234",
			description: "+12% so với tháng trước",
			icon: <Users className="h-5 w-5" />,
		},
		{
			title: "Lượt khám hôm nay",
			value: "45",
			description: "+5 so với hôm qua",
			icon: <FileText className="h-5 w-5" />,
		},
		{
			title: "Chỉ định chụp",
			value: "28",
			description: "12 đang chờ xử lý",
			icon: <TrendingUp className="h-5 w-5" />,
		},
	]

	return (
		<DashboardLayout>
			<div className="container mx-auto px-4 py-6 max-w-7xl">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-2">
						<div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
							<LayoutDashboard className="h-6 w-6 text-white" />
						</div>
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
							<p className="text-sm text-gray-600 mt-1">
								Theo dõi và quản lý hệ thống DICOM
							</p>
						</div>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid gap-6 md:grid-cols-3 mb-8">
					{stats.map((stat, index) => (
						<Card key={index} className="border-gray-200 shadow-md hover:shadow-lg transition-shadow">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
								<CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
									{stat.title}
								</CardTitle>
								<div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
									{stat.icon}
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
								<p className="text-xs text-gray-500">
									{stat.description}
								</p>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Recent Activity */}
				<Card className="border-gray-200 shadow-md">
					<CardHeader className="border-b border-gray-200">
						<CardTitle className="text-lg font-semibold text-gray-900">
							Hoạt động gần đây
						</CardTitle>
						<CardDescription className="mt-1">
							Các thao tác và cập nhật mới nhất trong hệ thống
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-6">
						<div className="space-y-4">
							<div className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
								<div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
									<svg
										className="h-5 w-5 text-green-600"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 4v16m8-8H4"
										/>
									</svg>
								</div>
								<div className="flex-1">
									<p className="font-semibold text-gray-900">Bệnh nhân mới được thêm</p>
									<p className="text-sm text-gray-500 mt-1">
										Nguyễn Văn A - 5 phút trước
									</p>
								</div>
							</div>
							<div className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
								<div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
									<FileText className="h-5 w-5 text-blue-600" />
								</div>
								<div className="flex-1">
									<p className="font-semibold text-gray-900">Chỉ định chụp mới</p>
									<p className="text-sm text-gray-500 mt-1">
										CT Scan - 15 phút trước
									</p>
								</div>
							</div>
							<div className="flex items-start gap-4">
								<div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
									<Pencil className="h-5 w-5 text-purple-600" />
								</div>
								<div className="flex-1">
									<p className="font-semibold text-gray-900">Cập nhật hồ sơ bệnh nhân</p>
									<p className="text-sm text-gray-500 mt-1">
										Trần Thị B - 1 giờ trước
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</DashboardLayout>
	)
}

