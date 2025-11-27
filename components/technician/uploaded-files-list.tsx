import React from 'react';
import { FileText, X, CheckCircle2, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface UploadedFile {
	id: string;
	name: string;
	size: number;
	progress: number;
	status: 'uploading' | 'completed' | 'error';
	fileObject?: File; // Lưu trữ File object gốc để preview
}

interface UploadedFilesListProps {
	files: UploadedFile[];
	onRemoveFile: (id: string) => void;
	onPreviewFile: (file: File) => void; // Prop mới
}

export function UploadedFilesList({ files, onRemoveFile, onPreviewFile }: UploadedFilesListProps) {
	if (files.length === 0) return null;

	return (
		<div className="mt-6 space-y-3">
			{files.map(file => (
				<div
					key={file.id}
					className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg group hover:border-blue-300 transition-colors"
				>
					<div className="flex items-center gap-3 overflow-hidden">
						<div className="h-10 w-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center flex-shrink-0">
							<FileText className="h-5 w-5 text-blue-600" />
						</div>
						<div className="min-w-0">
							<p className="text-sm font-medium text-slate-900 truncate max-w-[200px] sm:max-w-xs">
								{file.name}
							</p>
							<div className="flex items-center gap-2 text-xs text-slate-500">
								<span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
								{file.status === 'uploading' && (
									<span className="text-blue-600 flex items-center">
										<Loader2 className="h-3 w-3 animate-spin mr-1" />
										{file.progress}%
									</span>
								)}
								{file.status === 'completed' && (
									<span className="text-emerald-600 flex items-center">
										<CheckCircle2 className="h-3 w-3 mr-1" />
										Sẵn sàng
									</span>
								)}
								{file.status === 'error' && <span className="text-red-500">Lỗi upload</span>}
							</div>
						</div>
					</div>

					<div className="flex items-center gap-1">
						{/* Nút Preview: Chỉ hiện khi upload xong và có fileObject */}
						{file.status === 'completed' && file.fileObject && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onPreviewFile(file.fileObject!)}
								className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
								title="Xem trước ảnh"
							>
								<Eye className="h-4 w-4" />
							</Button>
						)}

						<Button
							variant="ghost"
							size="icon"
							onClick={() => onRemoveFile(file.id)}
							className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
							title="Xóa file"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>
			))}
		</div>
	);
}
