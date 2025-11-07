"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}

export function Pagination({
	currentPage,
	totalPages,
	onPageChange,
}: PaginationProps) {
	const getPageNumbers = () => {
		const pages: (number | string)[] = []
		
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i)
			}
		} else {
			if (currentPage <= 3) {
				for (let i = 1; i <= 4; i++) pages.push(i)
				pages.push("...")
				pages.push(totalPages)
			} else if (currentPage >= totalPages - 2) {
				pages.push(1)
				pages.push("...")
				for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
			} else {
				pages.push(1)
				pages.push("...")
				for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
				pages.push("...")
				pages.push(totalPages)
			}
		}
		
		return pages
	}

	return (
		<div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="h-8 w-8 p-0"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				
				<div className="flex items-center gap-1">
					{getPageNumbers().map((page, index) => (
						<React.Fragment key={index}>
							{page === "..." ? (
								<span className="px-2 text-gray-400">...</span>
							) : (
								<Button
									variant={currentPage === page ? "default" : "ghost"}
									size="sm"
									onClick={() => onPageChange(page as number)}
									className={cn(
										"h-8 w-8 p-0",
										currentPage === page
											? "bg-blue-600 text-white hover:bg-blue-700"
											: "text-gray-700 hover:bg-gray-100"
									)}
								>
									{page}
								</Button>
							)}
						</React.Fragment>
					))}
				</div>
				
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="h-8 w-8 p-0"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}

