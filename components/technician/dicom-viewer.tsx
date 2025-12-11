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

import { AiFinding, AiAnalysis } from '@/lib/api/services/ai-analysis.service';
import { imageAnnotationService } from '@/lib/api/services/image-annotation.service';

export interface DicomViewerProps {
	file: File;
	onClose: () => void;
	aiAnalysis?: AiAnalysis | null;
	instanceId?: string;
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
	sopInstanceUID?: string;
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

export default function DicomViewer({ file, onClose, aiAnalysis, instanceId }: DicomViewerProps) {
	const elementRef = useRef<HTMLDivElement>(null);
	const cleanupRef = useRef<(() => void) | null>(null);
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

	interface AnnotationItem {
		annotationUID: string;
		metadata?: {
			toolName?: string;
			label?: string;
			isAiAnnotation?: boolean;
		};
		toolName?: string;
		data?: {
			text?: string;
			label?: string;
		};
	}
	const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
	const [showAnnotations, setShowAnnotations] = useState(true);

	const [notes, setNotes] = useState<Note[]>([]);
	const [isNoteMode, setIsNoteMode] = useState(false);
	const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
	const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

	// AI findings overlay state
	interface AiBoundingBox {
		id: string;
		label: string;
		confidence: number;
		canvasX: number;
		canvasY: number;
		canvasWidth: number;
		canvasHeight: number;
		color: string;
		isEdited?: boolean; // Track if bbox has been manually edited
		type: 'ai' | 'manual' | 'saved'; // Distinguish AI-generated vs manually drawn vs saved annotations
		// Original pixel coordinates for recalculation on zoom/pan (for saved annotations)
		originalPixelCoords?: {
			xMin: number;
			yMin: number;
			xMax: number;
			yMax: number;
		};
	}
	const [aiBoundingBoxes, setAiBoundingBoxes] = useState<AiBoundingBox[]>([]);
	const [selectedBboxId, setSelectedBboxId] = useState<string | null>(null);
	const [isDraggingBbox, setIsDraggingBbox] = useState(false);
	const [isResizingBbox, setIsResizingBbox] = useState<string | null>(null); // 'nw', 'ne', 'sw', 'se' for corners
	const [bboxDragStart, setBboxDragStart] = useState<{ x: number; y: number } | null>(null);

	// Manual bbox drawing mode
	const [isDrawingBbox, setIsDrawingBbox] = useState(false);
	const [bboxDrawStart, setBboxDrawStart] = useState<{ x: number; y: number } | null>(null);
	const [currentDrawingBbox, setCurrentDrawingBbox] = useState<AiBoundingBox | null>(null);

	// Label editing for manual bboxes
	const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
	const [editingLabelText, setEditingLabelText] = useState<string>('');

	// Load saved annotations on mount
	useEffect(() => {
		const loadSavedAnnotations = async () => {
			if (!instanceId || !isReady) return;

			try {
				const savedAnnotations = await imageAnnotationService.getByInstanceId(instanceId);

				// Convert saved annotations to bounding boxes
				const savedBoxes: AiBoundingBox[] = [];

				for (const annotation of savedAnnotations) {
					if (annotation.annotationType === 'bounding_box') {
						try {
							const data = JSON.parse(annotation.annotationData);

							// Get viewport for coordinate conversion
							const renderingEngine = getRenderingEngine(renderingEngineId);
							const viewport = renderingEngine?.getViewport(viewportId) as Types.IStackViewport;
							if (!viewport) continue;

							// Get image data for coordinate transformation
							const imageData = viewport.getImageData();
							const spacing = imageData.spacing || [1, 1, 1];
							const origin = imageData.origin || [0, 0, 0];
							const direction = imageData.direction || [1, 0, 0, 0, 1, 0, 0, 0, 1];

							// Convert image pixel to world coordinates
							const imagePixelToWorld = (px: number, py: number): Types.Point3 => {
								const worldX =
									origin[0] + direction[0] * px * spacing[0] + direction[1] * py * spacing[1];
								const worldY =
									origin[1] + direction[3] * px * spacing[0] + direction[4] * py * spacing[1];
								const worldZ =
									origin[2] + direction[6] * px * spacing[0] + direction[7] * py * spacing[1];
								return [worldX, worldY, worldZ];
							};

							// Convert to world coords
							const worldTopLeft = imagePixelToWorld(data.xMin, data.yMin);
							const worldBottomRight = imagePixelToWorld(data.xMax, data.yMax);

							// Convert world coords to canvas coords
							const canvasTopLeft = viewport.worldToCanvas(worldTopLeft);
							const canvasBottomRight = viewport.worldToCanvas(worldBottomRight);

							const canvasX = canvasTopLeft[0];
							const canvasY = canvasTopLeft[1];
							const canvasBoxWidth = canvasBottomRight[0] - canvasTopLeft[0];
							const canvasBoxHeight = canvasBottomRight[1] - canvasTopLeft[1];

							savedBoxes.push({
								id: annotation.id,
								label: data.label || 'Saved Annotation',
								confidence: data.confidence || 1.0,
								canvasX,
								canvasY,
								canvasWidth: canvasBoxWidth,
								canvasHeight: canvasBoxHeight,
								color: '#9333EA', // Purple for saved annotations
								type: 'saved',
								isEdited: false,
								// Store original pixel coords for recalculation on zoom/pan
								originalPixelCoords: {
									xMin: data.xMin,
									yMin: data.yMin,
									xMax: data.xMax,
									yMax: data.yMax,
								},
							});
						} catch (error) {
							console.error('Error parsing annotation:', error);
						}
					}
				}

				// Merge saved annotations with existing bounding boxes
				setAiBoundingBoxes(prev => [...prev, ...savedBoxes]);
			} catch (error) {
				console.error('Error loading saved annotations:', error);
			}
		};

		loadSavedAnnotations();
	}, [instanceId, isReady, renderingEngineId, viewportId]);

	useEffect(() => {
		const objectURL: string | null = null;
		const element = elementRef.current; // Store element reference for cleanup

		const run = async () => {
			if (!element) return;

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
					element: element as HTMLDivElement,
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

					// Enable RectangleROI tool to display annotations (set as enabled for visibility)
					toolGroup.setToolEnabled(RectangleROITool.toolName);

					// Gán tool group cho viewport
					toolGroup.addViewport(viewportId, renderingEngineId);

					// Enable annotation rendering and disable statistics display
					toolGroup.setToolConfiguration(RectangleROITool.toolName, {
						drawHandles: true,
						drawHandlesOnHover: true,
						hideHandlesIfMoving: false,
						preventHandleOutsideImage: true,
						// Disable statistics calculation and display
						calculateStats: false,
						showTextBox: true, // Show label text box
						displayText: ['label'], // Only show label, not stats
					});
				}

				// Set up event listeners for annotation changes
				const onAnnotationModified = () => {
					console.log('🎯 Annotation modified event triggered');
					updateAnnotations();
					// Force a render
					setTimeout(() => {
						const renderingEngine = getRenderingEngine(renderingEngineId);
						const viewport = renderingEngine?.getViewport(viewportId);
						if (viewport) {
							viewport.render();
						}
					}, 0);
				};

				const onAnnotationAdded = () => {
					console.log('🎯 Annotation added event triggered');
					updateAnnotations();
					// Force a render
					setTimeout(() => {
						const renderingEngine = getRenderingEngine(renderingEngineId);
						const viewport = renderingEngine?.getViewport(viewportId);
						if (viewport) {
							viewport.render();
						}
					}, 0);
				};

				// Listen for annotation events
				element.addEventListener(ToolsEnums.Events.ANNOTATION_MODIFIED, onAnnotationModified);
				element.addEventListener(ToolsEnums.Events.ANNOTATION_ADDED, onAnnotationAdded);

				// Store listeners for cleanup
				cleanupRef.current = () => {
					element.removeEventListener(ToolsEnums.Events.ANNOTATION_MODIFIED, onAnnotationModified);
					element.removeEventListener(ToolsEnums.Events.ANNOTATION_ADDED, onAnnotationAdded);
				};

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
						const sopCommonModule = metaData.get('sopCommonModule', imageId);

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
							sopInstanceUID: sopCommonModule?.sopInstanceUID,
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

				// Add annotation event listeners for render updates
				const handleAnnotationModified = () => {
					console.log('🎯 Annotation modified event triggered');
					setTimeout(() => {
						viewport.render();
					}, 50);
				};

				const handleAnnotationAdded = () => {
					console.log('🎯 Annotation added event triggered');
					setTimeout(() => {
						viewport.render();
					}, 50);
				};

				// Listen to annotation events
				element.addEventListener('cornerstoneAnnotationModified', handleAnnotationModified);
				element.addEventListener('cornerstoneAnnotationAdded', handleAnnotationAdded);

				setIsReady(true);
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Lỗi không xác định';
				setError(`Không thể hiển thị ảnh DICOM: ${message}`);
			}
		};

		run();

		// Cleanup khi component unmount hoặc file thay đổi
		return () => {
			// Cleanup event listeners
			if (cleanupRef.current) {
				cleanupRef.current();
				cleanupRef.current = null;
			}

			// Remove annotation event listeners
			if (element) {
				element.removeEventListener('cornerstoneAnnotationModified', () => {});
				element.removeEventListener('cornerstoneAnnotationAdded', () => {});
			}

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [file]);

	// Function to update annotations list and label positions
	const updateAnnotations = useCallback(() => {
		if (!elementRef.current) return;

		try {
			// Get all annotations for the element
			const allAnnotations: AnnotationItem[] = [];
			const element = elementRef.current;

			// Get Rectangle ROI annotations
			let rectAnnList: AnnotationItem[] = [];
			try {
				const rectAnnotations = annotation.state.getAnnotations(RectangleROITool.toolName, element);
				if (rectAnnotations && Array.isArray(rectAnnotations)) {
					rectAnnList = rectAnnotations as AnnotationItem[];
				} else if (rectAnnotations && typeof rectAnnotations === 'object') {
					// If it's an object, get all values
					Object.values(rectAnnotations).forEach((ann: unknown) => {
						if (Array.isArray(ann)) {
							rectAnnList.push(...(ann as AnnotationItem[]));
						} else if (ann) {
							rectAnnList.push(ann as AnnotationItem);
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
					allAnnotations.push(...(arrowAnnotations as AnnotationItem[]));
				} else if (arrowAnnotations && typeof arrowAnnotations === 'object') {
					// If it's an object, get all values
					Object.values(arrowAnnotations).forEach((ann: unknown) => {
						if (Array.isArray(ann)) {
							allAnnotations.push(...(ann as AnnotationItem[]));
						} else if (ann) {
							allAnnotations.push(ann as AnnotationItem);
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

	// Render AI findings as SVG overlay (bypass CornerstoneJS annotations that keep getting rejected)
	useEffect(() => {
		if (!isReady || !aiAnalysis?.findings || !elementRef.current) return;

		const renderAiFindings = async () => {
			try {
				const element = elementRef.current;
				if (!element) return;

				const boundingBoxes: AiBoundingBox[] = [];

				// Get viewport for coordinate conversion
				const renderingEngine = getRenderingEngine(renderingEngineId);
				const viewport = renderingEngine?.getViewport(viewportId) as Types.IStackViewport;
				if (!viewport) return;

				// Convert AI findings to canvas bounding boxes for SVG overlay
				aiAnalysis.findings.forEach((finding: AiFinding) => {
					let coordinates: { xMin: number; yMin: number; xMax: number; yMax: number } | null = null;

					// Check if we have direct coordinates
					if (
						finding.xMin !== undefined &&
						finding.yMin !== undefined &&
						finding.xMax !== undefined &&
						finding.yMax !== undefined
					) {
						coordinates = {
							xMin: finding.xMin,
							yMin: finding.yMin,
							xMax: finding.xMax,
							yMax: finding.yMax,
						};
					}
					// Check if we have boundingBox format
					else if (finding.boundingBox) {
						coordinates = {
							xMin: finding.boundingBox.x,
							yMin: finding.boundingBox.y,
							xMax: finding.boundingBox.x + finding.boundingBox.width,
							yMax: finding.boundingBox.y + finding.boundingBox.height,
						};
					}

					if (!coordinates) return;

					// Get the actual image being displayed
					const image = viewport.getCornerstoneImage();
					const imageWidth = image.width;
					const imageHeight = image.height;

					// Check if coordinates are normalized (0-1) or absolute pixels
					const isNormalized = coordinates.xMax <= 1 && coordinates.yMax <= 1;

					// Convert normalized coordinates to pixel coordinates if needed
					let pixelCoords = { ...coordinates };
					if (isNormalized) {
						pixelCoords = {
							xMin: coordinates.xMin * imageWidth,
							yMin: coordinates.yMin * imageHeight,
							xMax: coordinates.xMax * imageWidth,
							yMax: coordinates.yMax * imageHeight,
						};
					}

					// Get image data for coordinate transformation
					const imageData = viewport.getImageData();
					const spacing = imageData.spacing || [1, 1, 1];
					const origin = imageData.origin || [0, 0, 0];
					const direction = imageData.direction || [1, 0, 0, 0, 1, 0, 0, 0, 1];

					// Convert image pixel to world coordinates first
					const imagePixelToWorld = (px: number, py: number): Types.Point3 => {
						const worldX =
							origin[0] + direction[0] * px * spacing[0] + direction[1] * py * spacing[1];
						const worldY =
							origin[1] + direction[3] * px * spacing[0] + direction[4] * py * spacing[1];
						const worldZ =
							origin[2] + direction[6] * px * spacing[0] + direction[7] * py * spacing[1];
						return [worldX, worldY, worldZ];
					};

					// Convert to world coords
					const worldTopLeft = imagePixelToWorld(pixelCoords.xMin, pixelCoords.yMin);
					const worldBottomRight = imagePixelToWorld(pixelCoords.xMax, pixelCoords.yMax);

					// Convert world coords to canvas coords using viewport (accounts for zoom/pan)
					const canvasTopLeft = viewport.worldToCanvas(worldTopLeft);
					const canvasBottomRight = viewport.worldToCanvas(worldBottomRight);

					const canvasX = canvasTopLeft[0];
					const canvasY = canvasTopLeft[1];
					const canvasBoxWidth = canvasBottomRight[0] - canvasTopLeft[0];
					const canvasBoxHeight = canvasBottomRight[1] - canvasTopLeft[1];

					// Determine color based on finding type
					let boxColor = '#00FF00'; // Default green
					const labelLower = finding.label.toLowerCase();
					if (labelLower.includes('effusion')) {
						boxColor = '#FFFF00'; // Yellow
					} else if (labelLower.includes('opacity')) {
						boxColor = '#FFA500'; // Orange
					} else if (labelLower.includes('fibrosis')) {
						boxColor = '#FF0000'; // Red
					} else if (labelLower.includes('cardiomegaly')) {
						boxColor = '#00FFFF'; // Cyan for heart
					}

					// Add to bounding boxes array for SVG overlay
					boundingBoxes.push({
						id: finding.id,
						label: finding.label,
						confidence: finding.confidenceScore,
						canvasX,
						canvasY,
						canvasWidth: canvasBoxWidth,
						canvasHeight: canvasBoxHeight,
						color: boxColor,
						type: 'ai',
					});
				});

				// Merge AI findings with existing saved annotations (preserve saved/manual boxes)
				setAiBoundingBoxes(prev => {
					const savedAndManual = prev.filter(box => box.type === 'saved' || box.type === 'manual');
					return [...boundingBoxes, ...savedAndManual];
				});
			} catch (error) {
				console.error('Error rendering AI findings:', error);
			}
		}; // Delay to ensure viewport is ready
		setTimeout(renderAiFindings, 500);
	}, [isReady, aiAnalysis, renderingEngineId, viewportId, updateAnnotations]);

	// Update bounding boxes on viewport camera changes (zoom/pan)
	useEffect(() => {
		if (!isReady || !aiAnalysis?.findings || aiBoundingBoxes.length === 0) return;

		const handleCameraModified = () => {
			// Re-render bounding boxes when camera changes
			const engine = getRenderingEngine(renderingEngineId);
			const viewport = engine?.getViewport(viewportId) as Types.IStackViewport;
			if (!viewport) return;

			const imageData = viewport.getImageData();
			const spacing = imageData.spacing || [1, 1, 1];
			const origin = imageData.origin || [0, 0, 0];
			const direction = imageData.direction || [1, 0, 0, 0, 1, 0, 0, 0, 1];

			const imagePixelToWorld = (px: number, py: number): Types.Point3 => {
				const worldX = origin[0] + direction[0] * px * spacing[0] + direction[1] * py * spacing[1];
				const worldY = origin[1] + direction[3] * px * spacing[0] + direction[4] * py * spacing[1];
				const worldZ = origin[2] + direction[6] * px * spacing[0] + direction[7] * py * spacing[1];
				return [worldX, worldY, worldZ];
			};

			const updatedBoxes = aiBoundingBoxes.map(box => {
				// Handle saved annotations with original pixel coords
				if (box.type === 'saved' && box.originalPixelCoords) {
					const { xMin, yMin, xMax, yMax } = box.originalPixelCoords;

					const worldTopLeft = imagePixelToWorld(xMin, yMin);
					const worldBottomRight = imagePixelToWorld(xMax, yMax);
					const canvasTopLeft = viewport.worldToCanvas(worldTopLeft);
					const canvasBottomRight = viewport.worldToCanvas(worldBottomRight);

					return {
						...box,
						canvasX: canvasTopLeft[0],
						canvasY: canvasTopLeft[1],
						canvasWidth: canvasBottomRight[0] - canvasTopLeft[0],
						canvasHeight: canvasBottomRight[1] - canvasTopLeft[1],
					};
				}

				// Manual boxes don't need recalculation (they're already in canvas coords)
				if (box.type === 'manual') return box;

				// Handle AI boxes
				if (!aiAnalysis?.findings) return box;

				// Find the corresponding finding
				const finding = aiAnalysis.findings.find(f => f.id === box.id);
				if (!finding) return box;

				// Recalculate coordinates from original finding data
				let coordinates: { xMin: number; yMin: number; xMax: number; yMax: number } | null = null;

				if (
					finding.xMin !== undefined &&
					finding.yMin !== undefined &&
					finding.xMax !== undefined &&
					finding.yMax !== undefined
				) {
					coordinates = {
						xMin: finding.xMin,
						yMin: finding.yMin,
						xMax: finding.xMax,
						yMax: finding.yMax,
					};
				} else if (finding.boundingBox) {
					coordinates = {
						xMin: finding.boundingBox.x,
						yMin: finding.boundingBox.y,
						xMax: finding.boundingBox.x + finding.boundingBox.width,
						yMax: finding.boundingBox.y + finding.boundingBox.height,
					};
				}

				if (!coordinates) return box;

				const image = viewport.getCornerstoneImage();
				const imageWidth = image.width;
				const imageHeight = image.height;

				const isNormalized = coordinates.xMax <= 1 && coordinates.yMax <= 1;
				let pixelCoords = { ...coordinates };
				if (isNormalized) {
					pixelCoords = {
						xMin: coordinates.xMin * imageWidth,
						yMin: coordinates.yMin * imageHeight,
						xMax: coordinates.xMax * imageWidth,
						yMax: coordinates.yMax * imageHeight,
					};
				}

				const worldTopLeft = imagePixelToWorld(pixelCoords.xMin, pixelCoords.yMin);
				const worldBottomRight = imagePixelToWorld(pixelCoords.xMax, pixelCoords.yMax);
				const canvasTopLeft = viewport.worldToCanvas(worldTopLeft);
				const canvasBottomRight = viewport.worldToCanvas(worldBottomRight);

				return {
					...box,
					canvasX: canvasTopLeft[0],
					canvasY: canvasTopLeft[1],
					canvasWidth: canvasBottomRight[0] - canvasTopLeft[0],
					canvasHeight: canvasBottomRight[1] - canvasTopLeft[1],
				};
			});

			setAiBoundingBoxes(updatedBoxes);
		};

		const element = elementRef.current;
		if (element) {
			element.addEventListener(Enums.Events.CAMERA_MODIFIED as string, handleCameraModified);
			return () => {
				element.removeEventListener(Enums.Events.CAMERA_MODIFIED as string, handleCameraModified);
			};
		}
	}, [isReady, aiAnalysis, aiBoundingBoxes, renderingEngineId, viewportId]);

	// Handle bbox dragging and resizing
	const handleBboxMouseMove = useCallback(
		(e: React.MouseEvent | MouseEvent) => {
			if (!bboxDragStart || (!isDraggingBbox && !isResizingBbox) || !selectedBboxId) return;

			const deltaX = e.clientX - bboxDragStart.x;
			const deltaY = e.clientY - bboxDragStart.y;

			setAiBoundingBoxes(prev =>
				prev.map(box => {
					if (box.id !== selectedBboxId) return box;

					if (isDraggingBbox) {
						// Move the entire bbox
						return {
							...box,
							canvasX: box.canvasX + deltaX,
							canvasY: box.canvasY + deltaY,
							isEdited: true,
						};
					} else if (isResizingBbox) {
						// Resize the bbox based on which corner is being dragged
						const newBox = { ...box, isEdited: true };

						switch (isResizingBbox) {
							case 'nw': // Top-left
								newBox.canvasX += deltaX;
								newBox.canvasY += deltaY;
								newBox.canvasWidth -= deltaX;
								newBox.canvasHeight -= deltaY;
								break;
							case 'ne': // Top-right
								newBox.canvasY += deltaY;
								newBox.canvasWidth += deltaX;
								newBox.canvasHeight -= deltaY;
								break;
							case 'sw': // Bottom-left
								newBox.canvasX += deltaX;
								newBox.canvasWidth -= deltaX;
								newBox.canvasHeight += deltaY;
								break;
							case 'se': // Bottom-right
								newBox.canvasWidth += deltaX;
								newBox.canvasHeight += deltaY;
								break;
						}

						// Ensure minimum size
						if (newBox.canvasWidth < 20) newBox.canvasWidth = 20;
						if (newBox.canvasHeight < 20) newBox.canvasHeight = 20;

						return newBox;
					}

					return box;
				})
			);

			setBboxDragStart({ x: e.clientX, y: e.clientY });
		},
		[bboxDragStart, isDraggingBbox, isResizingBbox, selectedBboxId]
	);

	const handleBboxMouseUp = useCallback(() => {
		setIsDraggingBbox(false);
		setIsResizingBbox(null);
		setBboxDragStart(null);
	}, []);

	// Add/remove bbox drag listeners
	useEffect(() => {
		if (isDraggingBbox || isResizingBbox) {
			window.addEventListener('mousemove', handleBboxMouseMove);
			window.addEventListener('mouseup', handleBboxMouseUp);
			return () => {
				window.removeEventListener('mousemove', handleBboxMouseMove);
				window.removeEventListener('mouseup', handleBboxMouseUp);
			};
		}
	}, [isDraggingBbox, isResizingBbox, handleBboxMouseMove, handleBboxMouseUp]);

	// Manual bbox drawing handlers
	const handleManualBboxMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (!isDrawingBbox) return;

			e.stopPropagation();
			e.preventDefault();

			const rect = elementRef.current?.getBoundingClientRect();
			if (!rect) return;

			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			setBboxDrawStart({ x, y });
			setCurrentDrawingBbox({
				id: `manual-bbox-${Date.now()}`,
				label: 'Manual Finding',
				confidence: 1.0,
				canvasX: x,
				canvasY: y,
				canvasWidth: 0,
				canvasHeight: 0,
				color: '#FF00FF', // Magenta for manual bboxes
				type: 'manual',
				isEdited: false,
			});
		},
		[isDrawingBbox]
	);

	const handleManualBboxMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDrawingBbox || !bboxDrawStart || !currentDrawingBbox) return;

			const rect = elementRef.current?.getBoundingClientRect();
			if (!rect) return;

			const currentX = e.clientX - rect.left;
			const currentY = e.clientY - rect.top;

			const width = currentX - bboxDrawStart.x;
			const height = currentY - bboxDrawStart.y;

			// Update the drawing bbox
			setCurrentDrawingBbox({
				...currentDrawingBbox,
				canvasWidth: Math.abs(width),
				canvasHeight: Math.abs(height),
				canvasX: width < 0 ? currentX : bboxDrawStart.x,
				canvasY: height < 0 ? currentY : bboxDrawStart.y,
			});
		},
		[isDrawingBbox, bboxDrawStart, currentDrawingBbox]
	);

	const handleManualBboxMouseUp = useCallback(() => {
		if (!isDrawingBbox || !currentDrawingBbox) return;

		// Only add if bbox has meaningful size (at least 20x20 pixels)
		if (currentDrawingBbox.canvasWidth >= 20 && currentDrawingBbox.canvasHeight >= 20) {
			setAiBoundingBoxes(prev => [...prev, { ...currentDrawingBbox, isEdited: true }]);

			// Auto-select the new bbox and enable label editing
			setSelectedBboxId(currentDrawingBbox.id);
			setEditingLabelId(currentDrawingBbox.id);
			setEditingLabelText(currentDrawingBbox.label);
		}

		// Reset drawing state
		setBboxDrawStart(null);
		setCurrentDrawingBbox(null);
	}, [isDrawingBbox, currentDrawingBbox]);

	// Add/remove manual bbox drawing listeners
	useEffect(() => {
		if (isDrawingBbox && bboxDrawStart) {
			window.addEventListener('mousemove', handleManualBboxMouseMove);
			window.addEventListener('mouseup', handleManualBboxMouseUp);
			return () => {
				window.removeEventListener('mousemove', handleManualBboxMouseMove);
				window.removeEventListener('mouseup', handleManualBboxMouseUp);
			};
		}
	}, [isDrawingBbox, bboxDrawStart, handleManualBboxMouseMove, handleManualBboxMouseUp]);

	// Handle label editing for manual bboxes
	const handleSaveLabelEdit = useCallback(() => {
		if (!editingLabelId || !editingLabelText.trim()) {
			setEditingLabelId(null);
			return;
		}

		setAiBoundingBoxes(prev =>
			prev.map(box =>
				box.id === editingLabelId ? { ...box, label: editingLabelText.trim(), isEdited: true } : box
			)
		);

		setEditingLabelId(null);
		setEditingLabelText('');
	}, [editingLabelId, editingLabelText]);

	const handleCancelLabelEdit = useCallback(() => {
		setEditingLabelId(null);
		setEditingLabelText('');
	}, []);

	// Delete bounding box
	const handleDeleteBoundingBox = useCallback(
		(id: string) => {
			setAiBoundingBoxes(prev => prev.filter(box => box.id !== id));
			if (selectedBboxId === id) {
				setSelectedBboxId(null);
			}
			if (editingLabelId === id) {
				setEditingLabelId(null);
				setEditingLabelText('');
			}
		},
		[selectedBboxId, editingLabelId]
	);

	// Convert canvas coordinates back to image pixels for API
	const canvasToImagePixels = useCallback(
		(canvasX: number, canvasY: number): { x: number; y: number } | null => {
			try {
				const engine = getRenderingEngine(renderingEngineId);
				const viewport = engine?.getViewport(viewportId) as Types.IStackViewport;
				if (!viewport) return null;

				const image = viewport.getCornerstoneImage();
				const imageWidth = image.width;
				const imageHeight = image.height;

				const imageData = viewport.getImageData();
				const spacing = imageData.spacing || [1, 1, 1];
				const origin = imageData.origin || [0, 0, 0];
				const direction = imageData.direction || [1, 0, 0, 0, 1, 0, 0, 0, 1];

				// Convert canvas to world coordinates
				const worldCoords = viewport.canvasToWorld([canvasX, canvasY]);

				// Convert world to image pixels (inverse of imagePixelToWorld)
				// worldX = origin[0] + (direction[0] * px * spacing[0]) + (direction[1] * py * spacing[1])
				// Solve for px and py
				const det = direction[0] * direction[4] - direction[1] * direction[3];
				if (Math.abs(det) < 0.0001) return null; // Singular matrix

				const dx = worldCoords[0] - origin[0];
				const dy = worldCoords[1] - origin[1];

				const px = (direction[4] * dx - direction[1] * dy) / det / spacing[0];
				const py = (-direction[3] * dx + direction[0] * dy) / det / spacing[1];

				// Clamp to image bounds
				const clampedX = Math.max(0, Math.min(imageWidth, px));
				const clampedY = Math.max(0, Math.min(imageHeight, py));

				return { x: clampedX, y: clampedY };
			} catch (error) {
				console.error('Error converting canvas to image pixels:', error);
				return null;
			}
		},
		[renderingEngineId, viewportId]
	);

	// Save bbox changes
	const handleSaveBboxChanges = useCallback(async () => {
		try {
			const editedBoxes = aiBoundingBoxes.filter(box => box.isEdited);
			if (editedBoxes.length === 0) {
				alert('No changes to save');
				return;
			}

			// Check if we have instanceId
			if (!instanceId) {
				alert('Error: Cannot save annotations - Instance ID not found');
				console.error('Instance ID is required to save annotations');
				return;
			} // Convert canvas coords back to image pixels and prepare for API
			const updates = editedBoxes
				.map(box => {
					const topLeft = canvasToImagePixels(box.canvasX, box.canvasY);
					const bottomRight = canvasToImagePixels(
						box.canvasX + box.canvasWidth,
						box.canvasY + box.canvasHeight
					);

					if (!topLeft || !bottomRight) return null;

					return {
						id: box.id,
						label: box.label,
						xMin: topLeft.x,
						yMin: topLeft.y,
						xMax: bottomRight.x,
						yMax: bottomRight.y,
						confidence: box.confidence,
						type: box.type || 'ai',
					};
				})
				.filter(Boolean) as Array<{
				id: string;
				label: string;
				xMin: number;
				yMin: number;
				xMax: number;
				yMax: number;
				confidence: number;
				type: string;
			}>;

			// Save each annotation to the database
			const savedCount = { success: 0, failed: 0 };
			for (const annotation of updates) {
				try {
					// Prepare annotation data as JSON string
					const annotationData = JSON.stringify({
						xMin: annotation.xMin,
						yMin: annotation.yMin,
						xMax: annotation.xMax,
						yMax: annotation.yMax,
						label: annotation.label,
						confidence: annotation.confidence,
						type: annotation.type,
					});

					// Create annotation in database
					await imageAnnotationService.create({
						instanceId: instanceId,
						annotationType: 'bounding_box',
						annotationData: annotationData,
					});

					savedCount.success++;
				} catch (error) {
					console.error(`Failed to save annotation ${annotation.id}:`, error);
					savedCount.failed++;
				}
			}

			// Show result
			if (savedCount.success > 0) {
				alert(
					`Successfully saved ${savedCount.success} annotation(s)!${
						savedCount.failed > 0 ? `\n${savedCount.failed} failed to save.` : ''
					}`
				);

				// Mark as saved by removing isEdited flag
				setAiBoundingBoxes(prev => prev.map(box => ({ ...box, isEdited: false })));
				setSelectedBboxId(null);
			} else {
				alert('Failed to save annotations');
			}
		} catch (error) {
			console.error('Error saving bbox changes:', error);
			alert(
				'Failed to save changes: ' + (error instanceof Error ? error.message : 'Unknown error')
			);
		}
	}, [aiBoundingBoxes, canvasToImagePixels, instanceId]);

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
						setIsDrawingBbox(prev => !prev);
						// Deselect any selected bbox when toggling drawing mode
						setSelectedBboxId(null);
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

					{/* Save bbox changes button - show if any bbox has been edited */}
					{aiBoundingBoxes.some(box => box.isEdited) && (
						<button
							onClick={handleSaveBboxChanges}
							className="z-50 ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
							Save AI Findings Changes
						</button>
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
					isDrawingBbox={isDrawingBbox}
					onToggleBboxDrawing={() => {
						setIsDrawingBbox(!isDrawingBbox);
						// Deselect any selected bbox when toggling drawing mode
						if (!isDrawingBbox) {
							setSelectedBboxId(null);
						}
					}}
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
					className={`w-full h-full outline-none ${isDrawingBbox ? 'cursor-crosshair' : isNoteMode ? 'cursor-crosshair' : 'cursor-default'}`}
					onContextMenu={e => e.preventDefault()}
					onMouseDown={isDrawingBbox ? handleManualBboxMouseDown : undefined}
				>
					{/* SVG Overlay for AI Findings and Manual Bboxes */}
					{isReady && (aiBoundingBoxes.length > 0 || currentDrawingBbox) && (
						<svg
							className="absolute inset-0 w-full h-full z-10"
							style={{ mixBlendMode: 'normal', pointerEvents: 'none' }}
						>
							{/* Background rect to deselect bbox when clicking outside */}
							{!isDrawingBbox && (
								<rect
									x="0"
									y="0"
									width="100%"
									height="100%"
									fill="transparent"
									style={{ pointerEvents: 'auto' }}
									onClick={() => setSelectedBboxId(null)}
								/>
							)}

							{/* Render all bboxes (AI + Manual) */}
							{aiBoundingBoxes.map(box => {
								const isSelected = selectedBboxId === box.id;
								const isManual = box.type === 'manual';
								return (
									<g key={box.id}>
										{/* Rectangle */}
										<rect
											x={box.canvasX}
											y={box.canvasY}
											width={box.canvasWidth}
											height={box.canvasHeight}
											fill={isSelected ? 'rgba(255, 255, 255, 0.1)' : 'none'}
											stroke={box.color}
											strokeWidth={isSelected ? '4' : '3'}
											strokeDasharray={isSelected ? '8 4' : 'none'}
											opacity="0.9"
											style={{
												pointerEvents: 'auto',
												cursor: isSelected ? 'move' : 'pointer',
											}}
											onClick={e => {
												e.stopPropagation();
												setSelectedBboxId(box.id);
											}}
											onMouseDown={e => {
												if (isSelected) {
													e.stopPropagation();
													e.preventDefault();
													setIsDraggingBbox(true);
													setBboxDragStart({ x: e.clientX, y: e.clientY });
												}
											}}
										/>
										{/* Label background */}
										<rect
											x={box.canvasX}
											y={box.canvasY - 30}
											width={box.label.length * 8 + 60}
											height="26"
											fill="rgba(0, 0, 0, 0.8)"
											stroke={box.color}
											strokeWidth={isSelected ? '2' : '1'}
											style={{
												pointerEvents: isManual && isSelected ? 'auto' : 'none',
												cursor: isManual && isSelected ? 'text' : 'default',
											}}
											onClick={e => {
												if (isManual && isSelected) {
													e.stopPropagation();
													setEditingLabelId(box.id);
													setEditingLabelText(box.label);
												}
											}}
										/>
										{/* Label text */}
										<text
											x={box.canvasX + 5}
											y={box.canvasY - 10}
											fill={box.color}
											fontSize="16"
											fontWeight="600"
											fontFamily="Arial, sans-serif"
											style={{
												pointerEvents: isManual && isSelected ? 'auto' : 'none',
												cursor: isManual && isSelected ? 'text' : 'default',
											}}
											onClick={e => {
												if (isManual && isSelected) {
													e.stopPropagation();
													setEditingLabelId(box.id);
													setEditingLabelText(box.label);
												}
											}}
										>
											{box.label} {isManual ? '' : `(${Math.round(box.confidence * 100)}%)`}
										</text>

										{/* Resize handles (corners) - only show when selected */}
										{isSelected && (
											<>
												{/* Top-left corner */}
												<circle
													cx={box.canvasX}
													cy={box.canvasY}
													r="6"
													fill="white"
													stroke={box.color}
													strokeWidth="2"
													style={{
														pointerEvents: 'auto',
														cursor: 'nwse-resize',
													}}
													onMouseDown={e => {
														e.stopPropagation();
														e.preventDefault();
														setIsResizingBbox('nw');
														setBboxDragStart({ x: e.clientX, y: e.clientY });
													}}
												/>
												{/* Top-right corner */}
												<circle
													cx={box.canvasX + box.canvasWidth}
													cy={box.canvasY}
													r="6"
													fill="white"
													stroke={box.color}
													strokeWidth="2"
													style={{
														pointerEvents: 'auto',
														cursor: 'nesw-resize',
													}}
													onMouseDown={e => {
														e.stopPropagation();
														e.preventDefault();
														setIsResizingBbox('ne');
														setBboxDragStart({ x: e.clientX, y: e.clientY });
													}}
												/>
												{/* Bottom-left corner */}
												<circle
													cx={box.canvasX}
													cy={box.canvasY + box.canvasHeight}
													r="6"
													fill="white"
													stroke={box.color}
													strokeWidth="2"
													style={{
														pointerEvents: 'auto',
														cursor: 'nesw-resize',
													}}
													onMouseDown={e => {
														e.stopPropagation();
														e.preventDefault();
														setIsResizingBbox('sw');
														setBboxDragStart({ x: e.clientX, y: e.clientY });
													}}
												/>
												{/* Bottom-right corner */}
												<circle
													cx={box.canvasX + box.canvasWidth}
													cy={box.canvasY + box.canvasHeight}
													r="6"
													fill="white"
													stroke={box.color}
													strokeWidth="2"
													style={{
														pointerEvents: 'auto',
														cursor: 'nwse-resize',
													}}
													onMouseDown={e => {
														e.stopPropagation();
														e.preventDefault();
														setIsResizingBbox('se');
														setBboxDragStart({ x: e.clientX, y: e.clientY });
													}}
												/>
											</>
										)}
									</g>
								);
							})}

							{/* Currently drawing bbox */}
							{currentDrawingBbox &&
								currentDrawingBbox.canvasWidth > 0 &&
								currentDrawingBbox.canvasHeight > 0 && (
									<g>
										<rect
											x={currentDrawingBbox.canvasX}
											y={currentDrawingBbox.canvasY}
											width={currentDrawingBbox.canvasWidth}
											height={currentDrawingBbox.canvasHeight}
											fill="rgba(255, 0, 255, 0.1)"
											stroke={currentDrawingBbox.color}
											strokeWidth="3"
											strokeDasharray="8 4"
											opacity="0.8"
											style={{ pointerEvents: 'none' }}
										/>
										<text
											x={currentDrawingBbox.canvasX + 5}
											y={currentDrawingBbox.canvasY + 20}
											fill={currentDrawingBbox.color}
											fontSize="14"
											fontWeight="600"
											fontFamily="Arial, sans-serif"
											style={{ pointerEvents: 'none' }}
										>
											Drawing... {Math.round(currentDrawingBbox.canvasWidth)}×
											{Math.round(currentDrawingBbox.canvasHeight)}
										</text>
									</g>
								)}
						</svg>
					)}

					{/* Label editing input overlay */}
					{editingLabelId &&
						(() => {
							const editingBox = aiBoundingBoxes.find(b => b.id === editingLabelId);
							if (!editingBox) return null;

							return (
								<div
									className="absolute z-20"
									style={{
										left: editingBox.canvasX,
										top: editingBox.canvasY - 35,
										pointerEvents: 'auto',
									}}
								>
									<input
										type="text"
										value={editingLabelText}
										onChange={e => setEditingLabelText(e.target.value)}
										onKeyDown={e => {
											if (e.key === 'Enter') {
												handleSaveLabelEdit();
											} else if (e.key === 'Escape') {
												handleCancelLabelEdit();
											}
										}}
										onBlur={handleSaveLabelEdit}
										autoFocus
										className="px-2 py-1 bg-slate-800 text-white border-2 rounded text-sm font-semibold outline-none"
										style={{
											borderColor: editingBox.color,
											minWidth: '150px',
											boxShadow: `0 0 10px ${editingBox.color}40`,
										}}
										placeholder="Enter finding label..."
									/>
								</div>
							);
						})()}
				</div>

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
						boundingBoxes={aiBoundingBoxes}
						showAnnotations={showAnnotations}
						onToggleShowAnnotations={() => setShowAnnotations(!showAnnotations)}
						onDeleteAnnotation={deleteAnnotation}
						onDeleteNote={deleteNote}
						onDeleteBoundingBox={handleDeleteBoundingBox}
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
