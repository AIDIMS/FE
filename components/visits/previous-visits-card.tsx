import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Calendar } from 'lucide-react';
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
}

export function PreviousVisitsCard({ previousVisits }: PreviousVisitsCardProps) {
	return (
		<Card className="border border-slate-200 bg-white shadow-sm">
			<CardHeader className="pb-3 border-b border-slate-100">
				<div className="flex items-center gap-2">
					<History className="h-4 w-4 text-slate-600" />
					<CardTitle className="text-sm font-semibold text-slate-900">Lịch sử khám</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				{previousVisits.length === 0 ? (
					<div className="p-8 text-center">
						<History className="h-8 w-8 text-slate-300 mx-auto mb-2" />
						<p className="text-sm text-slate-500">Chưa có lịch sử</p>
					</div>
				) : (
					<div className="divide-y divide-slate-100">
						{previousVisits.map(pv => (
							<div key={pv.id} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors">
								<div className="flex items-center gap-2 mb-2">
									<Calendar className="h-3.5 w-3.5 text-slate-400" />
									<p className="text-xs font-semibold text-slate-900">
										{formatDate(pv.visit_date)}
									</p>
								</div>
								<p className="text-xs text-slate-600 mb-1">{pv.symptoms}</p>
								<p className="text-xs text-slate-900 font-medium">{pv.diagnosis}</p>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
