'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Edit2, Pin, Square, Trash2 } from 'lucide-react';
import { Note } from './dicom-notes';

interface Annotation {
	annotationUID: string;
	metadata?: {
		toolName?: string;
		label?: string;
	};
	toolName?: string;
	data?: {
		text?: string;
		label?: string;
	};
}

interface BoundingBox {
	id: string;
	label: string;
	confidence: number;
	type: 'ai' | 'manual' | 'saved';
	color: string;
}

interface DicomAnnotationsListProps {
	show: boolean;
	annotations: Annotation[];
	notes: Note[];
	boundingBoxes?: BoundingBox[];
	showAnnotations: boolean;
	onToggleShowAnnotations: () => void;
	onDeleteAnnotation: (annotationUID: string) => void;
	onDeleteNote: (id: string) => void;
	onDeleteBoundingBox?: (id: string) => void;
}

export default function DicomAnnotationsList({
	show,
	annotations,
	notes,
	boundingBoxes = [],
	showAnnotations,
	onToggleShowAnnotations,
	onDeleteAnnotation,
	onDeleteNote,
	onDeleteBoundingBox,
}: DicomAnnotationsListProps) {
	const totalCount = annotations.length + notes.length + boundingBoxes.length;
	if (!show || totalCount === 0) return null;

	return (
		<div className="absolute bottom-20 left-4 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-slate-700/50 shadow-2xl z-20 max-w-sm pointer-events-auto">
			<div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700">
				<div className="flex items-center gap-2">
					<Edit2 className="h-4 w-4 text-green-400" />
					<h3 className="text-sm font-semibold text-white">Annotations ({totalCount})</h3>
				</div>
				<Button
					onClick={onToggleShowAnnotations}
					variant="ghost"
					size="icon"
					className="h-6 w-6 text-slate-400 hover:text-white"
				>
					<X className="h-3 w-3" />
				</Button>
			</div>
			{showAnnotations && (
				<div className="space-y-2 max-h-60 overflow-y-auto">
					{/* Bounding Boxes (AI Findings & Manual) */}
					{boundingBoxes.map(bbox => (
						<div
							key={bbox.id}
							className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-slate-700/50 hover:bg-slate-700/50 transition-colors"
						>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-1.5 mb-1">
									<Square className="h-3 w-3" style={{ color: bbox.color }} />
									<span className="text-xs text-slate-400">
										{bbox.type === 'ai'
											? 'AI Finding'
											: bbox.type === 'saved'
												? 'Saved Annotation'
												: 'Manual Finding'}
									</span>
									{bbox.type === 'ai' && (
										<span className="text-xs text-slate-500">
											{Math.round(bbox.confidence * 100)}%
										</span>
									)}
								</div>
								<div className="text-xs text-slate-300 truncate">{bbox.label}</div>
							</div>
							{onDeleteBoundingBox && (
								<Button
									onClick={() => onDeleteBoundingBox(bbox.id)}
									variant="ghost"
									size="icon"
									className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/20 ml-2 flex-shrink-0"
									title="Xóa bounding box"
								>
									<Trash2 className="h-3 w-3" />
								</Button>
							)}
						</div>
					))}

					{/* Notes */}
					{notes.map(note => (
						<div
							key={note.id}
							className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-slate-700/50 hover:bg-slate-700/50 transition-colors"
						>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-1.5 mb-1">
									<Pin className="h-3 w-3 text-yellow-400" />
									<span className="text-xs text-slate-400">Note</span>
								</div>
								<div className="text-xs text-slate-300 truncate">
									{note.text || <span className="text-slate-500 italic">Empty note</span>}
								</div>
							</div>
							<Button
								onClick={() => onDeleteNote(note.id)}
								variant="ghost"
								size="icon"
								className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/20 ml-2 flex-shrink-0"
								title="Xóa note"
							>
								<Trash2 className="h-3 w-3" />
							</Button>
						</div>
					))}
					{/* Bounding Box Annotations */}
					{annotations.map((ann, idx: number) => {
						const toolName = ann.metadata?.toolName || ann.toolName || 'Unknown';
						const text = ann.data?.text || ann.data?.label || `Annotation ${idx + 1}`;
						return (
							<div
								key={ann.annotationUID || idx}
								className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-slate-700/50 hover:bg-slate-700/50 transition-colors"
							>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-1.5 mb-1">
										<Square className="h-3 w-3 text-green-400" />
										<span className="text-xs text-slate-400">{toolName}</span>
									</div>
									<div className="text-xs text-slate-300 truncate">{text}</div>
								</div>
								<Button
									onClick={() => onDeleteAnnotation(ann.annotationUID)}
									variant="ghost"
									size="icon"
									className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/20 ml-2 flex-shrink-0"
									title="Xóa annotation"
								>
									<Trash2 className="h-3 w-3" />
								</Button>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
