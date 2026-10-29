import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useStudio } from '../context/StudioContext';
import { Layer, ImageLayer, TextLayer, ShapeLayer, DrawingLayer, SmartGuide } from '../types';
import { buildCssFilterString } from '../engine/imageFilters';
import { BLEND_MODE_MAP } from '../engine/blendModes';
import {
  getBoundingHandles,
  calculateResize,
  HandleType,
  Point,
  Box
} from '../engine/transformMath';
import { computeSmartGuides } from '../engine/smartGuides';

export const CanvasArea: React.FC = () => {
  const {
    documentState,
    layers,
    selectedLayerId,
    selectedLayer,
    setSelectedLayerId,
    updateLayer,
    activeTool,
    setActiveTool,
    brushColor,
    brushSize,
    addDrawingLayer,
    addImageLayer,
    openPhotoshopFile,
    smartGuides,
    setSmartGuides,
    canvasRef,
    containerRef,
    setMouseCoords,
    setZoom
  } = useStudio();

  // Dragging & Interaction States
  const [isDraggingLayer, setIsDraggingLayer] = useState(false);
  const [isResizing, setIsResizing] = useState<HandleType | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const [dragStartMouse, setDragStartMouse] = useState<Point>({ x: 0, y: 0 });
  const [initialBox, setInitialBox] = useState<Box | null>(null);
  const [currentStrokePoints, setCurrentStrokePoints] = useState<Point[]>([]);

  // Spacebar panning state
  const [spacePressed, setSpacePressed] = useState(false);

  // Monitor space key for temporary Hand tool
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !spacePressed && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [spacePressed]);

  // Convert Screen/Client coords to World Canvas coords
  const screenToCanvasCoords = useCallback(
    (clientX: number, clientY: number): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    },
    [canvasRef]
  );

  // Redraw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = documentState.width;
    canvas.height = documentState.height;

    // Clear and fill background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = documentState.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw layers in order (bottom to top)
    layers.forEach((layer) => {
      if (!layer.visible) return;

      ctx.save();

      // Transform & Pivot
      const pivotX = layer.x + layer.width / 2;
      const pivotY = layer.y + layer.height / 2;
      ctx.translate(pivotX, pivotY);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.translate(-pivotX, -pivotY);

      // Blend Mode & Opacity
      ctx.globalAlpha = Math.max(0, Math.min(1, layer.opacity));
      ctx.globalCompositeOperation = BLEND_MODE_MAP[layer.blendMode] || 'source-over';

      // 1. Image Layer
      if (layer.type === 'image') {
        const img = new Image();
        img.src = layer.src;
        if (img.complete && img.naturalWidth > 0) {
          ctx.filter = buildCssFilterString(layer.adjustments);
          ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
          ctx.filter = 'none';
        }
      }

      // 2. Text Layer
      else if (layer.type === 'text') {
        ctx.font = `${layer.fontStyle === 'italic' ? 'italic ' : ''}${layer.fontWeight} ${layer.fontSize}px "${layer.fontFamily}", sans-serif`;
        ctx.textAlign = layer.align;
        ctx.textBaseline = 'top';

        // Drop shadow
        if (layer.shadowBlur > 0) {
          ctx.shadowColor = layer.shadowColor;
          ctx.shadowBlur = layer.shadowBlur;
          ctx.shadowOffsetX = layer.shadowOffsetX;
          ctx.shadowOffsetY = layer.shadowOffsetY;
        }

        const textX =
          layer.align === 'center'
            ? layer.x + layer.width / 2
            : layer.align === 'right'
            ? layer.x + layer.width
            : layer.x;

        // Stroke
        if (layer.strokeWidth > 0 && layer.strokeColor) {
          ctx.strokeStyle = layer.strokeColor;
          ctx.lineWidth = layer.strokeWidth;
          ctx.strokeText(layer.text, textX, layer.y);
        }

        // Fill
        ctx.fillStyle = layer.color;
        ctx.fillText(layer.text, textX, layer.y);
      }

      // 3. Shape Layer
      else if (layer.type === 'shape') {
        ctx.fillStyle = layer.fill;
        ctx.strokeStyle = layer.stroke;
        ctx.lineWidth = layer.strokeWidth;

        ctx.beginPath();
        if (layer.shapeType === 'rect') {
          const r = Math.min(layer.borderRadius, layer.width / 2, layer.height / 2);
          ctx.roundRect(layer.x, layer.y, layer.width, layer.height, r);
        } else if (layer.shapeType === 'circle') {
          ctx.ellipse(
            layer.x + layer.width / 2,
            layer.y + layer.height / 2,
            layer.width / 2,
            layer.height / 2,
            0,
            0,
            Math.PI * 2
          );
        } else if (layer.shapeType === 'triangle') {
          ctx.moveTo(layer.x + layer.width / 2, layer.y);
          ctx.lineTo(layer.x + layer.width, layer.y + layer.height);
          ctx.lineTo(layer.x, layer.y + layer.height);
          ctx.closePath();
        } else if (layer.shapeType === 'star') {
          const points = layer.sides || 5;
          const outerR = Math.min(layer.width, layer.height) / 2;
          const innerR = outerR * 0.45;
          const cx = layer.x + layer.width / 2;
          const cy = layer.y + layer.height / 2;

          for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (i * Math.PI) / points - Math.PI / 2;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
        }

        if (layer.fill && layer.fill !== 'transparent') ctx.fill();
        if (layer.strokeWidth > 0 && layer.stroke) ctx.stroke();
      }

      // 4. Drawing Layer
      else if (layer.type === 'drawing') {
        if (layer.points.length > 1) {
          ctx.strokeStyle = layer.color;
          ctx.lineWidth = layer.brushSize;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          ctx.beginPath();
          ctx.moveTo(layer.x + layer.points[0].x, layer.y + layer.points[0].y);
          for (let i = 1; i < layer.points.length; i++) {
            ctx.lineTo(layer.x + layer.points[i].x, layer.y + layer.points[i].y);
          }
          ctx.stroke();
        }
      }

      ctx.restore();
    });

    // Draw active drawing brush preview
    if (isDrawing && currentStrokePoints.length > 1) {
      ctx.save();
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(currentStrokePoints[0].x, currentStrokePoints[0].y);
      for (let i = 1; i < currentStrokePoints.length; i++) {
        ctx.lineTo(currentStrokePoints[i].x, currentStrokePoints[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }, [documentState, layers, isDrawing, currentStrokePoints, brushColor, brushSize]);

  // Handle Drag & Drop of Images and Photoshop PSD / PSB files
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();

      // Photoshop formats: PSD, PSB, PSDT
      if (ext === 'psd' || ext === 'psb' || ext === 'psdt') {
        openPhotoshopFile(file);
        return;
      }

      // Standard images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result as string;
          const img = new Image();
          img.onload = () => {
            addImageLayer(src, file.name.replace(/\.[^/.]+$/, ''), img.width, img.height);
          };
          img.src = src;
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Mouse Down handler
  const handleMouseDown = (e: React.MouseEvent) => {
    const pt = screenToCanvasCoords(e.clientX, e.clientY);

    // Pan tool or Spacebar
    if (activeTool === 'hand' || spacePressed || e.button === 1) {
      setIsPanning(true);
      setDragStartMouse({ x: e.clientX, y: e.clientY });
      return;
    }

    // Brush Tool
    if (activeTool === 'brush') {
      setIsDrawing(true);
      setCurrentStrokePoints([pt]);
      return;
    }

    // Direct hit test layer selection if clicked outside bounding box
    // Hit test top-most visible layer
    let clickedLayer: Layer | null = null;
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i];
      if (!l.visible || l.locked) continue;

      if (
        pt.x >= l.x &&
        pt.x <= l.x + l.width &&
        pt.y >= l.y &&
        pt.y <= l.y + l.height
      ) {
        clickedLayer = l;
        break;
      }
    }

    if (clickedLayer) {
      setSelectedLayerId(clickedLayer.id);
      setIsDraggingLayer(true);
      setDragStartMouse(pt);
      setInitialBox({
        x: clickedLayer.x,
        y: clickedLayer.y,
        width: clickedLayer.width,
        height: clickedLayer.height,
        rotation: clickedLayer.rotation
      });
    } else {
      setSelectedLayerId(null);
      setSmartGuides([]);
    }
  };

  // Mouse Move handler
  const handleMouseMove = (e: React.MouseEvent) => {
    const pt = screenToCanvasCoords(e.clientX, e.clientY);

    // Update real-time coordinates for Photoshop Status Bar
    setMouseCoords({
      x: Math.max(0, Math.min(documentState.width, Math.round(pt.x))),
      y: Math.max(0, Math.min(documentState.height, Math.round(pt.y)))
    });

    // Panning canvas
    if (isPanning) {
      const dx = e.clientX - dragStartMouse.x;
      const dy = e.clientY - dragStartMouse.y;
      // Pan container scroll
      if (containerRef.current) {
        containerRef.current.scrollLeft -= dx;
        containerRef.current.scrollTop -= dy;
      }
      setDragStartMouse({ x: e.clientX, y: e.clientY });
      return;
    }

    // Freehand Drawing
    if (isDrawing) {
      setCurrentStrokePoints((prev) => [...prev, pt]);
      return;
    }

    // Moving Layer with Smart Guides
    if (isDraggingLayer && selectedLayer && initialBox) {
      const dx = pt.x - dragStartMouse.x;
      const dy = pt.y - dragStartMouse.y;

      const rawLayer = {
        ...selectedLayer,
        x: Math.round(initialBox.x + dx),
        y: Math.round(initialBox.y + dy)
      };

      // Compute magnetic smart guides
      const snap = computeSmartGuides(
        rawLayer,
        layers,
        documentState.width,
        documentState.height
      );

      updateLayer(selectedLayer.id, { x: snap.x, y: snap.y });
      setSmartGuides(snap.guides);
      return;
    }

    // Resizing Layer
    if (isResizing && selectedLayer && initialBox) {
      const lockAspect = e.shiftKey;
      const newBounds = calculateResize(
        initialBox,
        isResizing,
        pt,
        dragStartMouse,
        lockAspect
      );
      updateLayer(selectedLayer.id, newBounds);
      return;
    }

    // Rotating Layer
    if (isRotating && selectedLayer && initialBox) {
      const pivotX = initialBox.x + initialBox.width / 2;
      const pivotY = initialBox.y + initialBox.height / 2;
      const angleRad = Math.atan2(pt.y - pivotY, pt.x - pivotX);
      let angleDeg = Math.round((angleRad * 180) / Math.PI + 90);
      if (angleDeg < 0) angleDeg += 360;

      // Snap to 45 degree increments if Shift key is held
      if (e.shiftKey) {
        angleDeg = Math.round(angleDeg / 45) * 45;
      }

      updateLayer(selectedLayer.id, { rotation: angleDeg });
      return;
    }
  };

  // Mouse Up handler
  const handleMouseUp = () => {
    if (isPanning) setIsPanning(false);

    if (isDrawing && currentStrokePoints.length > 1) {
      addDrawingLayer(currentStrokePoints, brushColor, brushSize);
      setIsDrawing(false);
      setCurrentStrokePoints([]);
    }

    if (isDraggingLayer) {
      setIsDraggingLayer(false);
      setSmartGuides([]);
      if (selectedLayer) {
        updateLayer(selectedLayer.id, {}, true, `Move ${selectedLayer.name}`);
      }
    }

    if (isResizing) {
      setIsResizing(null);
      if (selectedLayer) {
        updateLayer(selectedLayer.id, {}, true, `Resize ${selectedLayer.name}`);
      }
    }

    if (isRotating) {
      setIsRotating(false);
      if (selectedLayer) {
        updateLayer(selectedLayer.id, {}, true, `Rotate ${selectedLayer.name}`);
      }
    }
  };

  // Bounding handles for selected layer
  const transformData = selectedLayer
    ? getBoundingHandles({
        x: selectedLayer.x,
        y: selectedLayer.y,
        width: selectedLayer.width,
        height: selectedLayer.height,
        rotation: selectedLayer.rotation
      })
    : null;

  const handleWheel = (e: React.WheelEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(Math.max(0.1, Math.min(4, Number((documentState.zoom + delta).toFixed(2)))));
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setMouseCoords({ x: 0, y: 0 })}
      className={`flex-1 relative overflow-auto bg-[#262626] flex items-center justify-center p-12 select-none ${
        spacePressed || activeTool === 'hand'
          ? 'cursor-grab active:cursor-grabbing'
          : activeTool === 'brush'
          ? 'cursor-crosshair'
          : 'cursor-default'
      }`}
    >
      {/* Canvas Wrapper scaled with Zoom with iconic Photoshop checkered transparency background */}
      <div
        className="relative transition-transform duration-75 ease-out shadow-2xl shadow-black/90 border border-[#111111]"
        style={{
          width: documentState.width,
          height: documentState.height,
          transform: `scale(${documentState.zoom})`,
          transformOrigin: 'center center',
          backgroundImage: `linear-gradient(45deg, #1f1f1f 25%, transparent 25%),
            linear-gradient(-45deg, #1f1f1f 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #1f1f1f 75%),
            linear-gradient(-45deg, transparent 75%, #1f1f1f 75%)`,
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
          backgroundColor: '#2b2b2b'
        }}
      >
        {/* Main Render Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block rounded"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Canva-Style Interactive Bounding Box & Handles Overlay */}
        {selectedLayer && transformData && !selectedLayer.locked && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Bounding box outline */}
            <div
              className="absolute border-2 border-indigo-500 pointer-events-auto"
              style={{
                left: selectedLayer.x,
                top: selectedLayer.y,
                width: selectedLayer.width,
                height: selectedLayer.height,
                transform: `rotate(${selectedLayer.rotation}deg)`,
                transformOrigin: 'center center',
                cursor: 'move'
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsDraggingLayer(true);
                const pt = screenToCanvasCoords(e.clientX, e.clientY);
                setDragStartMouse(pt);
                setInitialBox({
                  x: selectedLayer.x,
                  y: selectedLayer.y,
                  width: selectedLayer.width,
                  height: selectedLayer.height,
                  rotation: selectedLayer.rotation
                });
              }}
            >
              {/* Dimensions badge */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-700 text-neutral-200 text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                {selectedLayer.width} × {selectedLayer.height}px
                {selectedLayer.rotation !== 0 && ` (${selectedLayer.rotation}°)`}
              </div>

              {/* Rotation Handle stem & circle */}
              <div
                className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsRotating(true);
                  const pt = screenToCanvasCoords(e.clientX, e.clientY);
                  setDragStartMouse(pt);
                  setInitialBox({
                    x: selectedLayer.x,
                    y: selectedLayer.y,
                    width: selectedLayer.width,
                    height: selectedLayer.height,
                    rotation: selectedLayer.rotation
                  });
                }}
              >
                <div className="w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full shadow hover:scale-125 transition-transform" />
                <div className="w-[1.5px] h-3 bg-indigo-500" />
              </div>

              {/* 8 Resize Handles */}
              {(
                [
                  { type: 'tl', style: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize' },
                  { type: 'tm', style: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize' },
                  { type: 'tr', style: 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize' },
                  { type: 'mr', style: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize' },
                  { type: 'br', style: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize' },
                  { type: 'bm', style: 'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-ns-resize' },
                  { type: 'bl', style: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize' },
                  { type: 'ml', style: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize' }
                ] as { type: HandleType; style: string }[]
              ).map(({ type, style }) => (
                <div
                  key={type}
                  className={`absolute w-3 h-3 bg-white border-2 border-indigo-600 rounded-sm shadow pointer-events-auto hover:scale-125 transition-transform ${style}`}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsResizing(type);
                    const pt = screenToCanvasCoords(e.clientX, e.clientY);
                    setDragStartMouse(pt);
                    setInitialBox({
                      x: selectedLayer.x,
                      y: selectedLayer.y,
                      width: selectedLayer.width,
                      height: selectedLayer.height,
                      rotation: selectedLayer.rotation
                    });
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Smart Guide Overlay Lines */}
        {smartGuides.map((guide, idx) => (
          <div
            key={idx}
            className={`absolute pointer-events-none z-40 ${
              guide.type === 'vertical'
                ? 'w-[1.5px] bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]'
                : 'h-[1.5px] bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]'
            }`}
            style={
              guide.type === 'vertical'
                ? { left: guide.position, top: 0, bottom: 0 }
                : { top: guide.position, left: 0, right: 0 }
            }
          >
            {guide.label && (
              <span className="absolute bg-pink-600 text-white text-[9px] font-mono px-1 py-0.5 rounded -top-4 -left-3">
                {guide.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
