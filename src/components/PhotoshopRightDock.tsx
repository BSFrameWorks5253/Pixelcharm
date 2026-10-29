import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Plus,
  Type,
  Square,
  Image as ImageIcon,
  Paintbrush,
  History,
  Layers as LayersIcon,
  Palette,
  Sliders,
  Check,
  FolderPlus,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Flame,
  Blend,
  Maximize2,
  ChevronUp,
  ChevronDown,
  Layers,
  CircleDot,
  Code,
  Shapes,
  Component,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { BLEND_MODE_LABELS } from '../engine/blendModes';
import { BlendMode, Layer, ShapeLayer } from '../types';

export const PhotoshopRightDock: React.FC = () => {
  const {
    layers,
    selectedLayerId,
    selectedLayer,
    setSelectedLayerId,
    updateLayer,
    deleteLayer,
    duplicateLayer,
    addNewLayer,
    toggleLock,
    toggleVisibility,
    historyStack,
    historyIndex,
    brushColor,
    setBrushColor,
    setShowCameraRawModal,
    setShowHueSatModal,
    setShowLevelsModal,
    bringForward,
    sendBackward,
    applyPathfinder,
    setShowSvgEditorModal,
    workspaceMode,
    exportSvgDocument,
    exportAiDocument,
    copySvgCode
  } = useStudio();

  // Top Section Tab (Color vs Swatches)
  const [topTab, setTopTab] = useState<'color' | 'swatches'>('color');

  // Middle Section Tab (Adjustments vs Properties vs History vs Pathfinder)
  const [middleTab, setMiddleTab] = useState<'adjustments' | 'properties' | 'history' | 'pathfinder'>('properties');

  // Bottom Section Tab (Layers vs Channels vs Paths)
  const [bottomTab, setBottomTab] = useState<'layers' | 'channels' | 'paths'>('layers');

  // Layers Filter by Kind
  const [layerFilter, setLayerFilter] = useState<'all' | 'image' | 'text' | 'shape' | 'drawing'>('all');

  // Swatches palette matrix
  const SWATCHES = [
    '#000000', '#ffffff', '#555555', '#aaaaaa',
    '#800000', '#ff0000', '#ff7f00', '#ffff00',
    '#008000', '#00ff00', '#00ffff', '#0000ff',
    '#4b0082', '#ee82ee', '#800080', '#ff1493',
    '#00f5ff', '#6366f1', '#a855f7', '#ec4899',
    '#10b981', '#f59e0b', '#3b82f6', '#1e293b'
  ];

  // List top layer first (Photoshop standard)
  const displayLayers = [...layers].reverse().filter((l) => {
    if (layerFilter === 'all') return true;
    return l.type === layerFilter;
  });

  return (
    <div className="w-80 bg-[#1e1e1e] border-l border-[#111111] flex flex-col h-full text-[#cccccc] text-[11px] select-none z-30 font-sans">
      {/* ======================================================== */}
      {/* 1. TOP PANEL GROUP: COLOR / SWATCHES                     */}
      {/* ======================================================== */}
      <div className="flex flex-col border-b border-[#111111] bg-[#1e1e1e]">
        {/* Panel Tabs Header */}
        <div className="h-7 bg-[#262626] border-b border-[#111111] flex items-center justify-between px-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTopTab('color')}
              className={`px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase transition-colors rounded-t ${
                topTab === 'color'
                  ? 'bg-[#1e1e1e] text-white border-t border-l border-r border-[#3a3a3a]'
                  : 'text-[#888888] hover:text-[#cccccc]'
              }`}
            >
              Color
            </button>
            <button
              onClick={() => setTopTab('swatches')}
              className={`px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase transition-colors rounded-t ${
                topTab === 'swatches'
                  ? 'bg-[#1e1e1e] text-white border-t border-l border-r border-[#3a3a3a]'
                  : 'text-[#888888] hover:text-[#cccccc]'
              }`}
            >
              Swatches
            </button>
          </div>
          <Palette className="w-3.5 h-3.5 text-[#666666]" />
        </div>

        {/* Panel Body */}
        <div className="p-2.5 bg-[#1e1e1e]">
          {topTab === 'color' ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                {/* Visual Color Picker Swatch */}
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-10 h-10 rounded border border-[#3a3a3a] bg-transparent cursor-pointer p-0 shadow-sm"
                  title="Click to open color picker"
                />
                <div className="flex-1 flex flex-col gap-1 font-mono text-[10px]">
                  <div className="flex items-center justify-between text-[#888888]">
                    <span>HEX</span>
                    <input
                      type="text"
                      value={brushColor.toUpperCase()}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="w-20 bg-[#262626] border border-[#333333] px-1 text-right text-white focus:outline-none rounded-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Visual Hue Spectrum Ramp */}
              <div
                className="w-full h-3.5 rounded-sm border border-[#333333] cursor-pointer shadow-inner"
                style={{
                  background:
                    'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                }}
              />
            </div>
          ) : (
            /* Swatches Visual Matrix */
            <div className="grid grid-cols-8 gap-1 p-1 bg-[#262626] border border-[#333333] rounded-sm">
              {SWATCHES.map((color) => (
                <button
                  key={color}
                  onClick={() => setBrushColor(color)}
                  className={`w-6 h-6 border rounded-xs hover:scale-110 transition-transform ${
                    brushColor.toLowerCase() === color.toLowerCase()
                      ? 'border-[#00a4e4] ring-1 ring-[#00a4e4]'
                      : 'border-[#111111]'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MIDDLE PANEL GROUP: PROPERTIES / ADJUSTMENTS / HISTORY */}
      {/* ======================================================== */}
      <div className="flex flex-col border-b border-[#111111] bg-[#1e1e1e] h-48">
        {/* Panel Tabs Header */}
        <div className="h-7 bg-[#262626] border-b border-[#111111] flex items-center justify-between px-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMiddleTab('properties')}
              className={`px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase transition-colors rounded-t ${
                middleTab === 'properties'
                  ? 'bg-[#1e1e1e] text-white border-t border-l border-r border-[#3a3a3a]'
                  : 'text-[#888888] hover:text-[#cccccc]'
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => setMiddleTab('adjustments')}
              className={`px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase transition-colors rounded-t ${
                middleTab === 'adjustments'
                  ? 'bg-[#1e1e1e] text-white border-t border-l border-r border-[#3a3a3a]'
                  : 'text-[#888888] hover:text-[#cccccc]'
              }`}
            >
              Adjustments
            </button>
            <button
              onClick={() => setMiddleTab('history')}
              className={`px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase transition-colors rounded-t ${
                middleTab === 'history'
                  ? 'bg-[#1e1e1e] text-white border-t border-l border-r border-[#3a3a3a]'
                  : 'text-[#888888] hover:text-[#cccccc]'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setMiddleTab('pathfinder')}
              className={`px-2 py-1 text-[10px] font-semibold tracking-wider uppercase transition-colors rounded-t flex items-center gap-1 ${
                middleTab === 'pathfinder'
                  ? 'bg-[#1e1e1e] text-[#ff9a00] border-t border-l border-r border-[#3a3a3a]'
                  : 'text-[#888888] hover:text-[#ff9a00]'
              }`}
            >
              <span>Pathfinder</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff9a00]" />
            </button>
          </div>
          {middleTab === 'properties' && <Sliders className="w-3.5 h-3.5 text-[#666666]" />}
          {middleTab === 'adjustments' && <Sparkles className="w-3.5 h-3.5 text-[#666666]" />}
          {middleTab === 'history' && <History className="w-3.5 h-3.5 text-[#666666]" />}
          {middleTab === 'pathfinder' && <Shapes className="w-3.5 h-3.5 text-[#ff9a00]" />}
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto p-2 bg-[#1e1e1e]">
          {/* PROPERTIES TAB */}
          {middleTab === 'properties' && (
            selectedLayer ? (
              <div className="flex flex-col gap-2.5">
                {/* Transform Summary */}
                <div className="bg-[#242424] p-2 rounded border border-[#2e2e2e]">
                  <div className="text-[10px] uppercase font-semibold text-[#888888] mb-1.5 flex items-center justify-between">
                    <span>Transform</span>
                    <span className="text-[#00a4e4] font-mono">{selectedLayer.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                    <div className="flex items-center justify-between bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#333333]">
                      <span className="text-[#888888]">W:</span>
                      <input
                        type="number"
                        value={selectedLayer.width}
                        onChange={(e) => updateLayer(selectedLayer.id, { width: Math.max(10, Number(e.target.value)) })}
                        className="w-12 bg-transparent text-right text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#333333]">
                      <span className="text-[#888888]">H:</span>
                      <input
                        type="number"
                        value={selectedLayer.height}
                        onChange={(e) => updateLayer(selectedLayer.id, { height: Math.max(10, Number(e.target.value)) })}
                        className="w-12 bg-transparent text-right text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#333333]">
                      <span className="text-[#888888]">X:</span>
                      <input
                        type="number"
                        value={selectedLayer.x}
                        onChange={(e) => updateLayer(selectedLayer.id, { x: Number(e.target.value) })}
                        className="w-12 bg-transparent text-right text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#333333]">
                      <span className="text-[#888888]">Y:</span>
                      <input
                        type="number"
                        value={selectedLayer.y}
                        onChange={(e) => updateLayer(selectedLayer.id, { y: Number(e.target.value) })}
                        className="w-12 bg-transparent text-right text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Layer Properties */}
                {selectedLayer.type === 'text' && (
                  <div className="bg-[#242424] p-2 rounded border border-[#2e2e2e] flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-semibold text-[#888888]">Typography</span>
                    <input
                      type="text"
                      value={selectedLayer.text}
                      onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
                      className="bg-[#1e1e1e] border border-[#333333] px-2 py-1 rounded text-white text-[11px] focus:outline-none focus:border-[#00a4e4]"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[#888888]">Font Size</span>
                      <div className="flex items-center gap-1 font-mono">
                        <input
                          type="number"
                          value={selectedLayer.fontSize}
                          onChange={(e) => updateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })}
                          className="w-14 bg-[#1e1e1e] border border-[#333333] px-1 py-0.5 text-right text-white rounded"
                        />
                        <span className="text-[#666666]">pt</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shape Layer Properties */}
                {selectedLayer.type === 'shape' && (
                  <div className="bg-[#242424] p-2 rounded border border-[#2e2e2e] flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-semibold text-[#888888]">Appearance</span>
                    <div className="flex items-center justify-between">
                      <span className="text-[#888888]">Fill Color</span>
                      <input
                        type="color"
                        value={selectedLayer.fill}
                        onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.value })}
                        className="w-6 h-6 rounded border border-[#333333] cursor-pointer bg-transparent p-0"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#888888]">Corner Radius</span>
                      <input
                        type="number"
                        value={selectedLayer.borderRadius}
                        onChange={(e) => updateLayer(selectedLayer.id, { borderRadius: Number(e.target.value) })}
                        className="w-14 bg-[#1e1e1e] border border-[#333333] px-1 py-0.5 text-right text-white rounded font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[#666666] text-center p-4">
                No layer selected. Click any layer to edit properties.
              </div>
            )
          )}

          {/* ADJUSTMENTS TAB (1-Click Photoshop Filters) */}
          {middleTab === 'adjustments' && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-semibold text-[#888888]">
                Adjustment Presets
              </span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setShowLevelsModal(true)}
                  className="flex flex-col items-center justify-center gap-1 p-2 bg-[#252525] hover:bg-[#323232] border border-[#333333] rounded transition-colors"
                  title="Levels (Ctrl+L)"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#00a4e4]" />
                  <span className="text-[9px] text-[#aaaaaa]">Levels</span>
                </button>
                <button
                  onClick={() => setShowHueSatModal(true)}
                  className="flex flex-col items-center justify-center gap-1 p-2 bg-[#252525] hover:bg-[#323232] border border-[#333333] rounded transition-colors"
                  title="Hue/Saturation (Ctrl+U)"
                >
                  <Palette className="w-4 h-4 text-[#ec4899]" />
                  <span className="text-[9px] text-[#aaaaaa]">Hue/Sat</span>
                </button>
                <button
                  onClick={() => setShowCameraRawModal(true)}
                  className="flex flex-col items-center justify-center gap-1 p-2 bg-[#252525] hover:bg-[#323232] border border-[#333333] rounded transition-colors"
                  title="Camera Raw Filter (Shift+Ctrl+A)"
                >
                  <Sun className="w-4 h-4 text-[#f59e0b]" />
                  <span className="text-[9px] text-[#aaaaaa]">Camera Raw</span>
                </button>
                <button
                  onClick={() => {
                    if (selectedLayer && selectedLayer.type === 'image') {
                      updateLayer(selectedLayer.id, {
                        adjustments: { ...selectedLayer.adjustments, grayscale: selectedLayer.adjustments.grayscale > 0 ? 0 : 100 }
                      }, true, 'Toggle Black & White');
                    }
                  }}
                  className="flex flex-col items-center justify-center gap-1 p-2 bg-[#252525] hover:bg-[#323232] border border-[#333333] rounded transition-colors"
                  title="Black & White"
                >
                  <CircleDot className="w-4 h-4 text-[#ffffff]" />
                  <span className="text-[9px] text-[#aaaaaa]">B & W</span>
                </button>
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {middleTab === 'history' && (
            <div className="flex flex-col gap-0.5">
              <div className="px-2 py-1 text-[10px] text-[#888888] font-semibold border-b border-[#2e2e2e] mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-3 h-3 text-[#00a4e4]" />
                <span>Pixelcharm Masterpiece (Snapshot)</span>
              </div>
              {historyStack.slice(-10).map((item, idx) => {
                const isCurrent = idx === Math.min(historyIndex, 9);
                return (
                  <div
                    key={item.id}
                    className={`px-2 py-1 flex items-center justify-between text-[10px] rounded-xs transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-[#323232] text-white font-medium border border-[#444444]'
                        : 'text-[#888888] hover:bg-[#262626] hover:text-[#cccccc]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <History className="w-2.5 h-2.5 text-[#00a4e4]" />
                      <span className="truncate">{item.description}</span>
                    </div>
                    {isCurrent && <Check className="w-2.5 h-2.5 text-[#00a4e4]" />}
                  </div>
                );
              })}
            </div>
          )}

          {/* PATHFINDER & VECTOR TAB (Adobe Illustrator Suite) */}
          {middleTab === 'pathfinder' && (
            <div className="flex flex-col gap-2.5">
              {/* Shape Modes (Pathfinder) */}
              <div className="bg-[#242424] p-2 rounded border border-[#2e2e2e]">
                <div className="text-[10px] uppercase font-semibold text-[#888888] mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#ff9a00]">
                    <span className="w-3.5 h-3.5 rounded bg-[#ff9a00] text-black font-black text-[7px] flex items-center justify-center">Ai</span>
                    Shape Modes (Pathfinder)
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => applyPathfinder('unite')}
                    className="flex flex-col items-center justify-center p-1.5 bg-[#1e1e1e] hover:bg-[#333333] border border-[#3a3a3a] rounded text-[9px] text-[#cccccc] hover:text-[#ff9a00] transition-colors"
                    title="Unite: Merge overlapping shapes into one continuous vector"
                  >
                    <span className="text-[14px] font-bold">⊞</span>
                    <span className="mt-0.5">Unite</span>
                  </button>
                  <button
                    onClick={() => applyPathfinder('minus-front')}
                    className="flex flex-col items-center justify-center p-1.5 bg-[#1e1e1e] hover:bg-[#333333] border border-[#3a3a3a] rounded text-[9px] text-[#cccccc] hover:text-[#ff9a00] transition-colors"
                    title="Minus Front: Cut out front shape from the shape beneath"
                  >
                    <span className="text-[14px] font-bold">⊟</span>
                    <span className="mt-0.5">Minus</span>
                  </button>
                  <button
                    onClick={() => applyPathfinder('intersect')}
                    className="flex flex-col items-center justify-center p-1.5 bg-[#1e1e1e] hover:bg-[#333333] border border-[#3a3a3a] rounded text-[9px] text-[#cccccc] hover:text-[#ff9a00] transition-colors"
                    title="Intersect: Retain only the intersecting region"
                  >
                    <span className="text-[14px] font-bold">⊠</span>
                    <span className="mt-0.5">Intersect</span>
                  </button>
                  <button
                    onClick={() => applyPathfinder('exclude')}
                    className="flex flex-col items-center justify-center p-1.5 bg-[#1e1e1e] hover:bg-[#333333] border border-[#3a3a3a] rounded text-[9px] text-[#cccccc] hover:text-[#ff9a00] transition-colors"
                    title="Exclude: Remove intersecting overlap (evenodd)"
                  >
                    <span className="text-[14px] font-bold">⊘</span>
                    <span className="mt-0.5">Exclude</span>
                  </button>
                </div>
              </div>

              {/* Vector Align & Distribute */}
              <div className="bg-[#242424] p-2 rounded border border-[#2e2e2e]">
                <div className="text-[10px] uppercase font-semibold text-[#888888] mb-2 flex items-center justify-between">
                  <span>Align & Distribute</span>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  <button
                    onClick={() => {
                      if (selectedLayer) updateLayer(selectedLayer.id, { x: 0 });
                    }}
                    className="p-1.5 bg-[#1e1e1e] hover:bg-[#333333] border border-[#333333] rounded flex items-center justify-center text-[#aaaaaa] hover:text-white"
                    title="Align Left"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (selectedLayer) updateLayer(selectedLayer.id, { x: Math.round((1200 - selectedLayer.width) / 2) });
                    }}
                    className="p-1.5 bg-[#1e1e1e] hover:bg-[#333333] border border-[#333333] rounded flex items-center justify-center text-[#aaaaaa] hover:text-white"
                    title="Align Horizontal Center"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (selectedLayer) updateLayer(selectedLayer.id, { x: 1200 - selectedLayer.width });
                    }}
                    className="p-1.5 bg-[#1e1e1e] hover:bg-[#333333] border border-[#333333] rounded flex items-center justify-center text-[#aaaaaa] hover:text-white"
                    title="Align Right"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (selectedLayer) updateLayer(selectedLayer.id, { y: 0 });
                    }}
                    className="p-1.5 bg-[#1e1e1e] hover:bg-[#333333] border border-[#333333] rounded flex items-center justify-center text-[#aaaaaa] hover:text-white"
                    title="Align Top"
                  >
                    <AlignHorizontalJustifyCenter className="w-3.5 h-3.5 rotate-90" />
                  </button>
                  <button
                    onClick={() => {
                      if (selectedLayer) updateLayer(selectedLayer.id, { y: Math.round((720 - selectedLayer.height) / 2) });
                    }}
                    className="p-1.5 bg-[#1e1e1e] hover:bg-[#333333] border border-[#333333] rounded flex items-center justify-center text-[#aaaaaa] hover:text-white"
                    title="Align Vertical Center"
                  >
                    <AlignVerticalJustifyCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (selectedLayer) updateLayer(selectedLayer.id, { y: 720 - selectedLayer.height });
                    }}
                    className="p-1.5 bg-[#1e1e1e] hover:bg-[#333333] border border-[#333333] rounded flex items-center justify-center text-[#aaaaaa] hover:text-white"
                    title="Align Bottom"
                  >
                    <AlignHorizontalJustifyCenter className="w-3.5 h-3.5 -rotate-90" />
                  </button>
                </div>
              </div>

              {/* Vector Stroke & Appearance */}
              {selectedLayer && selectedLayer.type === 'shape' && (
                <div className="bg-[#242424] p-2 rounded border border-[#2e2e2e] flex flex-col gap-2">
                  <div className="text-[10px] uppercase font-semibold text-[#888888] flex items-center justify-between">
                    <span>Vector Stroke & Dash</span>
                    <span className="text-[#ff9a00] font-mono">{(selectedLayer as ShapeLayer).strokeWidth} pt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={32}
                      value={(selectedLayer as ShapeLayer).strokeWidth || 0}
                      onChange={(e) => updateLayer(selectedLayer.id, { strokeWidth: Number(e.target.value) })}
                      className="flex-1 accent-[#ff9a00] h-1 bg-[#181818] rounded"
                    />
                    <input
                      type="number"
                      min={0}
                      max={64}
                      value={(selectedLayer as ShapeLayer).strokeWidth || 0}
                      onChange={(e) => updateLayer(selectedLayer.id, { strokeWidth: Math.max(0, Number(e.target.value)) })}
                      className="w-12 bg-[#1e1e1e] border border-[#333333] text-right px-1 py-0.5 rounded text-white text-[10px]"
                    />
                  </div>

                  {/* Dash Style Options */}
                  <div className="grid grid-cols-3 gap-1 text-[9px]">
                    <button
                      onClick={() => updateLayer(selectedLayer.id, { strokeDashArray: undefined })}
                      className="p-1 bg-[#1e1e1e] hover:bg-[#333333] border border-[#3a3a3a] rounded text-center"
                    >
                      Solid
                    </button>
                    <button
                      onClick={() => updateLayer(selectedLayer.id, { strokeDashArray: '6,6' })}
                      className="p-1 bg-[#1e1e1e] hover:bg-[#333333] border border-[#3a3a3a] rounded text-center"
                    >
                      Dashed
                    </button>
                    <button
                      onClick={() => updateLayer(selectedLayer.id, { strokeDashArray: '2,4' })}
                      className="p-1 bg-[#1e1e1e] hover:bg-[#333333] border border-[#3a3a3a] rounded text-center"
                    >
                      Dotted
                    </button>
                  </div>
                </div>
              )}

              {/* Vector SVG Source & Actions */}
              <div className="bg-[#242424] p-2 rounded border border-[#2e2e2e] flex flex-col gap-1.5">
                <div className="text-[10px] uppercase font-semibold text-[#888888] mb-1">
                  Vector Tools & Export
                </div>
                <button
                  onClick={() => setShowSvgEditorModal(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#2b2b2b] hover:bg-[#383838] border border-[#444444] rounded text-[11px] text-[#ff9a00] font-medium transition-colors"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Inspect & Edit SVG Code...</span>
                </button>
                <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                  <button
                    onClick={() => exportSvgDocument()}
                    className="py-1 bg-[#1e1e1e] hover:bg-[#333333] border border-[#333333] rounded text-[10px] text-[#cccccc] hover:text-white"
                  >
                    Export .SVG
                  </button>
                  <button
                    onClick={() => exportAiDocument()}
                    className="py-1 bg-[#331b00] hover:bg-[#4d2900] border border-[#ff9a00]/40 rounded text-[10px] text-[#ff9a00] font-semibold"
                  >
                    Export .AI
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. BOTTOM PANEL GROUP: LAYERS / CHANNELS / PATHS        */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-h-[220px] bg-[#1e1e1e]">
        {/* Panel Tabs Header */}
        <div className="h-7 bg-[#262626] border-b border-[#111111] flex items-center justify-between px-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setBottomTab('layers')}
              className={`px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase transition-colors rounded-t ${
                bottomTab === 'layers'
                  ? 'bg-[#1e1e1e] text-white border-t border-l border-r border-[#3a3a3a]'
                  : 'text-[#888888] hover:text-[#cccccc]'
              }`}
            >
              Layers
            </button>
            <button
              onClick={() => setBottomTab('channels')}
              className={`px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase transition-colors rounded-t ${
                bottomTab === 'channels'
                  ? 'bg-[#1e1e1e] text-white border-t border-l border-r border-[#3a3a3a]'
                  : 'text-[#888888] hover:text-[#cccccc]'
              }`}
            >
              Channels
            </button>
            <button
              onClick={() => setBottomTab('paths')}
              className={`px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase transition-colors rounded-t ${
                bottomTab === 'paths'
                  ? 'bg-[#1e1e1e] text-white border-t border-l border-r border-[#3a3a3a]'
                  : 'text-[#888888] hover:text-[#cccccc]'
              }`}
            >
              Paths
            </button>
          </div>
          <LayersIcon className="w-3.5 h-3.5 text-[#666666]" />
        </div>

        {bottomTab === 'layers' && (
          <>
            {/* Photoshop Layers Filter Bar: [Kind ▼] [Image] [Text] [Shape] [Drawing] */}
            <div className="h-6 bg-[#222222] border-b border-[#111111] px-2 flex items-center justify-between text-[10px] text-[#888888]">
              <div className="flex items-center gap-1">
                <span className="text-[#666666]">Kind</span>
                <span className="text-[8px]">▼</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLayerFilter(layerFilter === 'image' ? 'all' : 'image')}
                  className={`p-0.5 rounded hover:text-white ${layerFilter === 'image' ? 'text-[#00a4e4] bg-[#333333]' : 'text-[#888888]'}`}
                  title="Filter for pixel/image layers"
                >
                  <ImageIcon className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setLayerFilter(layerFilter === 'text' ? 'all' : 'text')}
                  className={`p-0.5 rounded hover:text-white ${layerFilter === 'text' ? 'text-[#00a4e4] bg-[#333333]' : 'text-[#888888]'}`}
                  title="Filter for type layers"
                >
                  <Type className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setLayerFilter(layerFilter === 'shape' ? 'all' : 'shape')}
                  className={`p-0.5 rounded hover:text-white ${layerFilter === 'shape' ? 'text-[#00a4e4] bg-[#333333]' : 'text-[#888888]'}`}
                  title="Filter for shape layers"
                >
                  <Square className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setLayerFilter(layerFilter === 'drawing' ? 'all' : 'drawing')}
                  className={`p-0.5 rounded hover:text-white ${layerFilter === 'drawing' ? 'text-[#00a4e4] bg-[#333333]' : 'text-[#888888]'}`}
                  title="Filter for drawing/brush layers"
                >
                  <Paintbrush className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Blend Mode, Opacity & Lock Strip */}
            <div className="p-2 border-b border-[#111111] bg-[#242424] flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                {/* Blend Mode Dropdown */}
                <select
                  value={selectedLayer?.blendMode || 'normal'}
                  onChange={(e) => {
                    if (selectedLayer) {
                      updateLayer(
                        selectedLayer.id,
                        { blendMode: e.target.value as BlendMode },
                        true,
                        `Blend: ${e.target.value}`
                      );
                    }
                  }}
                  disabled={!selectedLayer}
                  className="bg-[#1e1e1e] border border-[#383838] text-white rounded px-1.5 py-0.5 text-[10px] focus:outline-none flex-1 font-sans"
                >
                  {BLEND_MODE_LABELS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>

                {/* Opacity Slider */}
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="text-[#888888]">Opacity:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedLayer ? Math.round(selectedLayer.opacity * 100) : 100}
                    onChange={(e) => {
                      if (selectedLayer) {
                        updateLayer(selectedLayer.id, { opacity: Number(e.target.value) / 100 });
                      }
                    }}
                    disabled={!selectedLayer}
                    className="w-16 h-1 bg-[#1a1a1a] rounded accent-[#00a4e4] cursor-pointer"
                  />
                  <span className="font-mono text-white text-[10px] w-6 text-right">
                    {selectedLayer ? Math.round(selectedLayer.opacity * 100) : 100}%
                  </span>
                </div>
              </div>

              {/* Locks Strip: Lock Transparency, Lock Position, Lock All */}
              <div className="flex items-center justify-between text-[10px] text-[#888888] pt-1 border-t border-[#2e2e2e]">
                <div className="flex items-center gap-2">
                  <span className="text-[#666666]">Lock:</span>
                  <button
                    onClick={() => selectedLayer && toggleLock(selectedLayer.id)}
                    disabled={!selectedLayer}
                    className={`p-0.5 rounded transition-colors ${
                      selectedLayer?.locked
                        ? 'text-[#00a4e4] bg-[#333333]'
                        : 'hover:text-white'
                    }`}
                    title="Lock All"
                  >
                    {selectedLayer?.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </button>
                </div>

                {/* Reorder Up / Down Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => selectedLayerId && bringForward(selectedLayerId)}
                    disabled={!selectedLayerId}
                    className="p-0.5 hover:text-white disabled:opacity-30"
                    title="Bring Forward (Ctrl+])"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => selectedLayerId && sendBackward(selectedLayerId)}
                    disabled={!selectedLayerId}
                    className="p-0.5 hover:text-white disabled:opacity-30"
                    title="Send Backward (Ctrl+[)"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Functional Layers List */}
            <div className="flex-1 overflow-y-auto p-1 flex flex-col gap-0.5 bg-[#1e1e1e]">
              {displayLayers.map((layer) => {
                const isSelected = layer.id === selectedLayerId;
                return (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayerId(layer.id)}
                    className={`h-9 px-2 flex items-center gap-2 border transition-colors cursor-pointer rounded-xs ${
                      isSelected
                        ? 'bg-[#264f78] border-[#00a4e4] text-white shadow-sm'
                        : 'bg-[#242424] border-[#1a1a1a] text-[#aaaaaa] hover:bg-[#2b2b2b] hover:text-[#cccccc]'
                    }`}
                  >
                    {/* Visibility Toggle (Eye icon) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(layer.id);
                      }}
                      className="text-[#888888] hover:text-white transition-colors"
                      title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                    >
                      {layer.visible ? (
                        <Eye className="w-3.5 h-3.5 text-[#cccccc]" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-[#555555]" />
                      )}
                    </button>

                    {/* Checkerboard Thumbnail with Type Icon */}
                    <div
                      className="w-6 h-6 border border-[#333333] rounded-xs bg-[#111111] flex items-center justify-center overflow-hidden flex-shrink-0"
                      style={{
                        backgroundImage: `repeating-conic-gradient(#2a2a2a 0% 25%, #1e1e1e 0% 50%)`,
                        backgroundSize: '6px 6px'
                      }}
                    >
                      {layer.type === 'text' && <Type className="w-3.5 h-3.5 text-[#00a4e4]" />}
                      {layer.type === 'shape' && <Square className="w-3.5 h-3.5 text-[#ec4899]" />}
                      {layer.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-[#22c55e]" />}
                      {layer.type === 'drawing' && <Paintbrush className="w-3.5 h-3.5 text-[#eab308]" />}
                    </div>

                    {/* Layer Title */}
                    <span className="flex-1 text-[11px] truncate font-medium">
                      {layer.name}
                    </span>

                    {/* Lock Status */}
                    {layer.locked && <Lock className="w-3 h-3 text-[#888888]" />}
                  </div>
                );
              })}
            </div>

            {/* Bottom Photoshop Actions Strip: Link, fx, Mask, Adjustments, Group, New, Delete */}
            <div className="h-7 bg-[#262626] border-t border-[#111111] flex items-center justify-between px-3 text-[#888888]">
              {/* Left quick actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLevelsModal(true)}
                  className="hover:text-white transition-colors p-1"
                  title="Create new adjustment layer"
                >
                  <CircleDot className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setShowCameraRawModal(true)}
                  className="hover:text-white transition-colors p-1 font-bold text-[9px] font-mono"
                  title="Add layer effects (fx)"
                >
                  fx
                </button>
              </div>

              {/* Right: Duplicate, New Layer, Delete */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => selectedLayerId && duplicateLayer(selectedLayerId)}
                  disabled={!selectedLayerId}
                  className="hover:text-white transition-colors disabled:opacity-30"
                  title="Duplicate Layer (Ctrl+J)"
                >
                  <Copy className="w-3 h-3" />
                </button>

                <button
                  onClick={() => addNewLayer()}
                  className="hover:text-white transition-colors text-white hover:bg-[#323232] p-1 rounded-xs"
                  title="Create a new layer (Shift+Ctrl+N)"
                >
                  <Plus className="w-3.5 h-3.5 text-[#00a4e4]" />
                </button>

                <button
                  onClick={() => selectedLayerId && deleteLayer(selectedLayerId)}
                  disabled={!selectedLayerId}
                  className="hover:text-red-400 transition-colors disabled:opacity-30"
                  title="Delete Layer (Delete)"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* CHANNELS TAB */}
        {bottomTab === 'channels' && (
          <div className="flex-1 p-2 flex flex-col gap-1 bg-[#1e1e1e]">
            {[
              { id: 'rgb', name: 'RGB', shortcut: 'Ctrl+2' },
              { id: 'r', name: 'Red', shortcut: 'Ctrl+3' },
              { id: 'g', name: 'Green', shortcut: 'Ctrl+4' },
              { id: 'b', name: 'Blue', shortcut: 'Ctrl+5' }
            ].map((ch) => (
              <div
                key={ch.id}
                className="h-8 px-2 flex items-center justify-between bg-[#242424] border border-[#2e2e2e] rounded text-white text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-[#00a4e4]" />
                  <div className="w-5 h-5 bg-[#111111] border border-[#333333] rounded-xs flex items-center justify-center text-[9px] font-bold">
                    {ch.id.toUpperCase()}
                  </div>
                  <span>{ch.name}</span>
                </div>
                <span className="text-[#666666] font-mono text-[10px]">{ch.shortcut}</span>
              </div>
            ))}
          </div>
        )}

        {/* PATHS TAB */}
        {bottomTab === 'paths' && (
          <div className="flex-1 p-3 flex flex-col items-center justify-center text-[#666666] text-center bg-[#1e1e1e]">
            <Layers className="w-6 h-6 mb-2 opacity-50" />
            <span>No Work Path present in active document.</span>
          </div>
        )}
      </div>
    </div>
  );
};
