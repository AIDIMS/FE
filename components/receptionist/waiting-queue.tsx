import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, UserPlus } from 'lucide-react';
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
	const getWaitingTime = (createdAt: string) => {
		// Parse UTC time from server and convert to local time for comparison
		const createdTime = new Date(createdAt).getTime();
		const currentTime = new Date().getTime();
		const diffMinutes = Math.floor(Math.abs(currentTime - createdTime) / 60000);

		if (diffMinutes < 60) return `${diffMinutes} phút`;
		const hours = Math.floor(diffMinutes / 60);
		return `${hours} giờ ${diffMinutes % 60} phút`;
	};

	return (
		<Card className="border border-slate-200 bg-white shadow-sm">
			<CardHeader className="border-b border-slate-200 pb-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Clock className="h-5 w-5 text-slate-600" />
						<div>
							<CardTitle className="text-lg font-semibold text-slate-900">
								Danh sách chờ khám
							</CardTitle>
							<p className="text-sm text-slate-500 mt-1">
								{waitingQueue.length} bệnh nhân đang chờ
							</p>
						</div>
					</div>
					<Button onClick={onAddPatient} className="bg-blue-600 hover:bg-blue-700 text-white">
						<UserPlus className="h-4 w-4 mr-2" />
						Thêm bệnh nhân mới
					</Button>
				</div>
			</CardHeader>
			<CardContent className="p-6">
				{waitingQueue.length === 0 ? (
					<div className="text-center py-16">
						<Users className="h-16 w-16 text-slate-300 mx-auto mb-3" />
						<p className="text-slate-500 text-base font-medium">Chưa có bệnh nhân chờ khám</p>
					</div>
				) : (
					<div className="space-y-px bg-slate-100">
						{waitingQueue.map((visit, index) => (
							<div
								key={visit.id}
								className={`group p-5 cursor-pointer transition-all ${
									index === 0 ? 'bg-blue-50 hover:bg-blue-100/80' : 'bg-white hover:bg-slate-50'
								}`}
							>
								<div className="flex items-center gap-5">
									{/* Queue Number */}
									<div className="relative">
										<div
											className={`flex items-center justify-center w-14 h-14 rounded-2xl font-bold text-xl transition-all ${
												index === 0
													? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
													: 'bg-white text-slate-900 border-2 border-slate-200 group-hover:border-slate-300'
											}`}
										>
											{index + 1}
										</div>
										{index === 0 && (
											<div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
										)}
									</div>

									{/* Patient Info */}
									<div className="flex-1 grid grid-cols-4 gap-6 items-center">
										<div>
											<p className="text-xs text-slate-500 mb-1">Mã BN</p>
											<p className="text-sm font-semibold text-slate-900">{visit.patientCode}</p>
										</div>
										<div>
											<p className="text-xs text-slate-500 mb-1">Họ tên</p>
											<p className="text-sm font-semibold text-slate-900">{visit.patientName}</p>
										</div>
										<div>
											<p className="text-xs text-slate-500 mb-1">Triệu chứng</p>
											<p className="text-sm text-slate-700 line-clamp-1">{visit.symptoms || '-'}</p>
										</div>
										<div className="text-right">
											<p className="text-xs text-slate-500 mb-1">Thời gian chờ</p>
											<p className="text-base font-bold text-slate-900">
												{getWaitingTime(visit.createdAt)}
											</p>
										</div>
									</div>
								</div>

								{index === 0 && (
									<div className="mt-4 pt-3 border-t border-blue-200/50 ml-[76px]">
										<div className="inline-flex items-center gap-2 text-sm text-slate-600">
											<div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
											<span className="font-medium">Tiếp theo</span>
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
