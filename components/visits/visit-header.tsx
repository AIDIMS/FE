import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Stethoscope } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

interface VisitHeaderProps {
	patientName: string;
	patientCode: string;
	visitDate: string;
	doctorName?: string;
	status: string;
	onBack: () => void;
	getStatusBadge: (status: string) => React.ReactNode;
}

export function VisitHeader({
	patientName,
	patientCode,
	visitDate,
	doctorName,
	status,
	onBack,
	getStatusBadge,
}: VisitHeaderProps) {
	return (
		<div className="mb-6">
			<Button
				variant="ghost"
				onClick={onBack}
				className="mb-4 text-slate-600 hover:text-slate-900 hover:bg-slate-100 -ml-2"
			>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Quay lại
			</Button>

			<div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
				<div className="flex items-start justify-between">
					<div>
						<h1 className="text-2xl font-bold text-slate-900 mb-2">{patientName}</h1>
						<div className="flex items-center gap-4 text-sm text-slate-600">
							<div className="flex items-center gap-1.5">
								<span className="text-slate-400">Mã BN:</span>
								<span className="font-mono font-medium text-slate-700">{patientCode}</span>
							</div>
							<span className="text-slate-300">•</span>
							<div className="flex items-center gap-1.5">
								<Calendar className="h-4 w-4 text-slate-400" />
								<span>{formatDate(visitDate)}</span>
							</div>
							{doctorName && (
								<>
									<span className="text-slate-300">•</span>
									<div className="flex items-center gap-1.5">
										<Stethoscope className="h-4 w-4 text-slate-400" />
										<span>{doctorName}</span>
									</div>
								</>
							)}
						</div>
					</div>
					{getStatusBadge(status)}
				</div>
			</div>
		</div>
	);
}
