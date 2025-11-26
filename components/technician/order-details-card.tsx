import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

interface OrderDetailsCardProps {
	modalityRequested: string;
	bodyPartRequested: string;
	requestingDoctor: string;
	createdAt: string;
	reasonForStudy: string | null;
	notes?: string;
}

export function OrderDetailsCard({
	modalityRequested,
	bodyPartRequested,
	requestingDoctor,
	createdAt,
	reasonForStudy,
	notes,
}: OrderDetailsCardProps) {
	return (
		<Card className="border border-slate-200 bg-white shadow-lg">
			<CardHeader className="border-b border-slate-200 pb-4">
				<div className="flex items-center gap-2">
					<FileText className="h-5 w-5 text-blue-600" />
					<CardTitle className="text-base font-semibold text-slate-900">
						Chi tiết chỉ định
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="p-6 space-y-4">
				<div>
					<p className="text-xs text-slate-500 mb-1">Loại máy</p>
					<p className="text-lg font-bold text-blue-600">{modalityRequested}</p>
				</div>
				<div>
					<p className="text-xs text-slate-500 mb-1">Vùng chụp</p>
					<p className="text-base text-slate-900 font-medium">{bodyPartRequested}</p>
				</div>
				<div>
					<p className="text-xs text-slate-500 mb-1">Bác sĩ chỉ định</p>
					<p className="text-sm text-slate-700">{requestingDoctor}</p>
				</div>
				<div>
					<p className="text-xs text-slate-500 mb-1">Thời gian tạo</p>
					<div className="flex items-center gap-2 text-sm text-slate-700">
						<Clock className="h-4 w-4" />
						<span>{formatDate(createdAt)}</span>
					</div>
				</div>
				<div>
					<p className="text-xs text-slate-500 mb-2">Lý do khám</p>
					<div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
						<p className="text-sm text-slate-700 leading-relaxed">{reasonForStudy || 'Không có'}</p>
					</div>
				</div>
				{notes && (
					<div>
						<p className="text-xs text-slate-500 mb-2">Ghi chú đặc biệt</p>
						<div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
							<p className="text-sm text-amber-800 leading-relaxed">{notes}</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
