import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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
		<div className="mb-8">
			<Button
				variant="ghost"
				onClick={onBack}
				className="mb-6 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
			>
				<ArrowLeft className="h-5 w-5 mr-2" />
				Quay lại
			</Button>

			<div className="flex items-start justify-between mb-6">
				<div>
					<h1 className="text-3xl font-bold text-slate-900 mb-3">{patientName}</h1>
					<div className="flex items-center gap-4 text-sm">
						<div className="flex items-center gap-2">
							<span className="text-slate-500">Mã BN:</span>
							<span className="font-mono font-semibold text-slate-900">{patientCode}</span>
						</div>
						<span className="text-slate-300">•</span>
						<span className="text-slate-600">{formatDate(visitDate)}</span>
						{doctorName && (
							<>
								<span className="text-slate-300">•</span>
								<span className="text-slate-600">{doctorName}</span>
							</>
						)}
					</div>
				</div>
				{getStatusBadge(status)}
			</div>
		</div>
	);
}
