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
  Check
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { BLEND_MODE_LABELS } from '../engine/blendModes';
import { BlendMode, Layer } from '../types';

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
    setBrushColor
  } = useStudio();

  // Active tab in Top section (Color vs Swatches)
  const [colorTab, setColorTab] = useState<'color' | 'swatches'>('color');

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
  const displayLayers = [...layers].reverse();

  // Display the last 5 actions for compact history view
  const last5Actions = historyStack.slice(-5);

  return (
    <div className="w-72 bg-[#1e1e1e] border-l border-[#111111] flex flex-col h-full text-[#cccccc] text-[11px] select-none z-30 font-sans">
      {/* ======================================================== */}
      {/* 1. TOP PANEL: COLOR / SWATCHES MATRIX                   */}
      {/* ======================================================== */}
      <div className="flex flex-col border-b border-[#111111] bg-[#1e1e1e]">
        {/* Panel Header */}
        <div className="h-7 bg-[#262626] border-b border-[#111111] flex items-center justify-between px-2.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setColorTab('color')}
              className={`px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase transition-colors rounded-t ${
                colorTab === 'color'
                  ? 'bg-[#1e1e1e] text-white border-t border-l border-r border-[#323232]'
                  : 'text-[#888888] hover:text-[#cccccc]'
              }`}
            >
              Color
            </button>
            <button
              onClick={() => setColorTab('swatches')}
              className={`px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase transition-colors rounded-t ${
                colorTab === 'swatches'
                  ? 'bg-[#1e1e1e] text-white border-t border-l border-r border-[#323232]'
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
          {colorTab === 'color' ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                {/* Visual Color Picker Box */}
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
      {/* 2. MIDDLE PANEL: HISTORY (TRACKING LAST 5 ACTIONS)      */}
      {/* ======================================================== */}
      <div className="flex flex-col border-b border-[#111111] bg-[#1e1e1e] max-h-36">
        {/* Panel Header */}
        <div className="h-6 bg-[#262626] border-b border-[#111111] flex items-center justify-between px-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#aaaaaa]">
            History (Last Actions)
          </span>
          <History className="w-3 h-3 text-[#666666]" />
        </div>

        {/* Panel Body */}
        <div className="overflow-y-auto p-1 flex flex-col gap-0.5 bg-[#1e1e1e]">
          {last5Actions.map((item, idx) => {
            const isCurrent = idx === last5Actions.length - 1;
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
      </div>

      {/* ======================================================== */}
      {/* 3. BOTTOM PANEL: LAYERS (MANAGEMENT & OPACITY)           */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-h-[220px] bg-[#1e1e1e]">
        {/* Panel Header */}
        <div className="h-6 bg-[#262626] border-b border-[#111111] flex items-center justify-between px-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#aaaaaa]">
            Layers
          </span>
          <LayersIcon className="w-3 h-3 text-[#666666]" />
        </div>

        {/* Blend Mode & Opacity Slider Strip */}
        <div className="p-2 border-b border-[#111111] bg-[#262626] flex flex-col gap-1.5">
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
              className="bg-[#1e1e1e] border border-[#383838] text-white rounded px-1.5 py-0.5 text-[10px] focus:outline-none flex-1"
            >
              {BLEND_MODE_LABELS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>

            {/* Lock Button */}
            <button
              onClick={() => selectedLayer && toggleLock(selectedLayer.id)}
              disabled={!selectedLayer}
              className={`p-1 rounded text-[10px] border border-[#383838] transition-colors ${
                selectedLayer?.locked
                  ? 'bg-[#323232] text-[#00a4e4] border-[#00a4e4]'
                  : 'bg-[#1e1e1e] text-[#888888] hover:text-white'
              }`}
              title={selectedLayer?.locked ? 'Unlock Layer' : 'Lock Layer'}
            >
              {selectedLayer?.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>
          </div>

          {/* Opacity Slider */}
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-[#888888] w-12">Opacity:</span>
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
              className="flex-1 h-1 bg-[#1a1a1a] rounded accent-[#00a4e4] cursor-pointer"
            />
            <span className="font-mono text-white text-[10px] w-8 text-right">
              {selectedLayer ? Math.round(selectedLayer.opacity * 100) : 100}%
            </span>
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
                className={`h-8 px-2 flex items-center gap-2 border transition-colors cursor-pointer rounded-xs ${
                  isSelected
                    ? 'bg-[#323232] border-[#00a4e4] text-white shadow-sm'
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

                {/* Checkerboard Thumbnail */}
                <div
                  className="w-5 h-5 border border-[#333333] rounded-xs bg-[#111111] flex items-center justify-center overflow-hidden flex-shrink-0"
                  style={{
                    backgroundImage: `repeating-conic-gradient(#2a2a2a 0% 25%, #1e1e1e 0% 50%)`,
                    backgroundSize: '6px 6px'
                  }}
                >
                  {layer.type === 'text' && <Type className="w-3 h-3 text-[#00a4e4]" />}
                  {layer.type === 'shape' && <Square className="w-3 h-3 text-[#ec4899]" />}
                  {layer.type === 'image' && <ImageIcon className="w-3 h-3 text-[#22c55e]" />}
                  {layer.type === 'drawing' && <Paintbrush className="w-3 h-3 text-[#eab308]" />}
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

        {/* Bottom Action Strip: New Layer & Delete Layer */}
        <div className="h-7 bg-[#262626] border-t border-[#111111] flex items-center justify-end px-3 gap-3 text-[#888888]">
          {/* Duplicate Layer */}
          <button
            onClick={() => selectedLayerId && duplicateLayer(selectedLayerId)}
            disabled={!selectedLayerId}
            className="hover:text-white transition-colors disabled:opacity-30"
            title="Duplicate Layer"
          >
            <Copy className="w-3 h-3" />
          </button>

          {/* New Layer Button */}
          <button
            onClick={() => addNewLayer()}
            className="hover:text-white transition-colors text-white hover:bg-[#323232] p-1 rounded-xs"
            title="Create a new layer"
          >
            <Plus className="w-3.5 h-3.5 text-[#00a4e4]" />
          </button>

          {/* Delete Layer */}
          <button
            onClick={() => selectedLayerId && deleteLayer(selectedLayerId)}
            disabled={!selectedLayerId}
            className="hover:text-red-400 transition-colors disabled:opacity-30"
            title="Delete Layer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
