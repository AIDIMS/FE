'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Pin, GripVertical } from 'lucide-react';

export interface Note {
	id: string;
	x: number;
	y: number;
	text: string;
	color: string;
	createdAt: Date;
}

interface DicomNotesProps {
	notes: Note[];
	editingNoteId: string | null;
	draggingNoteId: string | null;
	onNoteMouseDown: (e: React.MouseEvent, noteId: string) => void;
	onUpdateNote: (id: string, text: string) => void;
	onDeleteNote: (id: string) => void;
	onSetEditingNoteId: (id: string | null) => void;
}

export default function DicomNotes({
	notes,
	editingNoteId,
	draggingNoteId,
	onNoteMouseDown,
	onUpdateNote,
	onDeleteNote,
	onSetEditingNoteId,
}: DicomNotesProps) {
	if (notes.length === 0) return null;

	return (
		<div className="absolute inset-0 pointer-events-none z-30">
			{notes.map(note => (
				<div
					key={note.id}
					className={`absolute pointer-events-auto ${note.color} rounded-lg shadow-2xl border-2 border-white/20 backdrop-blur-sm transition-all ${
						draggingNoteId === note.id ? 'scale-105 z-50 shadow-2xl' : 'hover:scale-102'
					}`}
					style={{
						left: `${note.x}px`,
						top: `${note.y}px`,
						width: '200px',
						minHeight: '120px',
					}}
					onMouseDown={e => onNoteMouseDown(e, note.id)}
				>
					{/* Note Header */}
					<div className="flex items-center justify-between p-2 border-b border-black/20 bg-black/10">
						<div className="flex items-center gap-1.5">
							<GripVertical className="h-3 w-3 text-black/60 cursor-move" />
							<Pin className="h-3 w-3 text-black/60" />
							<span className="text-xs text-black/70 font-medium">
								{note.createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
							</span>
						</div>
						<Button
							onClick={e => {
								e.stopPropagation();
								onDeleteNote(note.id);
							}}
							variant="ghost"
							size="icon"
							className="h-5 w-5 text-black/60 hover:text-black hover:bg-black/20"
						>
							<X className="h-3 w-3" />
						</Button>
					</div>

					{/* Note Content */}
					<div className="p-2.5">
						{editingNoteId === note.id ? (
							<textarea
								value={note.text}
								onChange={e => onUpdateNote(note.id, e.target.value)}
								onBlur={() => onSetEditingNoteId(null)}
								onKeyDown={e => {
									if (e.key === 'Escape') {
										onSetEditingNoteId(null);
									}
									e.stopPropagation();
								}}
								className="w-full bg-transparent text-black placeholder-black/50 text-sm resize-none outline-none min-h-[60px]"
								placeholder="Nhập note của bạn..."
								autoFocus
								onClick={e => e.stopPropagation()}
							/>
						) : (
							<div
								onClick={e => {
									e.stopPropagation();
									onSetEditingNoteId(note.id);
								}}
								className="text-black text-sm min-h-[60px] cursor-text whitespace-pre-wrap break-words"
							>
								{note.text || <span className="text-black/50 italic">Click để chỉnh sửa...</span>}
							</div>
						)}
					</div>
				</div>
			))}
		</div>
	);
}
