import React from 'react';
import { Clock, Users, UserPlus, Activity } from 'lucide-react';

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
		<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
			{/* Waiting Count */}
			<div className="stat-card-primary">
				<div className="relative z-10">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-blue-100 text-sm font-medium mb-1">Đang chờ khám</p>
							<p className="text-4xl font-bold mb-1">{waitingCount}</p>
							<p className="text-blue-200 text-xs">bệnh nhân trong hàng đợi</p>
						</div>
						<div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
							<Clock className="h-7 w-7 text-white" />
						</div>
					</div>
				</div>
			</div>

			{/* Today Registered */}
			<div className="stat-card-teal">
				<div className="relative z-10">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-teal-100 text-sm font-medium mb-1">Đã tiếp nhận</p>
							<p className="text-4xl font-bold mb-1">{todayRegistered}</p>
							<p className="text-teal-200 text-xs">lượt khám hôm nay</p>
						</div>
						<div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
							<Users className="h-7 w-7 text-white" />
						</div>
					</div>
				</div>
			</div>

			{/* New Patients */}
			<div className="stat-card-emerald">
				<div className="relative z-10">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-emerald-100 text-sm font-medium mb-1">Bệnh nhân mới</p>
							<p className="text-4xl font-bold mb-1">{newPatients}</p>
							<p className="text-emerald-200 text-xs">đăng ký hôm nay</p>
						</div>
						<div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
							<UserPlus className="h-7 w-7 text-white" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
