'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import initCornerstone from '@/lib/initCornerstone';

import {
	RenderingEngine,
	Enums,
	type Types,
	getRenderingEngine,
	metaData,
} from '@cornerstonejs/core';

import {
	ToolGroupManager,
	WindowLevelTool,
	ZoomTool,
	PanTool,
	StackScrollTool,
	RectangleROITool,
	ArrowAnnotateTool,
	Enums as ToolsEnums,
	addTool,
	annotation,
} from '@cornerstonejs/tools';

import * as cornerstoneDicomImageLoader from '@cornerstonejs/dicom-image-loader';

import { Button } from '@/components/ui/button';
import { X, Loader2, Pin } from 'lucide-react';
import DicomToolbar from './dicom-toolbar';
import DicomInfoPanel from './dicom-info-panel';
import DicomNotes, { Note } from './dicom-notes';
import DicomAnnotationsList from './dicom-annotations-list';

export interface DicomViewerProps {
	file: File;
	onClose: () => void;
}

export interface DicomMetadata {
	patientName?: string;
	patientId?: string;
	studyDate?: string;
	studyTime?: string;
	modality?: string;
	studyDescription?: string;
	seriesDescription?: string;
	rows?: number;
	columns?: number;
	pixelSpacing?: number[];
	windowWidth?: number;
	windowCenter?: number;
}

// Window/Level presets for common modalities
const WINDOW_LEVEL_PRESETS = {
	CT: [
		{ name: 'Soft Tissue', window: 400, level: 50 },
		{ name: 'Bone', window: 2000, level: 300 },
		{ name: 'Lung', window: 1500, level: -600 },
		{ name: 'Brain', window: 80, level: 40 },
	],
	MR: [
		{ name: 'T1', window: 400, level: 200 },
		{ name: 'T2', window: 200, level: 100 },
		{ name: 'FLAIR', window: 300, level: 150 },
	],
	default: [{ name: 'Default', window: 400, level: 50 }],
};

export default function DicomViewer({ file, onClose }: DicomViewerProps) {
	const elementRef = useRef<HTMLDivElement>(null);
	const renderingEngineId = 'technicianPreviewEngine';
	const viewportId = 'PREVIEW_STACK';
	const toolGroupId = 'previewToolGroup';

	const [isReady, setIsReady] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [windowLevel, setWindowLevel] = useState({ window: 400, level: 50 });
	const [zoomLevel, setZoomLevel] = useState(1);
	const [metadata, setMetadata] = useState<DicomMetadata | null>(null);
	const [showInfo, setShowInfo] = useState(true);
	const [activeTool, setActiveTool] = useState<string | null>(null);

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
	const [annotations, setAnnotations] = useState<Annotation[]>([]);
	const [showAnnotations, setShowAnnotations] = useState(true);

	const [notes, setNotes] = useState<Note[]>([]);
	const [isNoteMode, setIsNoteMode] = useState(false);
	const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
	const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const objectURL: string | null = null;

		const run = async () => {
			if (!elementRef.current) return;

			try {
				// Khởi tạo CornerstoneJS
				await initCornerstone();

				// Đợi một chút để đảm bảo web worker đã sẵn sàng
				await new Promise(resolve => setTimeout(resolve, 200));

				// Lấy DICOM Image Loader
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const imageLoaderAny = cornerstoneDicomImageLoader as any;
				const loader = imageLoaderAny.external ? imageLoaderAny : imageLoaderAny.default;

				// Sử dụng fileManager.add() như trong tài liệu chính thức
				// Điều này sẽ tự động xử lý file và tạo imageId đúng cách
				if (!loader.wadouri || !loader.wadouri.fileManager) {
					throw new Error('DICOM Image Loader không được khởi tạo đúng cách');
				}

				const imageId = loader.wadouri.fileManager.add(file);

				// Xóa rendering engine cũ nếu có
				const oldEngine = getRenderingEngine(renderingEngineId);
				if (oldEngine) {
					oldEngine.destroy();
				}

				// Xóa tool group cũ nếu có
				const oldToolGroup = ToolGroupManager.getToolGroup(toolGroupId);
				if (oldToolGroup) {
					ToolGroupManager.destroyToolGroup(toolGroupId);
				}

				// Tạo rendering engine mới
				const renderingEngine = new RenderingEngine(renderingEngineId);

				// Cấu hình viewport
				const viewportInput = {
					viewportId,
					type: Enums.ViewportType.STACK,
					element: elementRef.current as HTMLDivElement,
				};

				renderingEngine.enableElement(viewportInput);

				// Lấy viewport và set stack images
				const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;

				// Set stack với imageId
				await viewport.setStack([imageId]);

				// Đăng ký các tools trước khi sử dụng
				addTool(WindowLevelTool);
				addTool(ZoomTool);
				addTool(PanTool);
				addTool(StackScrollTool);
				addTool(RectangleROITool);
				addTool(ArrowAnnotateTool);

				// Tạo Tool Group và thêm các tools
				// Kiểm tra xem tool group đã tồn tại chưa
				let toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
				if (!toolGroup) {
					toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
				}

				if (toolGroup) {
					// Thêm các tools bằng tên tool string (sau khi đã đăng ký)
					toolGroup.addTool(WindowLevelTool.toolName);
					toolGroup.addTool(ZoomTool.toolName);
					toolGroup.addTool(PanTool.toolName);
					toolGroup.addTool(StackScrollTool.toolName);
					toolGroup.addTool(RectangleROITool.toolName);
					toolGroup.addTool(ArrowAnnotateTool.toolName);

					// Kích hoạt các tools với mouse bindings (mặc định)
					toolGroup.setToolActive(WindowLevelTool.toolName, {
						bindings: [
							{
								mouseButton: ToolsEnums.MouseBindings.Primary,
							},
						],
					});

					toolGroup.setToolActive(ZoomTool.toolName, {
						bindings: [
							{
								mouseButton: ToolsEnums.MouseBindings.Secondary,
							},
						],
					});

					toolGroup.setToolActive(PanTool.toolName, {
						bindings: [
							{
								mouseButton: ToolsEnums.MouseBindings.Auxiliary,
							},
						],
					});

					toolGroup.setToolActive(StackScrollTool.toolName, {
						bindings: [
							{
								mouseButton: ToolsEnums.MouseBindings.Wheel,
							},
						],
					});

					// Gán tool group cho viewport
					toolGroup.addViewport(viewportId, renderingEngineId);
				}

				// Annotations will be handled by polling in useEffect

				// Render và reset camera
				viewport.render();
				viewport.resetCamera();

				// Lấy metadata từ image
				try {
					const imageId = viewport.getCurrentImageId();
					if (imageId) {
						// Lấy metadata từ Cornerstone
						const patientModule = metaData.get('patientModule', imageId);
						const studyModule = metaData.get('studyModule', imageId);
						const generalSeriesModule = metaData.get('generalSeriesModule', imageId);
						const imagePlaneModule = metaData.get('imagePlaneModule', imageId);
						const imagePixelModule = metaData.get('imagePixelModule', imageId);

						const dicomMetadata: DicomMetadata = {
							patientName: patientModule?.patientName,
							patientId: patientModule?.patientId,
							studyDate: studyModule?.studyDate,
							studyTime: studyModule?.studyTime,
							modality: studyModule?.modality,
							studyDescription: studyModule?.studyDescription,
							seriesDescription: generalSeriesModule?.seriesDescription,
							rows: imagePlaneModule?.rows,
							columns: imagePlaneModule?.columns,
							pixelSpacing: imagePlaneModule?.pixelSpacing,
							windowWidth: imagePixelModule?.windowWidth,
							windowCenter: imagePixelModule?.windowCenter,
						};

						setMetadata(dicomMetadata);

						// Set initial window/level từ metadata nếu có
						if (dicomMetadata.windowWidth && dicomMetadata.windowCenter) {
							const voiRange = windowLevelToVoiRange(
								dicomMetadata.windowWidth,
								dicomMetadata.windowCenter
							);
							viewport.setProperties({ voiRange });
							setWindowLevel({
								window: dicomMetadata.windowWidth,
								level: dicomMetadata.windowCenter,
							});
						}
					}
				} catch {
					// Metadata không bắt buộc
				}

				// Update zoom level
				const camera = viewport.getCamera();
				setZoomLevel(camera.parallelScale || 1);

				setIsReady(true);
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Lỗi không xác định';
				setError(`Không thể hiển thị ảnh DICOM: ${message}`);
			}
		};

		run();

		// Cleanup khi component unmount hoặc file thay đổi
		return () => {
			const engine = getRenderingEngine(renderingEngineId);
			if (engine) {
				engine.destroy();
			}

			const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
			if (toolGroup) {
				ToolGroupManager.destroyToolGroup(toolGroupId);
			}

			// Revoke object URL để giải phóng memory
			if (objectURL) {
				URL.revokeObjectURL(objectURL);
			}
		};
	}, [file]);

	// Function to update annotations list and label positions
	const updateAnnotations = useCallback(() => {
		if (!elementRef.current) return;

		try {
			// Get all annotations for the element
			const allAnnotations: Annotation[] = [];
			const element = elementRef.current;

			// Get Rectangle ROI annotations
			let rectAnnList: Annotation[] = [];
			try {
				const rectAnnotations = annotation.state.getAnnotations(RectangleROITool.toolName, element);
				if (rectAnnotations && Array.isArray(rectAnnotations)) {
					rectAnnList = rectAnnotations as Annotation[];
				} else if (rectAnnotations && typeof rectAnnotations === 'object') {
					// If it's an object, get all values
					Object.values(rectAnnotations).forEach((ann: unknown) => {
						if (Array.isArray(ann)) {
							rectAnnList.push(...(ann as Annotation[]));
						} else if (ann) {
							rectAnnList.push(ann as Annotation);
						}
					});
				}
				allAnnotations.push(...rectAnnList);
			} catch {
				// Ignore
			}

			// Get Arrow/Text annotations
			try {
				const arrowAnnotations = annotation.state.getAnnotations(
					ArrowAnnotateTool.toolName,
					element
				);
				if (arrowAnnotations && Array.isArray(arrowAnnotations)) {
					allAnnotations.push(...(arrowAnnotations as Annotation[]));
				} else if (arrowAnnotations && typeof arrowAnnotations === 'object') {
					// If it's an object, get all values
					Object.values(arrowAnnotations).forEach((ann: unknown) => {
						if (Array.isArray(ann)) {
							allAnnotations.push(...(ann as Annotation[]));
						} else if (ann) {
							allAnnotations.push(ann as Annotation);
						}
					});
				}
			} catch {
				// Ignore
			}

			setAnnotations(allAnnotations);
		} catch {
			// Ignore errors
		}
	}, []);

	// Function to set active tool
	const setActiveAnnotationTool = useCallback(
		(toolName: string | null) => {
			const engine = getRenderingEngine(renderingEngineId);
			const viewport = engine?.getViewport(viewportId);
			if (!viewport) return;

			const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
			if (!toolGroup) return;

			// Deactivate all annotation tools first
			if (activeTool) {
				toolGroup.setToolPassive(activeTool);
			}

			if (toolName) {
				// Deactivate default tools
				toolGroup.setToolPassive(WindowLevelTool.toolName);
				toolGroup.setToolPassive(ZoomTool.toolName);
				toolGroup.setToolPassive(PanTool.toolName);

				// Activate the selected tool
				toolGroup.setToolActive(toolName, {
					bindings: [
						{
							mouseButton: ToolsEnums.MouseBindings.Primary,
						},
					],
				});
				setActiveTool(toolName);
			} else {
				// Restore default tools
				toolGroup.setToolActive(WindowLevelTool.toolName, {
					bindings: [
						{
							mouseButton: ToolsEnums.MouseBindings.Primary,
						},
					],
				});
				toolGroup.setToolActive(ZoomTool.toolName, {
					bindings: [
						{
							mouseButton: ToolsEnums.MouseBindings.Secondary,
						},
					],
				});
				toolGroup.setToolActive(PanTool.toolName, {
					bindings: [
						{
							mouseButton: ToolsEnums.MouseBindings.Auxiliary,
						},
					],
				});
				setActiveTool(null);
			}
		},
		[activeTool]
	);

	// Function to delete annotation
	const deleteAnnotation = useCallback(
		(annotationUID: string) => {
			try {
				annotation.state.removeAnnotation(annotationUID);
				updateAnnotations();

				// Re-render viewport
				const engine = getRenderingEngine(renderingEngineId);
				const viewport = engine?.getViewport(viewportId);
				if (viewport) {
					viewport.render();
				}
			} catch (e) {
				console.error('Error deleting annotation:', e);
			}
		},
		[updateAnnotations]
	);

	// Note handlers
	const createNote = useCallback((x: number, y: number) => {
		const noteColors = [
			'bg-yellow-400/90',
			'bg-blue-400/90',
			'bg-green-400/90',
			'bg-pink-400/90',
			'bg-purple-400/90',
		];

		const newNote: Note = {
			id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			x,
			y,
			text: '',
			color: noteColors[Math.floor(Math.random() * noteColors.length)],
			createdAt: new Date(),
		};
		setNotes(prev => [...prev, newNote]);
		setEditingNoteId(newNote.id);
		setIsNoteMode(false);
	}, []);

	const updateNote = useCallback((id: string, text: string) => {
		setNotes(prev => prev.map(note => (note.id === id ? { ...note, text } : note)));
	}, []);

	const deleteNote = useCallback(
		(id: string) => {
			setNotes(prev => prev.filter(note => note.id !== id));
			if (editingNoteId === id) {
				setEditingNoteId(null);
			}
		},
		[editingNoteId]
	);

	// Handle click to create note
	useEffect(() => {
		if (!isReady || !isNoteMode) return;

		const handleClick = (e: MouseEvent) => {
			if (!elementRef.current) return;

			// Don't create note if clicking on UI elements
			const target = e.target as HTMLElement;
			if (target.closest('button') || target.closest('[role="button"]')) {
				return;
			}

			const rect = elementRef.current.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			createNote(x, y);
		};

		const element = elementRef.current;
		if (element) {
			element.addEventListener('click', handleClick);
			return () => element.removeEventListener('click', handleClick);
		}
	}, [isReady, isNoteMode, createNote]);

	// Handle note dragging
	const handleNoteMouseDown = useCallback(
		(e: React.MouseEvent, noteId: string) => {
			e.stopPropagation();
			const note = notes.find(n => n.id === noteId);
			if (!note) return;

			const rect = elementRef.current?.getBoundingClientRect();
			if (!rect) return;

			setDraggingNoteId(noteId);
			setDragOffset({
				x: e.clientX - rect.left - note.x,
				y: e.clientY - rect.top - note.y,
			});
		},
		[notes]
	);

	useEffect(() => {
		if (!draggingNoteId) return;

		const handleMouseMove = (e: MouseEvent) => {
			if (!elementRef.current) return;
			const rect = elementRef.current.getBoundingClientRect();

			setNotes(prev =>
				prev.map(note =>
					note.id === draggingNoteId
						? {
								...note,
								x: Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - 200)),
								y: Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - 100)),
							}
						: note
				)
			);
		};

		const handleMouseUp = () => {
			setDraggingNoteId(null);
		};

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};
	}, [draggingNoteId, dragOffset]);

	const handleReset = () => {
		const engine = getRenderingEngine(renderingEngineId);
		const viewport = engine?.getViewport(viewportId) as Types.IStackViewport;
		if (viewport) {
			viewport.resetCamera();
			viewport.render();
		}
	};

	const handleFitToWindow = () => {
		const engine = getRenderingEngine(renderingEngineId);
		const viewport = engine?.getViewport(viewportId) as Types.IStackViewport;
		if (viewport) {
			viewport.resetCamera({ resetZoom: true, resetPan: true, resetToCenter: true });
			viewport.render();
		}
	};

	// Helper function to convert voiRange to windowWidth/windowCenter
	const voiRangeToWindowLevel = (voiRange: Types.VOIRange | undefined) => {
		if (!voiRange) return { window: 400, level: 50 };
		const windowWidth = voiRange.upper - voiRange.lower;
		const windowCenter = (voiRange.upper + voiRange.lower) / 2;
		return { window: windowWidth, level: windowCenter };
	};

	// Helper function to convert windowWidth/windowCenter to voiRange
	const windowLevelToVoiRange = (windowWidth: number, windowCenter: number): Types.VOIRange => {
		return {
			lower: windowCenter - windowWidth / 2,
			upper: windowCenter + windowWidth / 2,
		};
	};

	const updateZoomLevel = useCallback(() => {
		const engine = getRenderingEngine(renderingEngineId);
		const viewport = engine?.getViewport(viewportId) as Types.IStackViewport;
		if (viewport) {
			const camera = viewport.getCamera();
			const zoom = camera.parallelScale || 1;
			setZoomLevel(zoom);
		}
	}, []);

	const handleZoomIn = useCallback(() => {
		const engine = getRenderingEngine(renderingEngineId);
		const viewport = engine?.getViewport(viewportId) as Types.IStackViewport;
		if (viewport) {
			const camera = viewport.getCamera();
			const currentZoom = camera.parallelScale || 1;
			const newZoom = currentZoom * 0.8;
			viewport.setCamera({ parallelScale: newZoom });
			viewport.render();
			setZoomLevel(newZoom);
		}
	}, [renderingEngineId, viewportId]);

	const handleZoomOut = useCallback(() => {
		const engine = getRenderingEngine(renderingEngineId);
		const viewport = engine?.getViewport(viewportId) as Types.IStackViewport;
		if (viewport) {
			const camera = viewport.getCamera();
			const currentZoom = camera.parallelScale || 1;
			const newZoom = currentZoom * 1.25;
			viewport.setCamera({ parallelScale: newZoom });
			viewport.render();
			setZoomLevel(newZoom);
		}
	}, [renderingEngineId, viewportId]);

	const handleWindowLevelIncrease = () => {
		const engine = getRenderingEngine(renderingEngineId);
		const viewport = engine?.getViewport(viewportId) as Types.IStackViewport;
		if (viewport) {
			const properties = viewport.getProperties();
			const currentVoi = properties.voiRange;
			const { window, level } = voiRangeToWindowLevel(currentVoi);
			const newWindow = window + 50;
			const newLevel = level;
			const newVoiRange = windowLevelToVoiRange(newWindow, newLevel);
			viewport.setProperties({ voiRange: newVoiRange });
			setWindowLevel({ window: newWindow, level: newLevel });
			viewport.render();
		}
	};

	const handleWindowLevelDecrease = () => {
		const engine = getRenderingEngine(renderingEngineId);
		const viewport = engine?.getViewport(viewportId) as Types.IStackViewport;
		if (viewport) {
			const properties = viewport.getProperties();
			const currentVoi = properties.voiRange;
			const { window, level } = voiRangeToWindowLevel(currentVoi);
			const newWindow = Math.max(1, window - 50);
			const newLevel = level;
			const newVoiRange = windowLevelToVoiRange(newWindow, newLevel);
			viewport.setProperties({ voiRange: newVoiRange });
			setWindowLevel({ window: newWindow, level: newLevel });
			viewport.render();
		}
	};

	const handlePresetWindowLevel = (window: number, level: number) => {
		const engine = getRenderingEngine(renderingEngineId);
		const viewport = engine?.getViewport(viewportId) as Types.IStackViewport;
		if (viewport) {
			const voiRange = windowLevelToVoiRange(window, level);
			viewport.setProperties({ voiRange });
			setWindowLevel({ window, level });
			viewport.render();
		}
	};

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				return;
			}

			switch (e.key) {
				case 'Escape':
					onClose();
					break;
				case 'r':
				case 'R':
					if (e.ctrlKey || e.metaKey) {
						e.preventDefault();
						const engine = getRenderingEngine(renderingEngineId);
						const viewport = engine?.getViewport(viewportId) as Types.IStackViewport;
						if (viewport) {
							viewport.resetCamera();
							viewport.render();
						}
					}
					break;
				case '0':
					{
						const engine = getRenderingEngine(renderingEngineId);
						const viewport = engine?.getViewport(viewportId) as Types.IStackViewport;
						if (viewport) {
							viewport.resetCamera({ resetZoom: true, resetPan: true, resetToCenter: true });
							viewport.render();
						}
					}
					break;
				case '+':
				case '=':
					handleZoomIn();
					break;
				case '-':
				case '_':
					handleZoomOut();
					break;
				case 'i':
				case 'I':
					if (!e.ctrlKey && !e.metaKey) {
						e.preventDefault();
						setShowInfo(prev => !prev);
					}
					break;
				case 'b':
				case 'B':
					if (!e.ctrlKey && !e.metaKey) {
						e.preventDefault();
						setActiveAnnotationTool(
							activeTool === RectangleROITool.toolName ? null : RectangleROITool.toolName
						);
					}
					break;
				case 'n':
				case 'N':
					if (!e.ctrlKey && !e.metaKey) {
						e.preventDefault();
						setActiveAnnotationTool(
							activeTool === ArrowAnnotateTool.toolName ? null : ArrowAnnotateTool.toolName
						);
					}
					break;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [onClose, handleZoomIn, handleZoomOut, activeTool, setActiveAnnotationTool, isNoteMode]);

	// Update zoom level on camera changes
	useEffect(() => {
		if (!isReady) return;

		const interval = setInterval(() => {
			updateZoomLevel();
			// Also update annotations to refresh label positions when viewport changes
			updateAnnotations();
		}, 100);

		return () => clearInterval(interval);
	}, [isReady, updateZoomLevel, updateAnnotations]);

	const presets = metadata?.modality
		? WINDOW_LEVEL_PRESETS[metadata.modality as keyof typeof WINDOW_LEVEL_PRESETS] ||
			WINDOW_LEVEL_PRESETS.default
		: WINDOW_LEVEL_PRESETS.default;

	return (
		<div className="fixed inset-0 z-[9999] bg-black flex flex-col animate-in fade-in duration-200">
			{/* Header */}
			<div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 shadow-lg">
				<div className="flex items-center gap-6">
					<div className="flex flex-col">
						<span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
							DICOM Viewer
						</span>
						<span className="text-white font-semibold text-base truncate max-w-md">
							{file.name}
						</span>
					</div>

					{metadata && (
						<div className="hidden md:flex items-center gap-4 text-xs text-slate-300">
							{metadata.modality && (
								<div className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded border border-blue-500/30">
									{metadata.modality}
								</div>
							)}
							{metadata.patientName && (
								<div className="text-slate-400">
									<span className="text-slate-500">Patient:</span> {metadata.patientName}
								</div>
							)}
							{metadata.studyDate && (
								<div className="text-slate-400">
									<span className="text-slate-500">Date:</span> {metadata.studyDate}
								</div>
							)}
						</div>
					)}
				</div>

				<DicomToolbar
					onClose={onClose}
					onReset={handleReset}
					onZoomIn={handleZoomIn}
					onZoomOut={handleZoomOut}
					onWindowLevelIncrease={handleWindowLevelIncrease}
					onWindowLevelDecrease={handleWindowLevelDecrease}
					onFitToWindow={handleFitToWindow}
					onToggleInfo={() => setShowInfo(!showInfo)}
					activeTool={activeTool}
					isNoteMode={isNoteMode}
					onSetActiveAnnotationTool={toolName => {
						setActiveAnnotationTool(toolName);
						if (toolName === null && activeTool === ArrowAnnotateTool.toolName) {
							setIsNoteMode(false);
						}
					}}
					onToggleNoteMode={() => {
						setIsNoteMode(!isNoteMode);
						if (activeTool === ArrowAnnotateTool.toolName) {
							setActiveAnnotationTool(null);
						}
					}}
					showInfo={showInfo}
				/>
			</div>

			{/* Main View */}
			<div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-slate-950 to-black">
				{!isReady && !error && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
						<div className="text-blue-400 flex flex-col items-center gap-4">
							<div className="relative">
								<Loader2 className="h-12 w-12 animate-spin text-blue-500" />
								<div className="absolute inset-0 h-12 w-12 border-4 border-blue-500/20 rounded-full"></div>
							</div>
							<div className="text-center">
								<p className="text-sm font-medium">Đang giải mã DICOM...</p>
								<p className="text-xs text-slate-500 mt-1">Vui lòng đợi trong giây lát</p>
							</div>
						</div>
					</div>
				)}

				{error && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10">
						<div className="text-red-400 p-6 border-2 border-red-800 bg-red-900/30 rounded-lg backdrop-blur-sm max-w-md">
							<div className="flex items-center gap-3 mb-2">
								<X className="h-5 w-5" />
								<h3 className="font-semibold text-lg">Lỗi hiển thị</h3>
							</div>
							<p className="text-sm">{error}</p>
						</div>
					</div>
				)}

				<div
					ref={elementRef}
					className={`w-full h-full outline-none ${isNoteMode ? 'cursor-crosshair' : 'cursor-default'}`}
					onContextMenu={e => e.preventDefault()}
				/>

				{/* Figma-style Notes Overlay */}
				{isReady && (
					<DicomNotes
						notes={notes}
						editingNoteId={editingNoteId}
						draggingNoteId={draggingNoteId}
						onNoteMouseDown={handleNoteMouseDown}
						onUpdateNote={updateNote}
						onDeleteNote={deleteNote}
						onSetEditingNoteId={setEditingNoteId}
					/>
				)}

				{/* Note Mode Indicator */}
				{isReady && isNoteMode && (
					<div className="absolute top-20 left-1/2 -translate-x-1/2 bg-yellow-500/90 backdrop-blur-md rounded-lg px-4 py-2 border-2 border-yellow-400 shadow-2xl z-40 pointer-events-none">
						<div className="flex items-center gap-2 text-black font-semibold text-sm">
							<Pin className="h-4 w-4" />
							<span>Click vào image để thêm note</span>
						</div>
					</div>
				)}

				{/* Info Overlay */}
				{isReady && (
					<DicomInfoPanel
						show={showInfo}
						metadata={metadata}
						windowLevel={windowLevel}
						zoomLevel={zoomLevel}
					/>
				)}

				{/* Annotations List Panel */}
				{isReady && (
					<DicomAnnotationsList
						show={showInfo}
						annotations={annotations}
						notes={notes}
						showAnnotations={showAnnotations}
						onToggleShowAnnotations={() => setShowAnnotations(!showAnnotations)}
						onDeleteAnnotation={deleteAnnotation}
						onDeleteNote={deleteNote}
					/>
				)}

				{/* Window/Level Presets */}
				{isReady && showInfo && presets.length > 1 && (
					<div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md rounded-lg p-2 border border-slate-700/50 shadow-2xl z-20">
						<div className="flex items-center gap-2">
							<span className="text-xs text-slate-400 px-2">Presets:</span>
							{presets.map((preset, idx) => (
								<Button
									key={idx}
									onClick={() => handlePresetWindowLevel(preset.window, preset.level)}
									variant="ghost"
									size="sm"
									className="h-7 px-3 text-xs text-slate-300 hover:text-white hover:bg-slate-700/80"
								>
									{preset.name}
								</Button>
							))}
						</div>
					</div>
				)}

				{/* Status Bar */}
				{isReady && (
					<div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md rounded px-3 py-1.5 border border-slate-700/50 shadow-lg z-20">
						<div className="text-xs text-slate-400 flex items-center gap-2">
							<div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
							<span>Ready</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
