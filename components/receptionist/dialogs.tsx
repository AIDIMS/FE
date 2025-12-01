import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { PatientForm } from '@/components/patients/patient-form';
import CheckInForm, { CheckInFormData } from '@/components/receptionist/check-in-form';
import { Patient } from '@/lib/types/patient';

interface AddPatientDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function AddPatientDialog({ open, onOpenChange, onSuccess }: AddPatientDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Thêm bệnh nhân mới</DialogTitle>
					<DialogDescription>Điền thông tin bệnh nhân mới vào hệ thống</DialogDescription>
				</DialogHeader>
				<PatientForm
					onSubmit={() => {
						onOpenChange(false);
						onSuccess?.();
					}}
					onCancel={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}

interface CheckInDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	patient: Patient | null;
	onSubmit: (data: CheckInFormData) => Promise<void>;
	onCancel: () => void;
}

export function CheckInDialog({
	open,
	onOpenChange,
	patient,
	onSubmit,
	onCancel,
}: CheckInDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>Đăng ký khám mới</DialogTitle>
					<DialogDescription>Tạo phiếu khám cho bệnh nhân: {patient?.fullName}</DialogDescription>
				</DialogHeader>
				{patient && <CheckInForm patient={patient} onSubmit={onSubmit} onCancel={onCancel} />}
			</DialogContent>
		</Dialog>
	);
}
