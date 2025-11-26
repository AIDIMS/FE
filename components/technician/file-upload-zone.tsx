import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface FileUploadZoneProps {
	isDragging: boolean;
	onDragEnter: (e: React.DragEvent) => void;
	onDragLeave: (e: React.DragEvent) => void;
	onDragOver: (e: React.DragEvent) => void;
	onDrop: (e: React.DragEvent) => void;
	onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUploadZone({
	isDragging,
	onDragEnter,
	onDragLeave,
	onDragOver,
	onDrop,
	onFileInput,
}: FileUploadZoneProps) {
	return (
		<div
			onDragEnter={onDragEnter}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			onDrop={onDrop}
			className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
				isDragging
					? 'border-blue-500 bg-blue-50'
					: 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'
			}`}
		>
			<input
				type="file"
				id="file-upload"
				multiple
				accept=".dcm,.dicom,image/*"
				onChange={onFileInput}
				className="hidden"
			/>
			<label htmlFor="file-upload" className="cursor-pointer">
				<div className="flex flex-col items-center gap-4">
					<div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
						<Upload className="h-8 w-8 text-blue-600" />
					</div>
					<div>
						<p className="text-lg font-semibold text-slate-900 mb-1">
							Kéo thả file hoặc click để chọn
						</p>
						<p className="text-sm text-slate-500">Hỗ trợ: DICOM (.dcm, .dicom), JPEG, PNG</p>
					</div>
					<Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
						<Upload className="h-4 w-4 mr-2" />
						Chọn file
					</Button>
				</div>
			</label>
		</div>
	);
}
