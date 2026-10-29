import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import {
  Layer,
  ImageLayer,
  TextLayer,
  ShapeLayer,
  DrawingLayer,
  DocumentState,
  SmartGuide,
  HistoryItem,
  ShapeType,
  WorkspaceMode
} from '../types';
import { DEFAULT_ADJUSTMENTS } from '../engine/imageFilters';
import { DESIGN_TEMPLATES } from '../constants/templates';
import { parsePhotoshopFile } from '../engine/photoshopImporter';
import { exportToPhotoshopPsd } from '../engine/photoshopExporter';
import {
  parseSvgToLayers,
  exportLayersToSvg,
  exportLayersToAi,
  parseAiFileBuffer,
  applyPathfinder as runPathfinder
} from '../engine/vectorEngine';

export type ToolType =
  | 'select'
  | 'move'
  | 'marquee'
  | 'lasso'
  | 'magic-wand'
  | 'crop'
  | 'eyedropper'
  | 'brush'
  | 'clone-stamp'
  | 'eraser'
  | 'gradient'
  | 'pen'
  | 'text'
  | 'path-selection'
  | 'shape'
  | 'hand'
  | 'zoom';

interface StudioContextType {
  // Document
  documentState: DocumentState;
  setDocumentState: React.Dispatch<React.SetStateAction<DocumentState>>;
  setDimensions: (width: number, height: number) => void;
  setBackground: (bg: string) => void;

  // Zoom & Pan
  zoom: number;
  setZoom: (z: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitToScreen: () => void;

  // Tools & UI Mode
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  activeShapeType: ShapeType;
  setActiveShapeType: (shape: ShapeType) => void;
  brushColor: string;
  setBrushColor: (c: string) => void;
  brushSize: number;
  setBrushSize: (s: number) => void;
  brushHardness: number;
  setBrushHardness: (h: number) => void;
  brushOpacity: number;
  setBrushOpacity: (o: number) => void;
  brushFlow: number;
  setBrushFlow: (f: number) => void;

  // Live Canvas Mouse Coordinates
  mouseCoords: { x: number; y: number };
  setMouseCoords: (coords: { x: number; y: number }) => void;

  // Selection & Layers
  layers: Layer[];
  selectedLayerId: string | null;
  selectedLayer: Layer | null;
  setSelectedLayerId: (id: string | null) => void;
  updateLayer: (id: string, partial: Partial<Layer>, recordHistory?: boolean, historyDesc?: string) => void;
  addNewLayer: (name?: string) => void;
  addTextLayer: (text?: string) => void;
  addShapeLayer: (shapeType?: ShapeType) => void;
  addImageLayer: (src: string, name?: string, naturalW?: number, naturalH?: number) => void;
  addDrawingLayer: (points: { x: number; y: number }[], color: string, brushSize: number) => void;
  duplicateLayer: (id: string) => void;
  deleteLayer: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  toggleLock: (id: string) => void;
  toggleVisibility: (id: string) => void;
  loadTemplate: (templateId: string) => void;

  // Smart Guides
  smartGuides: SmartGuide[];
  setSmartGuides: (guides: SmartGuide[]) => void;

  // History (Undo / Redo)
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  historyStack: HistoryItem[];
  historyIndex: number;

  // Project Export & Import
  exportCanvasAsImage: (format: 'png' | 'jpeg' | 'webp', quality?: number) => string | null;
  downloadImage: (format: 'png' | 'jpeg' | 'webp', quality?: number) => void;
  exportProjectJson: () => void;
  importProjectJson: (jsonString: string) => void;
  openPhotoshopFile: (file: File | { name: string; buffer: ArrayBuffer }) => Promise<boolean>;
  exportPsd: () => Promise<void>;

  // Vector / Adobe Illustrator Studio
  workspaceMode: WorkspaceMode;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  openVectorFile: (file: File | { name: string; buffer?: ArrayBuffer; text?: string }) => Promise<boolean>;
  exportSvgDocument: () => void;
  exportAiDocument: () => void;
  copySvgCode: () => Promise<boolean>;
  applyPathfinder: (op: 'unite' | 'minus-front' | 'intersect' | 'exclude') => void;
  showSvgEditorModal: boolean;
  setShowSvgEditorModal: (show: boolean) => void;
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;

  // Modal Dialogs
  showNewDocModal: boolean;
  setShowNewDocModal: (show: boolean) => void;
  createNewDocument: (width: number, height: number, background?: string, title?: string) => void;
  showTemplatesModal: boolean;
  setShowTemplatesModal: (show: boolean) => void;
  showEvidenceModal: boolean;
  setShowEvidenceModal: (show: boolean) => void;
  showCameraRawModal: boolean;
  setShowCameraRawModal: (show: boolean) => void;
  showHueSatModal: boolean;
  setShowHueSatModal: (show: boolean) => void;
  showLevelsModal: boolean;
  setShowLevelsModal: (show: boolean) => void;

  // Canvas Reference
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

const MAX_HISTORY = 40;

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Document State
  const [documentState, setDocumentState] = useState<DocumentState>({
    title: 'Pixelcharm Masterpiece',
    width: 1200,
    height: 720,
    background: '#090a10',
    zoom: 0.85,
    panX: 0,
    panY: 0
  });

  // Tools
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [activeShapeType, setActiveShapeType] = useState<ShapeType>('rect');
  const [brushColor, setBrushColor] = useState<string>('#6366f1');
  const [brushSize, setBrushSize] = useState<number>(8);
  const [brushHardness, setBrushHardness] = useState<number>(80);
  const [brushOpacity, setBrushOpacity] = useState<number>(100);
  const [brushFlow, setBrushFlow] = useState<number>(100);

  // Live Canvas Mouse Tracking
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Layers
  const [layers, setLayers] = useState<Layer[]>(() => {
    // Start with default initial template
    return DESIGN_TEMPLATES[0].layers;
  });

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>('main-headline');
  const [smartGuides, setSmartGuides] = useState<SmartGuide[]>([]);

  // Modals & Vector Studio Mode
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('photo');
  const [showSvgEditorModal, setShowSvgEditorModal] = useState<boolean>(false);
  const [showNewDocModal, setShowNewDocModal] = useState<boolean>(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState<boolean>(false);
  const [showCameraRawModal, setShowCameraRawModal] = useState<boolean>(false);
  const [showHueSatModal, setShowHueSatModal] = useState<boolean>(false);
  const [showLevelsModal, setShowLevelsModal] = useState<boolean>(false);

  // Canvas references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // History State
  const [historyStack, setHistoryStack] = useState<HistoryItem[]>([
    {
      id: 'init',
      layers: DESIGN_TEMPLATES[0].layers,
      document: {
        width: 1200,
        height: 720,
        background: '#090a10'
      },
      description: 'Initial Project State',
      timestamp: Date.now()
    }
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Helper to record history
  const recordHistory = useCallback(
    (newLayers: Layer[], docState = documentState, desc = 'Update Canvas') => {
      setHistoryStack((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        const next: HistoryItem = {
          id: Math.random().toString(36).substring(2, 9),
          layers: JSON.parse(JSON.stringify(newLayers)),
          document: {
            width: docState.width,
            height: docState.height,
            background: docState.background
          },
          description: desc,
          timestamp: Date.now()
        };
        const updated = [...sliced, next];
        if (updated.length > MAX_HISTORY) updated.shift();
        return updated;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
    },
    [historyIndex, documentState]
  );

  const createNewDocument = useCallback((w: number, h: number, bg = '#ffffff', title = 'Untitled-1') => {
    const bgLayer: Layer = {
      id: 'bg-layer-' + Date.now(),
      name: 'Background',
      type: 'shape',
      shapeType: 'rect',
      x: 0,
      y: 0,
      width: w,
      height: h,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: true,
      blendMode: 'normal',
      fill: bg,
      stroke: 'transparent',
      strokeWidth: 0,
      borderRadius: 0
    };

    const nextDoc: DocumentState = {
      title,
      width: w,
      height: h,
      background: bg,
      zoom: 0.85,
      panX: 0,
      panY: 0
    };

    setDocumentState(nextDoc);
    setLayers([bgLayer]);
    setSelectedLayerId(bgLayer.id);
    setHistoryStack([
      {
        id: 'init-' + Date.now(),
        layers: [bgLayer],
        document: {
          width: w,
          height: h,
          background: bg
        },
        description: 'New Document Created',
        timestamp: Date.now()
      }
    ]);
    setHistoryIndex(0);
    setShowNewDocModal(false);
  }, []);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null;

  // Zoom helpers
  const setZoom = (z: number) => {
    setDocumentState((prev) => ({ ...prev, zoom: Math.max(0.1, Math.min(4, z)) }));
  };

  const zoomIn = () => setZoom(documentState.zoom + 0.15);
  const zoomOut = () => setZoom(documentState.zoom - 0.15);
  const resetZoom = () => setZoom(1);

  const fitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const containerW = containerRef.current.clientWidth - 80;
    const containerH = containerRef.current.clientHeight - 80;
    const scaleX = containerW / documentState.width;
    const scaleY = containerH / documentState.height;
    const newZoom = Math.min(scaleX, scaleY, 1.2);
    setDocumentState((prev) => ({
      ...prev,
      zoom: Math.max(0.2, Number(newZoom.toFixed(2))),
      panX: 0,
      panY: 0
    }));
  }, [documentState.width, documentState.height]);

  const setDimensions = (w: number, h: number) => {
    setDocumentState((prev) => {
      const next = { ...prev, width: w, height: h };
      recordHistory(layers, next, `Resize Canvas to ${w}x${h}`);
      return next;
    });
  };

  const setBackground = (bg: string) => {
    setDocumentState((prev) => {
      const next = { ...prev, background: bg };
      recordHistory(layers, next, 'Change Canvas Background');
      return next;
    });
  };

  // Update Layer
  const updateLayer = (
    id: string,
    partial: Partial<Layer>,
    shouldRecord = false,
    historyDesc = 'Edit Layer'
  ) => {
    setLayers((prev) => {
      const next = prev.map((l) => (l.id === id ? ({ ...l, ...partial } as Layer) : l));
      if (shouldRecord) {
        recordHistory(next, documentState, historyDesc);
      }
      return next;
    });
  };

  // Add Generic New Layer (Photoshop standard)
  const addNewLayer = (name?: string) => {
    const layerCount = layers.length + 1;
    const layerName = name || `Layer ${layerCount}`;
    const newLayer: DrawingLayer = {
      id: `layer-${Date.now()}`,
      name: layerName,
      type: 'drawing',
      x: 0,
      y: 0,
      width: documentState.width,
      height: documentState.height,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      blendMode: 'normal',
      strokes: []
    };

    setLayers((prev) => {
      const next = [...prev, newLayer];
      recordHistory(next, documentState, `New Layer (${layerName})`);
      return next;
    });
    setSelectedLayerId(newLayer.id);
  };

  // Add Text Layer
  const addTextLayer = (initialText = 'Your Text Here') => {
    const newLayer: TextLayer = {
      id: `text-${Date.now()}`,
      name: `Text (${initialText.slice(0, 10)})`,
      type: 'text',
      x: documentState.width / 2 - 180,
      y: documentState.height / 2 - 35,
      width: 360,
      height: 70,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      blendMode: 'normal',
      text: initialText,
      fontSize: 42,
      fontFamily: 'Space Grotesk',
      fontWeight: 700,
      fontStyle: 'normal',
      color: '#ffffff',
      align: 'center',
      letterSpacing: 0,
      lineHeight: 1.2,
      shadowColor: '#000000',
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      strokeColor: '',
      strokeWidth: 0
    };

    setLayers((prev) => {
      const next = [...prev, newLayer];
      recordHistory(next, documentState, 'Add Text Layer');
      return next;
    });
    setSelectedLayerId(newLayer.id);
    setActiveTool('select');
  };

  // Add Shape Layer
  const addShapeLayer = (shapeType: ShapeType = activeShapeType) => {
    const size = 180;
    const newLayer: ShapeLayer = {
      id: `shape-${Date.now()}`,
      name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} Shape`,
      type: 'shape',
      shapeType,
      x: documentState.width / 2 - size / 2,
      y: documentState.height / 2 - size / 2,
      width: size,
      height: size,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      blendMode: 'normal',
      fill: '#4f46e5',
      stroke: '#818cf8',
      strokeWidth: 2,
      borderRadius: shapeType === 'circle' ? size / 2 : 12,
      sides: shapeType === 'star' || shapeType === 'polygon' ? 5 : undefined
    };

    setLayers((prev) => {
      const next = [...prev, newLayer];
      recordHistory(next, documentState, `Add ${shapeType} Shape`);
      return next;
    });
    setSelectedLayerId(newLayer.id);
    setActiveTool('select');
  };

  // Add Image Layer
  const addImageLayer = (
    src: string,
    name = 'Photo Layer',
    naturalW = 600,
    naturalH = 400
  ) => {
    // Scale nicely to fit canvas
    const maxDim = Math.min(documentState.width * 0.65, documentState.height * 0.65);
    const aspect = naturalW / (naturalH || 1);
    let w = maxDim;
    let h = maxDim / aspect;
    if (h > maxDim) {
      h = maxDim;
      w = maxDim * aspect;
    }

    const newLayer: ImageLayer = {
      id: `img-${Date.now()}`,
      name,
      type: 'image',
      src,
      naturalWidth: naturalW,
      naturalHeight: naturalH,
      x: Math.round(documentState.width / 2 - w / 2),
      y: Math.round(documentState.height / 2 - h / 2),
      width: Math.round(w),
      height: Math.round(h),
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      blendMode: 'normal',
      adjustments: { ...DEFAULT_ADJUSTMENTS }
    };

    setLayers((prev) => {
      const next = [...prev, newLayer];
      recordHistory(next, documentState, 'Add Photo Layer');
      return next;
    });
    setSelectedLayerId(newLayer.id);
    setActiveTool('select');
  };

  // Add Freehand Drawing Layer
  const addDrawingLayer = (
    points: { x: number; y: number }[],
    color: string,
    bSize: number
  ) => {
    if (points.length < 2) return;

    // Calculate bounding box of stroke
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    points.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    });

    const pad = bSize;
    const w = Math.max(20, maxX - minX + pad * 2);
    const h = Math.max(20, maxY - minY + pad * 2);

    // Normalize points relative to layer top-left
    const localPoints = points.map((p) => ({
      x: p.x - minX + pad,
      y: p.y - minY + pad
    }));

    const newLayer: DrawingLayer = {
      id: `brush-${Date.now()}`,
      name: 'Brush Stroke',
      type: 'drawing',
      x: Math.round(minX - pad),
      y: Math.round(minY - pad),
      width: Math.round(w),
      height: Math.round(h),
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      blendMode: 'normal',
      points: localPoints,
      color,
      brushSize: bSize
    };

    setLayers((prev) => {
      const next = [...prev, newLayer];
      recordHistory(next, documentState, 'Add Brush Stroke');
      return next;
    });
    setSelectedLayerId(newLayer.id);
  };

  // Duplicate Layer
  const duplicateLayer = (id: string) => {
    const target = layers.find((l) => l.id === id);
    if (!target) return;
    const clone: Layer = {
      ...JSON.parse(JSON.stringify(target)),
      id: `${target.type}-${Date.now()}`,
      name: `${target.name} Copy`,
      x: target.x + 24,
      y: target.y + 24
    };

    setLayers((prev) => {
      const next = [...prev, clone];
      recordHistory(next, documentState, `Duplicate ${target.name}`);
      return next;
    });
    setSelectedLayerId(clone.id);
  };

  // Delete Layer
  const deleteLayer = (id: string) => {
    const target = layers.find((l) => l.id === id);
    setLayers((prev) => {
      const next = prev.filter((l) => l.id !== id);
      recordHistory(next, documentState, `Delete ${target?.name || 'Layer'}`);
      return next;
    });
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  // Layer Reordering (Photoshop stack style: bottom is index 0, top is index len-1)
  const bringForward = (id: string) => {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx + 1];
      copy[idx + 1] = temp;
      recordHistory(copy, documentState, 'Bring Forward');
      return copy;
    });
  };

  const sendBackward = (id: string) => {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx <= 0) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx - 1];
      copy[idx - 1] = temp;
      recordHistory(copy, documentState, 'Send Backward');
      return copy;
    });
  };

  const bringToFront = (id: string) => {
    setLayers((prev) => {
      const target = prev.find((l) => l.id === id);
      if (!target || prev[prev.length - 1].id === id) return prev;
      const filtered = prev.filter((l) => l.id !== id);
      const copy = [...filtered, target];
      recordHistory(copy, documentState, 'Bring To Front');
      return copy;
    });
  };

  const sendToBack = (id: string) => {
    setLayers((prev) => {
      const target = prev.find((l) => l.id === id);
      if (!target || prev[0].id === id) return prev;
      const filtered = prev.filter((l) => l.id !== id);
      const copy = [target, ...filtered];
      recordHistory(copy, documentState, 'Send To Back');
      return copy;
    });
  };

  const toggleLock = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l))
    );
  };

  const toggleVisibility = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  };

  // Load Template
  const loadTemplate = (templateId: string) => {
    const tpl = DESIGN_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;

    const clonedLayers: Layer[] = JSON.parse(JSON.stringify(tpl.layers));
    setDocumentState((prev) => ({
      ...prev,
      title: tpl.name,
      width: tpl.width,
      height: tpl.height,
      background: tpl.background
    }));
    setLayers(clonedLayers);
    setSelectedLayerId(clonedLayers[clonedLayers.length - 1]?.id || null);
    recordHistory(
      clonedLayers,
      { ...documentState, width: tpl.width, height: tpl.height, background: tpl.background },
      `Loaded Template: ${tpl.name}`
    );
    setShowTemplatesModal(false);
  };

  // Undo / Redo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyStack.length - 1;

  const undo = () => {
    if (!canUndo) return;
    const targetIdx = historyIndex - 1;
    const state = historyStack[targetIdx];
    setLayers(JSON.parse(JSON.stringify(state.layers)));
    setDocumentState((prev) => ({
      ...prev,
      width: state.document.width,
      height: state.document.height,
      background: state.document.background
    }));
    setHistoryIndex(targetIdx);
  };

  const redo = () => {
    if (!canRedo) return;
    const targetIdx = historyIndex + 1;
    const state = historyStack[targetIdx];
    setLayers(JSON.parse(JSON.stringify(state.layers)));
    setDocumentState((prev) => ({
      ...prev,
      width: state.document.width,
      height: state.document.height,
      background: state.document.background
    }));
    setHistoryIndex(targetIdx);
  };

  // Photoshop PSD / PSB File Import
  const openPhotoshopFile = async (file: File | { name: string; buffer: ArrayBuffer }): Promise<boolean> => {
    try {
      const buffer = 'arrayBuffer' in file ? await file.arrayBuffer() : file.buffer;
      const parsed = await parsePhotoshopFile(buffer, file.name);

      setDocumentState((prev) => ({
        ...prev,
        title: parsed.title,
        width: parsed.width,
        height: parsed.height,
        background: parsed.background
      }));

      setLayers(parsed.layers);
      setSelectedLayerId(parsed.layers[parsed.layers.length - 1]?.id || null);
      recordHistory(parsed.layers, {
        ...documentState,
        width: parsed.width,
        height: parsed.height,
        background: parsed.background
      }, `Opened Photoshop File: ${file.name}`);

      return true;
    } catch (err) {
      console.error('Failed to parse Photoshop file:', err);
      alert(`Could not open Photoshop file: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  };

  const exportPsd = async () => {
    try {
      await exportToPhotoshopPsd(documentState, layers);
    } catch (err) {
      console.error('Failed to export PSD:', err);
      alert('Error exporting Photoshop PSD file.');
    }
  };

  // Vector / Adobe Illustrator Engine Integration
  const openVectorFile = async (
    file: File | { name: string; buffer?: ArrayBuffer; text?: string }
  ): Promise<boolean> => {
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let parsed;

      if (ext === 'ai') {
        const buffer = 'arrayBuffer' in file ? await file.arrayBuffer() : file.buffer;
        if (!buffer) throw new Error('Could not read AI file data.');
        parsed = await parseAiFileBuffer(buffer, file.name);
      } else {
        // SVG or text-based vector
        let svgText = '';
        if ('text' in file && typeof file.text === 'function') {
          svgText = await file.text();
        } else if ('text' in file && typeof file.text === 'string') {
          svgText = file.text;
        } else if ('arrayBuffer' in file) {
          const buf = await file.arrayBuffer();
          svgText = new TextDecoder('utf-8').decode(buf);
        } else if (file.buffer) {
          svgText = new TextDecoder('utf-8').decode(file.buffer);
        }
        parsed = parseSvgToLayers(svgText, documentState.width, documentState.height, file.name);
      }

      setDocumentState((prev) => ({
        ...prev,
        title: parsed.title,
        width: parsed.width,
        height: parsed.height,
        background: parsed.background
      }));
      setLayers(parsed.layers);
      setSelectedLayerId(parsed.layers[parsed.layers.length - 1]?.id || null);
      setWorkspaceMode('vector'); // Seamlessly switch into Illustrator Vector mode!
      recordHistory(
        parsed.layers,
        {
          ...documentState,
          width: parsed.width,
          height: parsed.height,
          background: parsed.background
        },
        `Opened Vector File: ${file.name}`
      );
      return true;
    } catch (err) {
      console.error('Failed to open vector file:', err);
      alert(`Could not open vector file: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  };

  const exportSvgDocument = () => {
    try {
      const svgCode = exportLayersToSvg(
        layers,
        documentState.width,
        documentState.height,
        documentState.background
      );
      const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${documentState.title.toLowerCase().replace(/\s+/g, '-')}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export SVG:', err);
      alert('Error generating SVG vector file.');
    }
  };

  const exportAiDocument = () => {
    try {
      const aiBytes = exportLayersToAi(
        layers,
        documentState.width,
        documentState.height,
        documentState.title
      );
      const blob = new Blob([aiBytes as BlobPart], { type: 'application/illustrator' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${documentState.title.toLowerCase().replace(/\s+/g, '-')}.ai`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export AI:', err);
      alert('Error generating Adobe Illustrator (.ai) file.');
    }
  };

  const copySvgCode = async (): Promise<boolean> => {
    try {
      const svgCode = exportLayersToSvg(
        layers,
        documentState.width,
        documentState.height,
        documentState.background
      );
      await navigator.clipboard.writeText(svgCode);
      return true;
    } catch (err) {
      console.error('Failed to copy SVG code:', err);
      return false;
    }
  };

  const applyPathfinder = (op: 'unite' | 'minus-front' | 'intersect' | 'exclude') => {
    const shapeLayers = layers.filter((l) => l.type === 'shape') as ShapeLayer[];
    if (shapeLayers.length < 2) {
      alert('Pathfinder requires at least 2 shape layers on the canvas.');
      return;
    }

    // Use selected layer and the one directly before/after it, or the top two shapes
    let layerA = selectedLayer && selectedLayer.type === 'shape' ? (selectedLayer as ShapeLayer) : shapeLayers[0];
    let layerB = shapeLayers.find((l) => l.id !== layerA.id) || shapeLayers[1];

    const resultShape = runPathfinder(op, layerA, layerB);
    const updatedLayers = layers
      .filter((l) => l.id !== layerA.id && l.id !== layerB.id)
      .concat(resultShape);

    setLayers(updatedLayers);
    setSelectedLayerId(resultShape.id);
    recordHistory(updatedLayers, documentState, `Pathfinder: ${op.toUpperCase()}`);
  };

  // Canvas Image Export
  const exportCanvasAsImage = (
    format: 'png' | 'jpeg' | 'webp' = 'png',
    quality = 0.95
  ): string | null => {
    if (!canvasRef.current) return null;
    return canvasRef.current.toDataURL(`image/${format}`, quality);
  };

  const downloadImage = (format: 'png' | 'jpeg' | 'webp' = 'png', quality = 0.95) => {
    const dataUrl = exportCanvasAsImage(format, quality);
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `${documentState.title.toLowerCase().replace(/\s+/g, '-')}.${format}`;
    link.href = dataUrl;
    link.click();
  };

  // Project JSON Save & Load
  const exportProjectJson = () => {
    const project = {
      version: '2.0',
      createdWith: 'Pixelcharm',
      timestamp: new Date().toISOString(),
      document: documentState,
      layers
    };

    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${documentState.title.toLowerCase().replace(/\s+/g, '-')}.pixelcharm`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importProjectJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.document && Array.isArray(parsed.layers)) {
        setDocumentState((prev) => ({ ...prev, ...parsed.document }));
        setLayers(parsed.layers);
        setSelectedLayerId(parsed.layers[parsed.layers.length - 1]?.id || null);
        recordHistory(parsed.layers, parsed.document, 'Opened Project File');
      }
    } catch (err) {
      console.error('Failed to parse project JSON:', err);
      alert('Invalid project file format.');
    }
  };

  // Listen for native Electron file associations (opening from Windows Explorer)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI?.onFileOpenedFromExplorer) {
      window.electronAPI.onFileOpenedFromExplorer(async (fileData) => {
        const ext = fileData.name.split('.').pop()?.toLowerCase();
        if (ext === 'psd' || ext === 'psb' || ext === 'psdt') {
          await openPhotoshopFile(fileData);
        } else if (ext === 'ai' || ext === 'svg' || ext === 'eps') {
          await openVectorFile(fileData);
        } else if (ext === 'pixycharm' || ext === 'anything-project' || ext === 'json') {
          const decoder = new TextDecoder('utf-8');
          const jsonStr = decoder.decode(fileData.buffer);
          importProjectJson(jsonStr);
        }
      });
    }
  }, []);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Delete: Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayerId) {
        e.preventDefault();
        deleteLayer(selectedLayerId);
        return;
      }

      // Camera Raw Filter: Ctrl+Shift+A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setShowCameraRawModal(true);
        return;
      }

      // Duplicate Layer: Ctrl+J (Photoshop Standard) or Ctrl+D
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'd') && selectedLayerId) {
        e.preventDefault();
        duplicateLayer(selectedLayerId);
        return;
      }

      // Levels: Ctrl+L
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l' && !e.shiftKey) {
        e.preventDefault();
        setShowLevelsModal(true);
        return;
      }

      // Hue/Saturation: Ctrl+U
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u' && !e.shiftKey) {
        e.preventDefault();
        setShowHueSatModal(true);
        return;
      }

      // Invert: Ctrl+I
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i' && !e.shiftKey && selectedLayer?.type === 'image') {
        e.preventDefault();
        const img = selectedLayer as ImageLayer;
        updateLayer(img.id, {
          adjustments: { ...img.adjustments, invert: img.adjustments.invert > 0 ? 0 : 100 }
        }, true, 'Invert');
        return;
      }

      // Desaturate: Ctrl+Shift+U
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'u' && selectedLayer?.type === 'image') {
        e.preventDefault();
        const img = selectedLayer as ImageLayer;
        updateLayer(img.id, {
          adjustments: { ...img.adjustments, saturation: -100, grayscale: 100 }
        }, true, 'Desaturate');
        return;
      }

      // Fit on Screen: Ctrl+0
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        fitToScreen();
        return;
      }

      // Actual Pixels 100%: Ctrl+1
      if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        resetZoom();
        return;
      }

      // Zoom In: Ctrl++ or Ctrl+=
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        zoomIn();
        return;
      }

      // Zoom Out: Ctrl+-
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        zoomOut();
        return;
      }

      // Layer ordering shortcuts
      if ((e.ctrlKey || e.metaKey) && selectedLayerId) {
        if (e.shiftKey && e.key === ']') {
          e.preventDefault();
          bringToFront(selectedLayerId);
          return;
        }
        if (e.shiftKey && e.key === '[') {
          e.preventDefault();
          sendToBack(selectedLayerId);
          return;
        }
        if (e.key === ']') {
          e.preventDefault();
          bringForward(selectedLayerId);
          return;
        }
        if (e.key === '[') {
          e.preventDefault();
          sendBackward(selectedLayerId);
          return;
        }
      }

      // Single Key Shortcuts (When not holding Ctrl/Cmd)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        // Brush size adjustments: [ and ]
        if (e.key === '[') {
          e.preventDefault();
          setBrushSize(Math.max(1, brushSize - 4));
          return;
        }
        if (e.key === ']') {
          e.preventDefault();
          setBrushSize(Math.min(100, brushSize + 4));
          return;
        }

        // Default colors: D
        if (e.key.toLowerCase() === 'd') {
          setBrushColor('#000000');
          return;
        }

        // Swap colors: X
        if (e.key.toLowerCase() === 'x') {
          setBrushColor(brushColor === '#000000' ? '#ffffff' : '#000000');
          return;
        }

        switch (e.key.toLowerCase()) {
          case 'v':
            setActiveTool('select');
            break;
          case 'h':
            setActiveTool('hand');
            break;
          case 't':
            setActiveTool('text');
            addTextLayer();
            break;
          case 'u':
            setActiveTool('shape');
            break;
          case 'b':
            setActiveTool('brush');
            break;
          case 'c':
            setActiveTool('crop');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerId, canUndo, canRedo, historyIndex]);

  return (
    <StudioContext.Provider
      value={{
        documentState,
        setDocumentState,
        setDimensions,
        setBackground,
        zoom: documentState.zoom,
        setZoom,
        zoomIn,
        zoomOut,
        resetZoom,
        fitToScreen,
        activeTool,
        setActiveTool,
        activeShapeType,
        setActiveShapeType,
        brushColor,
        setBrushColor,
        brushSize,
        setBrushSize,
        brushHardness,
        setBrushHardness,
        brushOpacity,
        setBrushOpacity,
        brushFlow,
        setBrushFlow,
        mouseCoords,
        setMouseCoords,
        layers,
        selectedLayerId,
        selectedLayer,
        setSelectedLayerId,
        updateLayer,
        addNewLayer,
        addTextLayer,
        addShapeLayer,
        addImageLayer,
        addDrawingLayer,
        duplicateLayer,
        deleteLayer,
        bringForward,
        sendBackward,
        bringToFront,
        sendToBack,
        toggleLock,
        toggleVisibility,
        loadTemplate,
        smartGuides,
        setSmartGuides,
        canUndo,
        canRedo,
        undo,
        redo,
        historyStack,
        historyIndex,
        exportCanvasAsImage,
        downloadImage,
        exportProjectJson,
        importProjectJson,
        openPhotoshopFile,
        exportPsd,
        workspaceMode,
        setWorkspaceMode,
        openVectorFile,
        exportSvgDocument,
        exportAiDocument,
        copySvgCode,
        applyPathfinder,
        showSvgEditorModal,
        setShowSvgEditorModal,
        setLayers,
        showNewDocModal,
        setShowNewDocModal,
        createNewDocument,
        showTemplatesModal,
        setShowTemplatesModal,
        showEvidenceModal,
        setShowEvidenceModal,
        showCameraRawModal,
        setShowCameraRawModal,
        showHueSatModal,
        setShowHueSatModal,
        showLevelsModal,
        setShowLevelsModal,
        canvasRef,
        containerRef
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};
