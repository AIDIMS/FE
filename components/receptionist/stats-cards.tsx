import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, UserPlus } from 'lucide-react';

interface StatsCardsProps {
	waitingCount: number;
	todayRegistered?: number;
	newPatients?: number;
}

export function StatsCards({
	waitingCount,
	todayRegistered = 12,
	newPatients = 3,
}: StatsCardsProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			<Card className="border border-slate-200 bg-white shadow-sm">
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-slate-500 text-sm font-medium mb-1">Đang chờ</p>
							<p className="text-4xl font-bold text-slate-900 mb-1">{waitingCount}</p>
							<p className="text-slate-500 text-xs">bệnh nhân</p>
						</div>
						<div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
							<Clock className="h-7 w-7 text-slate-600" />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="border border-slate-200 bg-white shadow-sm">
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-slate-500 text-sm font-medium mb-1">Đã đăng ký hôm nay</p>
							<p className="text-4xl font-bold text-slate-900 mb-1">{todayRegistered}</p>
							<p className="text-slate-500 text-xs">lượt khám</p>
						</div>
						<div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
							<Users className="h-7 w-7 text-slate-600" />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="border border-slate-200 bg-white shadow-sm">
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-slate-500 text-sm font-medium mb-1">Bệnh nhân mới</p>
							<p className="text-4xl font-bold text-slate-900 mb-1">{newPatients}</p>
							<p className="text-slate-500 text-xs">hôm nay</p>
						</div>
						<div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
							<UserPlus className="h-7 w-7 text-slate-600" />
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
