'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
	X,
	RotateCcw,
	ZoomIn,
	ZoomOut,
	Sun,
	Moon,
	Maximize2,
	Info,
	Square,
	Pin,
	Eye,
	EyeOff,
} from 'lucide-react';

interface DicomToolbarProps {
	onClose: () => void;
	onReset: () => void;
	onZoomIn: () => void;
	onZoomOut: () => void;
	onWindowLevelIncrease: () => void;
	onWindowLevelDecrease: () => void;
	onFitToWindow: () => void;
	onToggleInfo: () => void;
	activeTool: string | null;
	isNoteMode: boolean;
	onSetActiveAnnotationTool: (toolName: string | null) => void;
	onToggleNoteMode: () => void;
	showInfo: boolean;
	isDrawingBbox?: boolean;
	onToggleBboxDrawing?: () => void;
	showAnnotations?: boolean;
	onToggleAnnotations?: () => void;
}

export default function DicomToolbar({
	onClose,
	onReset,
	onZoomIn,
	onZoomOut,
	onWindowLevelIncrease,
	onWindowLevelDecrease,
	onFitToWindow,
	onToggleInfo,
	isNoteMode,
	onToggleNoteMode,
	showInfo,
	isDrawingBbox = false,
	onToggleBboxDrawing,
	showAnnotations = false,
	onToggleAnnotations,
}: DicomToolbarProps) {
	return (
		<div className="absolute top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 shadow-xl">
			<div className="flex items-center justify-between px-4 py-2">
				<div className="flex items-center gap-1">
					<Button
						onClick={onReset}
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors"
						title="Reset (Ctrl/Cmd + R)"
					>
						<RotateCcw className="h-4 w-4" />
					</Button>
					<div className="w-px bg-slate-700 mx-0.5"></div>
					<Button
						onClick={onWindowLevelIncrease}
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors"
						title="Tăng Window/Level"
					>
						<Sun className="h-4 w-4" />
					</Button>
					<Button
						onClick={onWindowLevelDecrease}
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors"
						title="Giảm Window/Level"
					>
						<Moon className="h-4 w-4" />
					</Button>
					<div className="w-px bg-slate-700 mx-0.5"></div>
					<Button
						onClick={onZoomIn}
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors"
						title="Zoom In (+)"
					>
						<ZoomIn className="h-4 w-4" />
					</Button>
					<Button
						onClick={onZoomOut}
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors"
						title="Zoom Out (-)"
					>
						<ZoomOut className="h-4 w-4" />
					</Button>
					<div className="w-px bg-slate-700 mx-0.5"></div>
					<Button
						onClick={onFitToWindow}
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors"
						title="Fit to Window (0)"
					>
						<Maximize2 className="h-4 w-4" />
					</Button>
					<div className="w-px bg-slate-700 mx-0.5"></div>
					{/* Annotation Tools */}
					<Button
						onClick={onToggleAnnotations}
						variant="ghost"
						size="icon"
						className={`h-8 w-8 transition-colors ${showAnnotations ? 'text-green-400 bg-green-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-700/80'}`}
						title={showAnnotations ? 'Ẩn Annotations (A)' : 'Hiện Annotations (A)'}
					>
						{showAnnotations ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
					</Button>
					<Button
						onClick={onToggleBboxDrawing}
						variant="ghost"
						size="icon"
						className={`h-8 w-8 transition-colors ${isDrawingBbox ? 'text-fuchsia-400 bg-fuchsia-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-700/80'}`}
						title="Vẽ Bounding Box (B) - Click and Drag"
					>
						<Square className="h-4 w-4" />
					</Button>
					<Button
						onClick={onToggleNoteMode}
						variant="ghost"
						size="icon"
						className={`h-8 w-8 transition-colors ${isNoteMode ? 'text-yellow-400 bg-yellow-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-700/80'}`}
						title="Thêm Note (N) - Figma Style"
					>
						<Pin className="h-4 w-4" />
					</Button>
					<div className="w-px bg-slate-700 mx-0.5"></div>
					<Button
						onClick={onToggleInfo}
						variant="ghost"
						size="icon"
						className={`h-8 w-8 transition-colors ${showInfo ? 'text-blue-400 bg-blue-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-700/80'}`}
						title="Toggle Info (I)"
					>
						<Info className="h-4 w-4" />
					</Button>
				</div>

				<Button onClick={onClose} variant="destructive" size="sm" className="ml-2 shadow-lg">
					<X className="mr-2 h-4 w-4" /> Đóng (ESC)
				</Button>
			</div>
		</div>
	);
}
