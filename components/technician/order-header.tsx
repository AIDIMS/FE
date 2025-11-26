import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface OrderHeaderProps {
	orderId: string;
	priority: 'normal' | 'urgent' | 'stat';
	modality: string;
	status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export function OrderHeader({ orderId, priority, modality, status }: OrderHeaderProps) {
	const router = useRouter();

	const getPriorityBadge = (priority: string) => {
		switch (priority) {
			case 'stat':
				return (
					<span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold uppercase rounded-lg border border-red-300">
						STAT
					</span>
				);
			case 'urgent':
				return (
					<span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase rounded-lg border border-orange-300">
						Urgent
					</span>
				);
			default:
				return (
					<span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs uppercase rounded-lg border border-slate-300">
						Normal
					</span>
				);
		}
	};

	const getStatusLabel = () => {
		switch (status) {
			case 'in_progress':
				return 'Đang thực hiện';
			case 'completed':
				return 'Đã hoàn thành';
			case 'cancelled':
				return 'Đã hủy';
			default:
				return 'Chờ thực hiện';
		}
	};

	return (
		<div className="mb-8">
			<Button
				variant="ghost"
				onClick={() => router.back()}
				className="mb-6 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
			>
				<ArrowLeft className="h-5 w-5 mr-2" />
				Quay lại
			</Button>

			<div className="flex items-start justify-between">
				<div>
					<div className="flex items-center gap-3 mb-2">
						<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
							Thực hiện chỉ định
						</h1>
						{getPriorityBadge(priority)}
						<span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-lg border border-blue-300">
							{modality}
						</span>
					</div>
					<p className="text-slate-600">
						Mã chỉ định: <span className="font-mono text-slate-900">{orderId}</span>
					</p>
				</div>

				<div className="flex items-center gap-3">
					<div className="text-right">
						<p className="text-xs text-slate-500 mb-1">Trạng thái</p>
						<div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-lg border border-blue-300">
							<div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
							<span className="text-sm font-medium text-blue-700">{getStatusLabel()}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
