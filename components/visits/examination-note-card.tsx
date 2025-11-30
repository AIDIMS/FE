import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ClipboardList, Save, FileText } from 'lucide-react';

interface ExaminationNote {
	diagnosis: string;
	treatment_plan: string;
	notes: string;
}

interface ExaminationNoteCardProps {
	symptoms: string;
	examinationNote: ExaminationNote;
	isSavingNote: boolean;
	onNoteChange: (note: ExaminationNote) => void;
	onSave: () => void;
}

export function ExaminationNoteCard({
	symptoms,
	examinationNote,
	isSavingNote,
	onNoteChange,
	onSave,
}: ExaminationNoteCardProps) {
	return (
		<Card className="border border-slate-200 bg-white shadow-sm">
			<CardHeader className="pb-4 border-b border-slate-200">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<ClipboardList className="h-4 w-4 text-slate-600" />
						<CardTitle className="text-sm font-semibold text-slate-900">Phiếu khám bệnh</CardTitle>
					</div>
					<Button
						onClick={onSave}
						disabled={isSavingNote}
						size="sm"
						className="bg-blue-600 hover:bg-blue-700 text-white"
					>
						<Save className="h-4 w-4 mr-2" />
						{isSavingNote ? 'Đang lưu...' : 'Lưu'}
					</Button>
				</div>
			</CardHeader>
			<CardContent className="p-6 space-y-6">
				{/* Current Symptoms */}
				<div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
					<div className="flex items-start gap-2">
						<FileText className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
						<div className="flex-1">
							<p className="text-xs font-semibold text-slate-700 mb-1">Lý do khám</p>
							<p className="text-sm text-slate-900 leading-relaxed">{symptoms}</p>
						</div>
					</div>
				</div>

				{/* Diagnosis */}
				<div className="space-y-2">
					<Label htmlFor="diagnosis" className="text-sm font-semibold text-slate-900">
						Chẩn đoán <span className="text-slate-400">*</span>
					</Label>
					<textarea
						id="diagnosis"
						rows={4}
						className="flex w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
						placeholder="Nhập chẩn đoán bệnh..."
						value={examinationNote.diagnosis}
						onChange={e => onNoteChange({ ...examinationNote, diagnosis: e.target.value })}
					/>
				</div>

				{/* Treatment Plan */}
				<div className="space-y-2">
					<Label htmlFor="treatment" className="text-sm font-semibold text-slate-900">
						Phương pháp điều trị <span className="text-slate-400">*</span>
					</Label>
					<textarea
						id="treatment"
						rows={4}
						className="flex w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
						placeholder="Nhập phương pháp điều trị, đơn thuốc..."
						value={examinationNote.treatment_plan}
						onChange={e => onNoteChange({ ...examinationNote, treatment_plan: e.target.value })}
					/>
				</div>

				{/* Additional Notes */}
				<div className="space-y-2">
					<Label htmlFor="notes" className="text-sm font-semibold text-slate-900">
						Ghi chú thêm
					</Label>
					<textarea
						id="notes"
						rows={3}
						className="flex w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
						placeholder="Ghi chú bổ sung..."
						value={examinationNote.notes}
						onChange={e => onNoteChange({ ...examinationNote, notes: e.target.value })}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
