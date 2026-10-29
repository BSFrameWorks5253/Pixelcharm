import React from 'react';
import {
  Sliders,
  Type,
  Square,
  Image as ImageIcon,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { FilterSlider } from './FilterSlider';
import { HistogramWidget } from './HistogramWidget';
import {
  DEFAULT_ADJUSTMENTS,
  PRESET_FILTERS
} from '../engine/imageFilters';
import { FONT_FAMILIES } from '../constants/presets';
import { ImageLayer, TextLayer, ShapeLayer } from '../types';

export const PropertiesPanel: React.FC = () => {
  const {
    selectedLayer,
    updateLayer,
    documentState,
    setDimensions,
    setBackground
  } = useStudio();

  // If no layer is selected, show Canvas Document properties
  if (!selectedLayer) {
    return (
      <div className="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full overflow-y-auto p-4 gap-5 select-none text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
          <Palette className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-neutral-200 uppercase tracking-wider">
            Canvas Document Setup
          </span>
        </div>

        {/* Dimensions */}
        <div className="flex flex-col gap-2">
          <span className="text-neutral-400 font-medium">Dimensions (px)</span>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-neutral-500 font-mono">WIDTH</span>
              <input
                type="number"
                value={documentState.width}
                onChange={(e) => setDimensions(Number(e.target.value), documentState.height)}
                className="bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-neutral-500 font-mono">HEIGHT</span>
              <input
                type="number"
                value={documentState.height}
                onChange={(e) => setDimensions(documentState.width, Number(e.target.value))}
                className="bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Background Color */}
        <div className="flex flex-col gap-2">
          <span className="text-neutral-400 font-medium">Background Color</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={documentState.background.startsWith('#') ? documentState.background : '#090a10'}
              onChange={(e) => setBackground(e.target.value)}
              className="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={documentState.background}
              onChange={(e) => setBackground(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick Swatches */}
          <div className="flex items-center gap-1.5 pt-1">
            {[
              '#090a10',
              '#0f172a',
              '#18181b',
              '#ffffff',
              '#f4efe6',
              '#e0e7ff',
              '#fce7f3'
            ].map((col) => (
              <button
                key={col}
                onClick={() => setBackground(col)}
                className="w-5 h-5 rounded-full border border-neutral-700/80 hover:scale-110 transition-transform"
                style={{ backgroundColor: col }}
              />
            ))}
          </div>
        </div>

        <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800/80 text-[11px] text-neutral-400 leading-relaxed">
          Select any layer on the canvas or from the Layers stack to inspect and customize its vector layout, typography, or raster filter parameters.
        </div>
      </div>
    );
  }

  // IMAGE LAYER INSPECTOR (Photoshop style)
  if (selectedLayer.type === 'image') {
    const imgLayer = selectedLayer as ImageLayer;
    const adj = imgLayer.adjustments;

    const handleAdjChange = (key: keyof typeof adj, val: number) => {
      updateLayer(imgLayer.id, {
        adjustments: { ...adj, [key]: val, preset: 'custom' }
      });
    };

    const handleApplyPreset = (presetName: string) => {
      const preset = PRESET_FILTERS[presetName];
      if (!preset) return;
      updateLayer(
        imgLayer.id,
        {
          adjustments: { ...adj, ...preset }
        },
        true,
        `Apply Filter: ${presetName}`
      );
    };

    const handleReset = () => {
      updateLayer(
        imgLayer.id,
        { adjustments: { ...DEFAULT_ADJUSTMENTS } },
        true,
        'Reset Adjustments'
      );
    };

    return (
      <div className="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full overflow-y-auto p-4 gap-4 select-none text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-neutral-200 uppercase tracking-wider">
              Photo Adjustments
            </span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors"
            title="Reset All Adjustments"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Live Histogram Widget */}
        <HistogramWidget layer={imgLayer} />

        {/* Preset Filters */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1 text-neutral-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Preset Look / Filter</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'none', label: 'Original' },
              { id: 'cinematic', label: 'Cinematic' },
              { id: 'vintage', label: 'Vintage' },
              { id: 'bw_dramatic', label: 'B&W Dramatic' },
              { id: 'vibrant', label: 'Vibrant' },
              { id: 'golden_hour', label: 'Golden Hour' },
              { id: 'cyberpunk', label: 'Cyberpunk' },
              { id: 'matte', label: 'Matte' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handleApplyPreset(p.id)}
                className={`px-2 py-1.5 rounded text-left transition-colors border ${
                  adj.preset === p.id
                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-medium'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tone & Exposure Adjustments */}
        <div className="flex flex-col gap-3 pt-2 border-t border-neutral-800/80">
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
            Tone & Exposure
          </span>
          <FilterSlider
            label="Brightness"
            value={adj.brightness}
            min={-100}
            max={100}
            onChange={(v) => handleAdjChange('brightness', v)}
          />
          <FilterSlider
            label="Contrast"
            value={adj.contrast}
            min={-100}
            max={100}
            onChange={(v) => handleAdjChange('contrast', v)}
          />
          <FilterSlider
            label="Exposure"
            value={adj.exposure}
            min={-100}
            max={100}
            onChange={(v) => handleAdjChange('exposure', v)}
          />
          <FilterSlider
            label="Saturation"
            value={adj.saturation}
            min={-100}
            max={100}
            onChange={(v) => handleAdjChange('saturation', v)}
          />
          <FilterSlider
            label="Vibrance"
            value={adj.vibrance}
            min={-100}
            max={100}
            onChange={(v) => handleAdjChange('vibrance', v)}
          />
        </div>

        {/* Color Grading */}
        <div className="flex flex-col gap-3 pt-2 border-t border-neutral-800/80">
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
            Color Grading
          </span>
          <FilterSlider
            label="Warmth (Temp)"
            value={adj.warmth}
            min={-100}
            max={100}
            onChange={(v) => handleAdjChange('warmth', v)}
          />
          <FilterSlider
            label="Tint (Green / Magenta)"
            value={adj.tint}
            min={-100}
            max={100}
            onChange={(v) => handleAdjChange('tint', v)}
          />
          <FilterSlider
            label="Hue Shift"
            value={adj.hueRotate}
            min={0}
            max={360}
            unit="°"
            onChange={(v) => handleAdjChange('hueRotate', v)}
          />
        </div>

        {/* Detail & Optical Effects */}
        <div className="flex flex-col gap-3 pt-2 border-t border-neutral-800/80">
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
            Detail & Optical Effects
          </span>
          <FilterSlider
            label="Gaussian Blur"
            value={adj.blur}
            min={0}
            max={40}
            unit="px"
            onChange={(v) => handleAdjChange('blur', v)}
          />
          <FilterSlider
            label="Sharpen (Kernel)"
            value={adj.sharpen}
            min={0}
            max={100}
            onChange={(v) => handleAdjChange('sharpen', v)}
          />
          <FilterSlider
            label="Sepia"
            value={adj.sepia}
            min={0}
            max={100}
            unit="%"
            onChange={(v) => handleAdjChange('sepia', v)}
          />
          <FilterSlider
            label="Grayscale"
            value={adj.grayscale}
            min={0}
            max={100}
            unit="%"
            onChange={(v) => handleAdjChange('grayscale', v)}
          />
          <FilterSlider
            label="Invert"
            value={adj.invert}
            min={0}
            max={100}
            unit="%"
            onChange={(v) => handleAdjChange('invert', v)}
          />
        </div>
      </div>
    );
  }

  // TEXT LAYER INSPECTOR (Canva style)
  if (selectedLayer.type === 'text') {
    const textLayer = selectedLayer as TextLayer;

    return (
      <div className="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full overflow-y-auto p-4 gap-4 select-none text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
          <Type className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-neutral-200 uppercase tracking-wider">
            Canva Typography
          </span>
        </div>

        {/* Content text area */}
        <div className="flex flex-col gap-1.5">
          <span className="text-neutral-400 font-medium">Text Content</span>
          <textarea
            rows={3}
            value={textLayer.text}
            onChange={(e) => updateLayer(textLayer.id, { text: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-normal text-xs focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Font Family */}
        <div className="flex flex-col gap-1.5">
          <span className="text-neutral-400 font-medium">Font Family</span>
          <select
            value={textLayer.fontFamily}
            onChange={(e) => updateLayer(textLayer.id, { fontFamily: e.target.value }, true)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.name} value={f.name}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size & Weight */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-500 font-mono">SIZE (PX)</span>
            <input
              type="number"
              min={8}
              max={300}
              value={textLayer.fontSize}
              onChange={(e) => updateLayer(textLayer.id, { fontSize: Number(e.target.value) })}
              className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-500 font-mono">WEIGHT</span>
            <select
              value={textLayer.fontWeight}
              onChange={(e) => updateLayer(textLayer.id, { fontWeight: e.target.value })}
              className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="300">Light (300)</option>
              <option value="400">Regular (400)</option>
              <option value="600">SemiBold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">Black (800)</option>
            </select>
          </div>
        </div>

        {/* Alignment & Style */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-neutral-400 font-medium">Alignment</span>
          <div className="flex bg-neutral-950 border border-neutral-800 rounded p-0.5">
            <button
              onClick={() => updateLayer(textLayer.id, { align: 'left' })}
              className={`p-1.5 rounded transition-colors ${
                textLayer.align === 'left' ? 'bg-neutral-800 text-white' : 'text-neutral-500'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateLayer(textLayer.id, { align: 'center' })}
              className={`p-1.5 rounded transition-colors ${
                textLayer.align === 'center' ? 'bg-neutral-800 text-white' : 'text-neutral-500'
              }`}
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateLayer(textLayer.id, { align: 'right' })}
              className={`p-1.5 rounded transition-colors ${
                textLayer.align === 'right' ? 'bg-neutral-800 text-white' : 'text-neutral-500'
              }`}
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Text Color */}
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-neutral-400 font-medium">Color</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={textLayer.color}
              onChange={(e) => updateLayer(textLayer.id, { color: e.target.value })}
              className="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={textLayer.color}
              onChange={(e) => updateLayer(textLayer.id, { color: e.target.value })}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Spacing */}
        <div className="flex flex-col gap-3 pt-2 border-t border-neutral-800/80">
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
            Letter & Line Spacing
          </span>
          <FilterSlider
            label="Letter Spacing"
            value={textLayer.letterSpacing}
            min={-5}
            max={25}
            unit="px"
            onChange={(v) => updateLayer(textLayer.id, { letterSpacing: v })}
          />
          <FilterSlider
            label="Line Height"
            value={textLayer.lineHeight}
            min={0.8}
            max={2.5}
            step={0.1}
            onChange={(v) => updateLayer(textLayer.id, { lineHeight: v })}
          />
        </div>

        {/* Drop Shadow */}
        <div className="flex flex-col gap-3 pt-2 border-t border-neutral-800/80">
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
            Glow & Drop Shadow
          </span>
          <FilterSlider
            label="Shadow Blur"
            value={textLayer.shadowBlur}
            min={0}
            max={50}
            unit="px"
            onChange={(v) => updateLayer(textLayer.id, { shadowBlur: v })}
          />
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Shadow Color</span>
            <input
              type="color"
              value={textLayer.shadowColor}
              onChange={(e) => updateLayer(textLayer.id, { shadowColor: e.target.value })}
              className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer p-0.5"
            />
          </div>
        </div>
      </div>
    );
  }

  // SHAPE LAYER INSPECTOR
  if (selectedLayer.type === 'shape') {
    const shapeLayer = selectedLayer as ShapeLayer;

    return (
      <div className="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full overflow-y-auto p-4 gap-4 select-none text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
          <Square className="w-4 h-4 text-pink-400" />
          <span className="font-semibold text-neutral-200 uppercase tracking-wider">
            Vector Shape Styling
          </span>
        </div>

        {/* Fill Color */}
        <div className="flex flex-col gap-1.5">
          <span className="text-neutral-400 font-medium">Fill Color</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={shapeLayer.fill !== 'transparent' ? shapeLayer.fill : '#4f46e5'}
              onChange={(e) => updateLayer(shapeLayer.id, { fill: e.target.value })}
              className="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={shapeLayer.fill}
              onChange={(e) => updateLayer(shapeLayer.id, { fill: e.target.value })}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => updateLayer(shapeLayer.id, { fill: 'transparent' })}
              className="px-2 py-1.5 bg-neutral-800 text-[10px] text-neutral-300 rounded hover:bg-neutral-700"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Stroke Color & Width */}
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-neutral-400 font-medium">Stroke Outline</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={shapeLayer.stroke || '#818cf8'}
              onChange={(e) => updateLayer(shapeLayer.id, { stroke: e.target.value })}
              className="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={shapeLayer.stroke}
              onChange={(e) => updateLayer(shapeLayer.id, { stroke: e.target.value })}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <FilterSlider
          label="Stroke Width"
          value={shapeLayer.strokeWidth}
          min={0}
          max={40}
          unit="px"
          onChange={(v) => updateLayer(shapeLayer.id, { strokeWidth: v })}
        />

        {shapeLayer.shapeType === 'rect' && (
          <FilterSlider
            label="Corner Roundness"
            value={shapeLayer.borderRadius}
            min={0}
            max={Math.min(shapeLayer.width, shapeLayer.height) / 2}
            unit="px"
            onChange={(v) => updateLayer(shapeLayer.id, { borderRadius: v })}
          />
        )}
      </div>
    );
  }

  return null;
};
