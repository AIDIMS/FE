import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Users, UserPlus, ChevronRight } from 'lucide-react';
import { PatientVisit } from '@/lib/types/patient';

interface WaitingPatient extends PatientVisit {
	patientName: string;
	patientCode: string;
}

interface WaitingQueueProps {
	waitingQueue: WaitingPatient[];
	onAddPatient: () => void;
}

export function WaitingQueue({ waitingQueue, onAddPatient }: WaitingQueueProps) {
	const getWaitingTime = (visit: WaitingPatient) => {
		const waitingSince = new Date(visit.updatedAt || visit.createdAt).getTime();
		const currentTime = new Date().getTime();
		const diffMinutes = Math.floor(Math.abs(currentTime - waitingSince) / 60000);

		if (diffMinutes < 60) return `${diffMinutes} phút`;
		const hours = Math.floor(diffMinutes / 60);
		return `${hours}h ${diffMinutes % 60}m`;
	};

	const getWaitingTimeClass = (visit: WaitingPatient) => {
		const waitingSince = new Date(visit.updatedAt || visit.createdAt).getTime();
		const currentTime = new Date().getTime();
		const diffMinutes = Math.floor(Math.abs(currentTime - waitingSince) / 60000);

		if (diffMinutes >= 30) return 'text-red-600 bg-red-50';
		if (diffMinutes >= 15) return 'text-amber-600 bg-amber-50';
		return 'text-emerald-600 bg-emerald-50';
	};

	return (
		<div className="medical-card-elevated">
			{/* Header */}
			<div className="medical-card-header rounded-t-xl">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-[#0D47A1]/10 flex items-center justify-center">
							<Clock className="h-5 w-5 text-[#0D47A1]" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-slate-900">Danh sách chờ khám</h2>
							<p className="text-sm text-slate-500">{waitingQueue.length} bệnh nhân đang chờ</p>
						</div>
					</div>
					<Button onClick={onAddPatient} className="btn-medical-primary h-10 px-4 rounded-xl">
						<UserPlus className="h-4 w-4 mr-2" />
						Thêm bệnh nhân mới
					</Button>
				</div>
			</div>

			{/* Content */}
			<div className="p-0">
				{waitingQueue.length === 0 ? (
					<div className="text-center py-16 px-6">
						<div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
							<Users className="h-8 w-8 text-slate-400" />
						</div>
						<p className="text-slate-600 font-medium mb-1">Chưa có bệnh nhân chờ khám</p>
						<p className="text-sm text-slate-400">Hàng đợi hiện tại đang trống</p>
					</div>
				) : (
					<div className="divide-y divide-slate-100">
						{waitingQueue.map((visit, index) => (
							<div
								key={visit.id}
								className={`group p-5 cursor-pointer transition-all duration-200 ${
									index === 0
										? 'bg-gradient-to-r from-[#0D47A1]/5 to-transparent hover:from-[#0D47A1]/10'
										: 'hover:bg-slate-50'
								}`}
							>
								<div className="flex items-center gap-5">
									{/* Queue Number */}
									<div className="relative">
										<div
											className={`queue-number ${
												index === 0
													? 'queue-number-active'
													: 'queue-number-default group-hover:border-slate-300'
											}`}
										>
											{index + 1}
										</div>
										{index === 0 && (
											<div className="absolute -top-1 -right-1 w-3 h-3 bg-[#0D47A1] rounded-full animate-pulse-soft" />
										)}
									</div>

									{/* Patient Info */}
									<div className="flex-1 grid grid-cols-4 gap-6 items-center">
										<div>
											<p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">
												Mã BN
											</p>
											<p className="text-sm font-semibold text-slate-900 font-mono">
												{visit.patientCode}
											</p>
										</div>
										<div>
											<p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">
												Họ tên
											</p>
											<p className="text-sm font-semibold text-slate-900">{visit.patientName}</p>
										</div>
										<div>
											<p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">
												Triệu chứng
											</p>
											<p className="text-sm text-slate-600 line-clamp-1">{visit.symptoms || '—'}</p>
										</div>
										<div className="text-right">
											<p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">
												Thời gian chờ
											</p>
											<span
												className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold ${getWaitingTimeClass(visit)}`}
											>
												{getWaitingTime(visit)}
											</span>
										</div>
									</div>

									{/* Arrow */}
									<ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[#0D47A1] group-hover:translate-x-1 transition-all" />
								</div>

								{/* First Patient Indicator */}
								{index === 0 && (
									<div className="mt-4 pt-3 border-t border-[#0D47A1]/10 ml-[76px]">
										<div className="inline-flex items-center gap-2 text-sm text-[#0D47A1] font-medium">
											<div className="w-2 h-2 bg-[#0D47A1] rounded-full animate-pulse-soft" />
											<span>Bệnh nhân tiếp theo</span>
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
