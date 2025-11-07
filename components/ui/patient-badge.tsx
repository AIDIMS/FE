"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PatientBadgeProps {
	variant?: "admin" | "access" | "default"
	children: React.ReactNode
	className?: string
}

export function PatientBadge({ variant = "default", children, className }: PatientBadgeProps) {
	const variantStyles = {
		admin: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
		access: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
		default: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100",
	}

	return (
		<Badge
			variant="outline"
			className={cn(
				"rounded-md px-2 py-0.5 text-xs font-medium",
				variantStyles[variant],
				className
			)}
		>
			{children}
		</Badge>
	)
}

