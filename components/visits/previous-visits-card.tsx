import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Calendar, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

interface PreviousVisit {
	id: string;
	visit_date: string;
	symptoms: string;
	diagnosis: string;
	status: string;
}

interface PreviousVisitsCardProps {
	previousVisits: PreviousVisit[];
	onVisitClick?: (visitId: string) => void;
}

export function PreviousVisitsCard({ previousVisits, onVisitClick }: PreviousVisitsCardProps) {
	return (
		<Card className="border border-slate-200 bg-white shadow-sm">
			<CardHeader className="pb-3 border-b border-slate-100">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<History className="h-4 w-4 text-slate-500" />
						<CardTitle className="text-sm font-semibold text-slate-800">Lịch sử khám</CardTitle>
					</div>
					{previousVisits.length > 0 && (
						<span className="text-xs text-slate-500">{previousVisits.length} lần</span>
					)}
				</div>
			</CardHeader>
			<CardContent className="p-0">
				{previousVisits.length === 0 ? (
					<div className="p-6 text-center">
						<History className="h-8 w-8 text-slate-300 mx-auto mb-2" />
						<p className="text-sm text-slate-500">Chưa có lịch sử</p>
					</div>
				) : (
					<div className="divide-y divide-slate-100">
						{previousVisits.map(pv => (
							<div
								key={pv.id}
								className="p-4 hover:bg-slate-50 cursor-pointer transition-colors group"
								onClick={() => onVisitClick?.(pv.id)}
							>
								<div className="flex items-center justify-between mb-1.5">
									<div className="flex items-center gap-2">
										<Calendar className="h-3.5 w-3.5 text-slate-400" />
										<p className="text-xs font-medium text-slate-700">
											{formatDate(pv.visit_date)}
										</p>
									</div>
									<ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
								</div>
								<p className="text-xs text-slate-600 line-clamp-2">{pv.symptoms}</p>
								{pv.diagnosis && (
									<p className="text-xs text-slate-800 font-medium mt-1.5 line-clamp-1">
										{pv.diagnosis}
									</p>
								)}
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
