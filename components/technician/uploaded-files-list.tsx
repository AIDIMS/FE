import React from 'react';
import { CheckCircle2, AlertCircle, X, Image as ImageIcon } from 'lucide-react';

export interface UploadedFile {
	id: string;
	name: string;
	size: number;
	progress: number;
	status: 'uploading' | 'completed' | 'error';
	preview?: string;
}

interface UploadedFilesListProps {
	files: UploadedFile[];
	onRemoveFile: (fileId: string) => void;
}

export function UploadedFilesList({ files, onRemoveFile }: UploadedFilesListProps) {
	const formatFileSize = (bytes: number) => {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	};

	if (files.length === 0) {
		return null;
	}

	return (
		<div className="mt-6 space-y-3">
			<h3 className="text-sm font-semibold text-slate-700 mb-3">Danh sách file đã upload</h3>
			{files.map(file => (
				<div key={file.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
					<div className="flex items-start justify-between mb-2">
						<div className="flex items-start gap-3 flex-1 min-w-0">
							<div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
								<ImageIcon className="h-5 w-5 text-blue-600" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
								<p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							{file.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
							{file.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
							<button
								onClick={() => onRemoveFile(file.id)}
								className="text-slate-400 hover:text-red-500 transition-colors"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
					</div>
					{file.status === 'uploading' && (
						<div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
							<div
								className="h-full bg-blue-600 transition-all duration-300"
								style={{ width: `${file.progress}%` }}
							></div>
						</div>
					)}
				</div>
			))}
		</div>
	);
}
