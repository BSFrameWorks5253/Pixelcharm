import React from 'react';
import {
  MousePointer2,
  Paintbrush,
  Type,
  Square,
  Hand,
  AlignLeft,
  AlignCenter,
  AlignRight,
  SlidersHorizontal,
  Crop,
  Pipette,
  Stamp,
  Eraser,
  PenTool,
  Blend,
  Wand2,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { FONT_FAMILIES } from '../constants/presets';
import { TextLayer } from '../types';

export const PhotoshopOptionsBar: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
    selectedLayer,
    updateLayer,
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
    documentState,
    zoomIn,
    zoomOut,
    fitToScreen,
    resetZoom
  } = useStudio();

  // Local mock states for contextual settings
  const [sampleSize, setSampleSize] = React.useState('Point Sample');
  const [tolerance, setTolerance] = React.useState(32);
  const [feather, setFeather] = React.useState(0);
  const [eraserMode, setEraserMode] = React.useState('Brush');
  const [gradientType, setGradientType] = React.useState<'linear' | 'radial' | 'angle' | 'reflected' | 'diamond'>('linear');

  const isMoveTool = activeTool === 'select' || activeTool === 'move';

  return (
    <div className="h-8 bg-[#262626] text-[#cccccc] text-[11px] flex items-center justify-between px-3 border-b border-[#111111] z-40 select-none font-sans overflow-x-auto">
      {/* Tool Context Controls */}
      <div className="flex items-center gap-3">
        {/* Active Tool Icon Indicator */}
        <div className="flex items-center gap-1.5 pr-2 border-r border-[#3a3a3a] text-white">
          {isMoveTool && <MousePointer2 className="w-3.5 h-3.5 text-[#00a4e4]" />}
          {activeTool === 'marquee' && <div className="w-3 h-3 border border-dashed border-[#00a4e4]" />}
          {activeTool === 'lasso' && <span className="text-[#00a4e4] font-bold text-xs">☡</span>}
          {activeTool === 'magic-wand' && <Wand2 className="w-3.5 h-3.5 text-[#00a4e4]" />}
          {activeTool === 'crop' && <Crop className="w-3.5 h-3.5 text-[#00a4e4]" />}
          {activeTool === 'eyedropper' && <Pipette className="w-3.5 h-3.5 text-[#00a4e4]" />}
          {activeTool === 'brush' && <Paintbrush className="w-3.5 h-3.5 text-[#00a4e4]" />}
          {activeTool === 'clone-stamp' && <Stamp className="w-3.5 h-3.5 text-[#00a4e4]" />}
          {activeTool === 'eraser' && <Eraser className="w-3.5 h-3.5 text-[#00a4e4]" />}
          {activeTool === 'gradient' && <Blend className="w-3.5 h-3.5 text-[#00a4e4]" />}
          {activeTool === 'pen' && <PenTool className="w-3.5 h-3.5 text-[#00a4e4]" />}
          {activeTool === 'text' && <Type className="w-3.5 h-3.5 text-[#00a4e4]" />}
          {activeTool === 'path-selection' && <MousePointer2 className="w-3.5 h-3.5 text-[#00a4e4] fill-current" />}
          {activeTool === 'shape' && <Square className="w-3.5 h-3.5 text-[#00a4e4]" />}
          {activeTool === 'hand' && <Hand className="w-3.5 h-3.5 text-[#00a4e4]" />}
          {activeTool === 'zoom' && <ZoomIn className="w-3.5 h-3.5 text-[#00a4e4]" />}
        </div>

        {/* 1. MOVE TOOL OPTIONS */}
        {isMoveTool && (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-[#00a4e4] w-3 h-3 rounded" />
              <span className="text-[#aaaaaa]">Auto-Select:</span>
              <span className="font-semibold text-white">Layer</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-[#00a4e4] w-3 h-3 rounded" />
              <span className="text-[#aaaaaa]">Show Transform Controls</span>
            </label>

            <div className="h-4 w-[1px] bg-[#3a3a3a]" />

            {/* Photoshop Layer Alignment Buttons */}
            {selectedLayer && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateLayer(selectedLayer.id, { x: 0 }, true, 'Align Left')}
                  className="p-1 hover:bg-[#323232] rounded text-[#aaaaaa] hover:text-white"
                  title="Align Left Edges"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() =>
                    updateLayer(
                      selectedLayer.id,
                      { x: Math.round(documentState.width / 2 - selectedLayer.width / 2) },
                      true,
                      'Align Horizontal Center'
                    )
                  }
                  className="p-1 hover:bg-[#323232] rounded text-[#aaaaaa] hover:text-white"
                  title="Align Horizontal Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() =>
                    updateLayer(
                      selectedLayer.id,
                      { x: documentState.width - selectedLayer.width },
                      true,
                      'Align Right'
                    )
                  }
                  className="p-1 hover:bg-[#323232] rounded text-[#aaaaaa] hover:text-white"
                  title="Align Right Edges"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() =>
                    updateLayer(
                      selectedLayer.id,
                      { y: Math.round(documentState.height / 2 - selectedLayer.height / 2) },
                      true,
                      'Align Vertical Center'
                    )
                  }
                  className="p-1 hover:bg-[#323232] rounded text-[#aaaaaa] hover:text-white"
                  title="Align Vertical Centers"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. BRUSH TOOL OPTIONS (Size, Hardness, Opacity, Flow sliders) */}
        {activeTool === 'brush' && (
          <div className="flex items-center gap-3.5">
            {/* Brush Size Slider */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#aaaaaa]">Size:</span>
              <input
                type="range"
                min="1"
                max="100"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-16 h-1 bg-[#1a1a1a] rounded accent-[#00a4e4] cursor-pointer"
              />
              <span className="font-mono text-white text-[10px] w-7">{brushSize}px</span>
            </div>

            <div className="h-4 w-[1px] bg-[#3a3a3a]" />

            {/* Brush Hardness Slider */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#aaaaaa]">Hardness:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={brushHardness}
                onChange={(e) => setBrushHardness(Number(e.target.value))}
                className="w-16 h-1 bg-[#1a1a1a] rounded accent-[#00a4e4] cursor-pointer"
              />
              <span className="font-mono text-white text-[10px] w-8">{brushHardness}%</span>
            </div>

            <div className="h-4 w-[1px] bg-[#3a3a3a]" />

            {/* Brush Opacity Slider */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#aaaaaa]">Opacity:</span>
              <input
                type="range"
                min="1"
                max="100"
                value={brushOpacity}
                onChange={(e) => setBrushOpacity(Number(e.target.value))}
                className="w-16 h-1 bg-[#1a1a1a] rounded accent-[#00a4e4] cursor-pointer"
              />
              <span className="font-mono text-white text-[10px] w-8">{brushOpacity}%</span>
            </div>

            <div className="h-4 w-[1px] bg-[#3a3a3a]" />

            {/* Brush Flow Slider */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#aaaaaa]">Flow:</span>
              <input
                type="range"
                min="1"
                max="100"
                value={brushFlow}
                onChange={(e) => setBrushFlow(Number(e.target.value))}
                className="w-16 h-1 bg-[#1a1a1a] rounded accent-[#00a4e4] cursor-pointer"
              />
              <span className="font-mono text-white text-[10px] w-8">{brushFlow}%</span>
            </div>

            <div className="h-4 w-[1px] bg-[#3a3a3a]" />

            {/* Color Swatch */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#aaaaaa]">Color:</span>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-5 h-5 rounded border border-[#555555] bg-transparent cursor-pointer p-0"
              />
            </div>
          </div>
        )}

        {/* 3. MARQUEE & LASSO OPTIONS */}
        {(activeTool === 'marquee' || activeTool === 'lasso') && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#1e1e1e] p-0.5 rounded border border-[#383838]">
              <button className="px-1.5 py-0.5 bg-[#323232] text-white rounded text-[10px]" title="New Selection">New</button>
              <button className="px-1.5 py-0.5 text-[#888888] hover:text-white text-[10px]" title="Add to Selection">Add</button>
              <button className="px-1.5 py-0.5 text-[#888888] hover:text-white text-[10px]" title="Subtract from Selection">Subtract</button>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#aaaaaa]">Feather:</span>
              <input
                type="number"
                value={feather}
                onChange={(e) => setFeather(Number(e.target.value))}
                className="w-10 bg-[#1e1e1e] border border-[#383838] px-1 text-white font-mono text-right"
              />
              <span className="text-[#888888]">px</span>
            </div>
            <label className="flex items-center gap-1 cursor-pointer text-[#aaaaaa]">
              <input type="checkbox" defaultChecked className="accent-[#00a4e4] w-3 h-3" />
              <span>Anti-alias</span>
            </label>
          </div>
        )}

        {/* 4. MAGIC WAND OPTIONS */}
        {activeTool === 'magic-wand' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[#aaaaaa]">Tolerance:</span>
              <input
                type="number"
                min="0"
                max="255"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-12 bg-[#1e1e1e] border border-[#383838] px-1 text-white font-mono text-right"
              />
            </div>
            <label className="flex items-center gap-1 cursor-pointer text-[#aaaaaa]">
              <input type="checkbox" defaultChecked className="accent-[#00a4e4] w-3 h-3" />
              <span>Anti-alias</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer text-[#aaaaaa]">
              <input type="checkbox" defaultChecked className="accent-[#00a4e4] w-3 h-3" />
              <span>Contiguous</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer text-[#aaaaaa]">
              <input type="checkbox" defaultChecked className="accent-[#00a4e4] w-3 h-3" />
              <span>Sample All Layers</span>
            </label>
          </div>
        )}

        {/* 5. CROP OPTIONS */}
        {activeTool === 'crop' && (
          <div className="flex items-center gap-3">
            <span className="text-[#aaaaaa]">Ratio:</span>
            <select className="bg-[#1e1e1e] border border-[#383838] text-white px-2 py-0.5 rounded text-[11px] focus:outline-none">
              <option>Original Ratio</option>
              <option>1:1 (Square)</option>
              <option>16:9 (Widescreen)</option>
              <option>4:5 (Instagram)</option>
            </select>
            <label className="flex items-center gap-1 cursor-pointer text-[#aaaaaa]">
              <input type="checkbox" defaultChecked className="accent-[#00a4e4] w-3 h-3" />
              <span>Delete Cropped Pixels</span>
            </label>
          </div>
        )}

        {/* 6. EYEDROPPER OPTIONS */}
        {activeTool === 'eyedropper' && (
          <div className="flex items-center gap-3">
            <span className="text-[#aaaaaa]">Sample Size:</span>
            <select
              value={sampleSize}
              onChange={(e) => setSampleSize(e.target.value)}
              className="bg-[#1e1e1e] border border-[#383838] text-white px-2 py-0.5 rounded text-[11px] focus:outline-none"
            >
              <option>Point Sample</option>
              <option>3 by 3 Average</option>
              <option>5 by 5 Average</option>
            </select>
            <span className="text-[#aaaaaa]">Sample:</span>
            <span className="bg-[#1e1e1e] px-2 py-0.5 rounded border border-[#383838] text-white">All Layers</span>
          </div>
        )}

        {/* 7. CLONE STAMP & ERASER OPTIONS */}
        {(activeTool === 'clone-stamp' || activeTool === 'eraser') && (
          <div className="flex items-center gap-3">
            {activeTool === 'eraser' && (
              <div className="flex items-center gap-1">
                <span className="text-[#aaaaaa]">Mode:</span>
                <select
                  value={eraserMode}
                  onChange={(e) => setEraserMode(e.target.value)}
                  className="bg-[#1e1e1e] border border-[#383838] text-white px-2 py-0.5 rounded text-[11px]"
                >
                  <option>Brush</option>
                  <option>Pencil</option>
                  <option>Block</option>
                </select>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-[#aaaaaa]">Size:</span>
              <input
                type="range"
                min="1"
                max="80"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-16 h-1 bg-[#1a1a1a] rounded accent-[#00a4e4] cursor-pointer"
              />
              <span className="font-mono text-white text-[10px] w-6">{brushSize}px</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#aaaaaa]">Opacity:</span>
              <span className="font-mono text-white text-[10px]">100%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#aaaaaa]">Flow:</span>
              <span className="font-mono text-white text-[10px]">100%</span>
            </div>
          </div>
        )}

        {/* 8. GRADIENT TOOL OPTIONS */}
        {activeTool === 'gradient' && (
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-4 border border-[#444444] rounded-sm cursor-pointer shadow-inner"
              style={{ background: 'linear-gradient(to right, #00f5ff, #a855f7, #ec4899)' }}
              title="Click to edit gradient"
            />
            <div className="flex items-center gap-1 bg-[#1e1e1e] p-0.5 rounded border border-[#383838]">
              {(['linear', 'radial', 'angle', 'reflected', 'diamond'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setGradientType(type)}
                  className={`px-1.5 py-0.5 capitalize text-[10px] rounded ${
                    gradientType === type ? 'bg-[#323232] text-white' : 'text-[#888888] hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-1 cursor-pointer text-[#aaaaaa]">
              <input type="checkbox" defaultChecked className="accent-[#00a4e4] w-3 h-3" />
              <span>Reverse</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer text-[#aaaaaa]">
              <input type="checkbox" defaultChecked className="accent-[#00a4e4] w-3 h-3" />
              <span>Dither</span>
            </label>
          </div>
        )}

        {/* 9. PEN TOOL OPTIONS */}
        {activeTool === 'pen' && (
          <div className="flex items-center gap-3">
            <span className="text-[#aaaaaa]">Mode:</span>
            <select className="bg-[#1e1e1e] border border-[#383838] text-white px-2 py-0.5 rounded text-[11px]">
              <option>Shape</option>
              <option>Path</option>
              <option>Pixels</option>
            </select>
            <span className="text-[#aaaaaa]">Fill:</span>
            <div className="w-4 h-4 bg-[#6366f1] border border-[#555555] rounded-sm cursor-pointer" />
            <span className="text-[#aaaaaa]">Stroke:</span>
            <div className="w-4 h-4 bg-transparent border border-[#555555] rounded-sm cursor-pointer" />
          </div>
        )}

        {/* 10. TEXT TOOL OPTIONS */}
        {activeTool === 'text' && (
          <div className="flex items-center gap-3">
            {selectedLayer && selectedLayer.type === 'text' ? (
              <>
                <select
                  value={(selectedLayer as TextLayer).fontFamily}
                  onChange={(e) => updateLayer(selectedLayer.id, { fontFamily: e.target.value })}
                  className="bg-[#1e1e1e] border border-[#383838] text-white px-2 py-0.5 rounded text-[11px] focus:outline-none"
                >
                  {FONT_FAMILIES.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1">
                  <span className="text-[#aaaaaa]">pt:</span>
                  <input
                    type="number"
                    min="8"
                    max="144"
                    value={(selectedLayer as TextLayer).fontSize}
                    onChange={(e) => updateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })}
                    className="w-12 bg-[#1e1e1e] border border-[#383838] px-1 text-white font-mono text-right"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[#aaaaaa]">Color:</span>
                  <input
                    type="color"
                    value={(selectedLayer as TextLayer).color}
                    onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                    className="w-5 h-5 rounded border border-[#555555] bg-transparent cursor-pointer p-0"
                  />
                </div>
              </>
            ) : (
              <span className="text-[#888888]">Click on canvas or add text to edit typographic attributes</span>
            )}
          </div>
        )}

        {/* 11. HAND & ZOOM OPTIONS */}
        {(activeTool === 'hand' || activeTool === 'zoom') && (
          <div className="flex items-center gap-2">
            <button
              onClick={zoomIn}
              className="px-2 py-0.5 bg-[#1e1e1e] hover:bg-[#323232] border border-[#383838] text-white rounded text-[10px] flex items-center gap-1"
            >
              <ZoomIn className="w-3 h-3 text-[#00a4e4]" />
              <span>Zoom In</span>
            </button>
            <button
              onClick={zoomOut}
              className="px-2 py-0.5 bg-[#1e1e1e] hover:bg-[#323232] border border-[#383838] text-white rounded text-[10px] flex items-center gap-1"
            >
              <ZoomOut className="w-3 h-3 text-[#00a4e4]" />
              <span>Zoom Out</span>
            </button>
            <button
              onClick={resetZoom}
              className="px-2 py-0.5 bg-[#1e1e1e] hover:bg-[#323232] border border-[#383838] text-white rounded text-[10px]"
            >
              100% Actual
            </button>
            <button
              onClick={fitToScreen}
              className="px-2 py-0.5 bg-[#1e1e1e] hover:bg-[#323232] border border-[#383838] text-white rounded text-[10px] flex items-center gap-1"
            >
              <Maximize2 className="w-3 h-3 text-[#00a4e4]" />
              <span>Fit on Screen</span>
            </button>
          </div>
        )}
      </div>

      {/* Right side info: Document resolution preview */}
      <div className="text-[10px] text-[#888888] font-mono pr-2 flex items-center gap-2">
        <span className="bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#333333]">RGB/8</span>
        <span>{documentState.width} × {documentState.height}</span>
      </div>
    </div>
  );
};
