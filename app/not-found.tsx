import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted p-4">
			<div className="max-w-2xl w-full text-center space-y-8">
				{/* Icon & Animation */}
				<div className="flex justify-center">
					<div className="relative">
						<div className="absolute inset-0 animate-ping opacity-20">
							<FileQuestion className="w-32 h-32 text-primary" />
						</div>
						<FileQuestion className="w-32 h-32 text-primary relative" />
					</div>
				</div>

				{/* Error Code */}
				<div className="space-y-4">
					<h1 className="text-8xl md:text-9xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
						404
					</h1>
					<h2 className="text-2xl md:text-3xl font-semibold text-foreground">
						Không Tìm Thấy Trang
					</h2>
					<p className="text-muted-foreground text-lg max-w-md mx-auto">
						Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
					</p>
				</div>

				{/* Actions */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
					<Button asChild size="lg" className="min-w-40">
						<Link href="/dashboard">
							<Home className="mr-2 h-5 w-5" />
							Về Trang Chủ
						</Link>
					</Button>
					<Button asChild variant="outline" size="lg" className="min-w-40">
						<Link href="javascript:history.back()">
							<ArrowLeft className="mr-2 h-5 w-5" />
							Quay Lại
						</Link>
					</Button>
				</div>

				{/* Helpful Links */}
				<div className="pt-8 border-t border-border">
					<p className="text-sm text-muted-foreground mb-4">Có thể bạn đang tìm kiếm:</p>
					<div className="flex flex-wrap gap-4 justify-center">
						<Link href="/dashboard" className="text-sm text-primary hover:underline">
							Dashboard
						</Link>
						<Link href="/patients" className="text-sm text-primary hover:underline">
							Quản Lý Bệnh Nhân
						</Link>
						<Link href="/users" className="text-sm text-primary hover:underline">
							Quản Lý Người Dùng
						</Link>
						<Link href="/settings" className="text-sm text-primary hover:underline">
							Cài Đặt
						</Link>
					</div>
				</div>

				{/* Support Info */}
				<div className="pt-4">
					<p className="text-xs text-muted-foreground">
						Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ với quản trị viên hệ thống.
					</p>
				</div>
			</div>
		</div>
	);
}
