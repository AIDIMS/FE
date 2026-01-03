import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

interface PatientInfoCardProps {
	patientName: string;
	patientCode: string;
	dateOfBirth?: string | null;
	gender?: 'male' | 'female' | 'other' | null;
}

export function PatientInfoCard({
	patientName,
	patientCode,
	dateOfBirth,
	gender,
}: PatientInfoCardProps) {
	return (
		<Card className="border border-slate-200 bg-white shadow-sm">
			<CardHeader className="pb-3 border-b border-slate-100">
				<div className="flex items-center gap-2">
					<User className="h-4 w-4 text-slate-500" />
					<CardTitle className="text-sm font-semibold text-slate-800">
						Thông tin bệnh nhân
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="p-4 space-y-3">
				<div>
					<p className="text-xs text-slate-500 mb-1">Họ và tên</p>
					<p className="text-sm font-semibold text-slate-900">{patientName}</p>
				</div>
				<div>
					<p className="text-xs text-slate-500 mb-1">Mã bệnh nhân</p>
					<p className="text-sm font-mono text-slate-700">{patientCode}</p>
				</div>
				{dateOfBirth && (
					<div>
						<p className="text-xs text-slate-500 mb-1">Ngày sinh</p>
						<p className="text-sm text-slate-700">{formatDate(dateOfBirth)}</p>
					</div>
				)}
				{gender && (
					<div>
						<p className="text-xs text-slate-500 mb-1">Giới tính</p>
						<p className="text-sm text-slate-700">
							{gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác'}
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
