import React from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Type,
  Square,
  Image as ImageIcon,
  Paintbrush
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { BLEND_MODE_LABELS } from '../engine/blendModes';
import { BlendMode, Layer } from '../types';

export const LayersPanel: React.FC = () => {
  const {
    layers,
    selectedLayerId,
    selectedLayer,
    setSelectedLayerId,
    updateLayer,
    deleteLayer,
    duplicateLayer,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    toggleLock,
    toggleVisibility
  } = useStudio();

  // In Photoshop, the layers list displays top layer first, so we reverse for display
  const reversedLayers = [...layers].reverse();

  const getLayerIcon = (layer: Layer) => {
    switch (layer.type) {
      case 'text':
        return <Type className="w-3.5 h-3.5 text-indigo-400" />;
      case 'shape':
        return <Square className="w-3.5 h-3.5 text-pink-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />;
      case 'drawing':
        return <Paintbrush className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="w-72 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full z-20 select-none">
      {/* Panel Title */}
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-neutral-200 uppercase tracking-wider">
            Layers Stack
          </span>
          <span className="bg-neutral-800 text-neutral-400 text-[10px] font-mono px-1.5 py-0.5 rounded-full">
            {layers.length}
          </span>
        </div>
      </div>

      {/* Layer Global Controls (Opacity & Blend Mode) */}
      {selectedLayer && (
        <div className="p-2.5 bg-neutral-950/70 border-b border-neutral-800 flex flex-col gap-2 text-xs">
          {/* Blend Mode */}
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 text-[11px]">Blend Mode</span>
            <select
              value={selectedLayer.blendMode}
              onChange={(e) =>
                updateLayer(
                  selectedLayer.id,
                  { blendMode: e.target.value as BlendMode },
                  true,
                  `Set Blend Mode ${e.target.value}`
                )
              }
              className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-200 text-xs focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
            >
              {BLEND_MODE_LABELS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Opacity Slider */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-neutral-400 text-[11px]">Opacity</span>
            <div className="flex items-center gap-2 flex-1 max-w-[150px]">
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(selectedLayer.opacity * 100)}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, { opacity: Number(e.target.value) / 100 })
                }
                className="w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-neutral-300 font-mono text-[11px] w-8 text-right">
                {Math.round(selectedLayer.opacity * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {reversedLayers.map((layer) => {
          const isSelected = layer.id === selectedLayerId;
          return (
            <div
              key={layer.id}
              onClick={() => setSelectedLayerId(layer.id)}
              className={`group flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600/15 border-indigo-500/50 text-white shadow-sm'
                  : 'bg-neutral-950/40 border-neutral-800/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              {/* Visibility Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(layer.id);
                }}
                className={`p-1 rounded hover:bg-neutral-800 transition-colors ${
                  layer.visible ? 'text-neutral-400 hover:text-white' : 'text-neutral-600'
                }`}
                title={layer.visible ? 'Hide Layer' : 'Show Layer'}
              >
                {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              {/* Lock Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock(layer.id);
                }}
                className={`p-1 rounded hover:bg-neutral-800 transition-colors ${
                  layer.locked ? 'text-amber-400' : 'text-neutral-600 opacity-0 group-hover:opacity-100'
                }`}
                title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
              >
                {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>

              {/* Layer Icon */}
              <div className="w-6 h-6 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0">
                {getLayerIcon(layer)}
              </div>

              {/* Layer Name */}
              <span className="flex-1 text-xs font-medium truncate">{layer.name}</span>

              {/* Actions on hover */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateLayer(layer.id);
                  }}
                  className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
                  title="Duplicate Layer"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLayer(layer.id);
                  }}
                  className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-red-400"
                  title="Delete Layer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Layer Order Bottom Bar */}
      {selectedLayer && (
        <div className="p-2 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-neutral-400">
          <div className="flex items-center gap-1">
            <button
              onClick={() => bringToFront(selectedLayer.id)}
              className="p-1.5 hover:bg-neutral-800 hover:text-white rounded"
              title="Bring to Front"
            >
              <ChevronsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => bringForward(selectedLayer.id)}
              className="p-1.5 hover:bg-neutral-800 hover:text-white rounded"
              title="Bring Forward"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => sendBackward(selectedLayer.id)}
              className="p-1.5 hover:bg-neutral-800 hover:text-white rounded"
              title="Send Backward"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => sendToBack(selectedLayer.id)}
              className="p-1.5 hover:bg-neutral-800 hover:text-white rounded"
              title="Send to Back"
            >
              <ChevronsDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => duplicateLayer(selectedLayer.id)}
              className="p-1.5 hover:bg-neutral-800 hover:text-white rounded"
              title="Duplicate Layer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => deleteLayer(selectedLayer.id)}
              className="p-1.5 hover:bg-neutral-800 hover:text-red-400 rounded"
              title="Delete Layer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
