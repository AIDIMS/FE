import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

interface PatientInfoCardProps {
	patientName: string;
	patientCode: string;
	patientGender: 'male' | 'female' | 'other';
	patientAge: number;
	patientDob: string;
}

export function PatientInfoCard({
	patientName,
	patientCode,
	patientGender,
	patientAge,
	patientDob,
}: PatientInfoCardProps) {
	return (
		<Card className="border border-slate-200 bg-white shadow-lg">
			<CardHeader className="border-b border-slate-200 pb-4">
				<div className="flex items-center gap-2">
					<User className="h-5 w-5 text-blue-600" />
					<CardTitle className="text-base font-semibold text-slate-900">
						Thông tin bệnh nhân
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="p-6 space-y-4">
				<div>
					<p className="text-xs text-slate-500 mb-1">Họ tên</p>
					<p className="text-lg font-semibold text-slate-900">{patientName}</p>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-xs text-slate-500 mb-1">Mã BN</p>
						<p className="font-mono text-sm text-slate-700">{patientCode}</p>
					</div>
					<div>
						<p className="text-xs text-slate-500 mb-1">Tuổi</p>
						<p className="text-sm text-slate-700">{patientAge} tuổi</p>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-xs text-slate-500 mb-1">Giới tính</p>
						<p className="text-sm text-slate-700">{patientGender === 'male' ? 'Nam' : 'Nữ'}</p>
					</div>
					<div>
						<p className="text-xs text-slate-500 mb-1">Ngày sinh</p>
						<p className="text-sm text-slate-700">{formatDate(patientDob)}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
