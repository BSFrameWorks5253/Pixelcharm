import React, { useState, useEffect } from 'react';
import { useStudio } from '../context/StudioContext';
import { ImageLayer, ImageAdjustments } from '../types';
import { DEFAULT_ADJUSTMENTS, buildCssFilterString } from '../engine/imageFilters';
import { HistogramWidget } from './HistogramWidget';
import { FilterSlider } from './FilterSlider';
import {
  X,
  Sliders,
  Sun,
  Eye,
  Maximize2,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

export const CameraRawFilterModal: React.FC = () => {
  const {
    showCameraRawModal,
    setShowCameraRawModal,
    selectedLayer,
    updateLayer
  } = useStudio();

  const [activeSection, setActiveSection] = useState<'basic' | 'curve' | 'detail' | 'effects'>('basic');
  const [showBeforeAfter, setShowBeforeAfter] = useState<boolean>(false);
  const [localAdjustments, setLocalAdjustments] = useState<ImageAdjustments>({ ...DEFAULT_ADJUSTMENTS });
  const [initialAdjustments, setInitialAdjustments] = useState<ImageAdjustments>({ ...DEFAULT_ADJUSTMENTS });

  const imgLayer = selectedLayer?.type === 'image' ? (selectedLayer as ImageLayer) : null;

  useEffect(() => {
    if (showCameraRawModal && imgLayer) {
      setLocalAdjustments({ ...imgLayer.adjustments });
      setInitialAdjustments({ ...imgLayer.adjustments });
    }
  }, [showCameraRawModal, imgLayer?.id]);

  if (!showCameraRawModal || !imgLayer) return null;

  const handleChange = (key: keyof ImageAdjustments, value: number) => {
    const updated = { ...localAdjustments, [key]: value };
    setLocalAdjustments(updated);
    // Real-time live canvas preview
    updateLayer(imgLayer.id, { adjustments: updated });
  };

  const handleApply = () => {
    updateLayer(imgLayer.id, { adjustments: localAdjustments }, true, 'Camera Raw Filter');
    setShowCameraRawModal(false);
  };

  const handleCancel = () => {
    // Revert to initial
    updateLayer(imgLayer.id, { adjustments: initialAdjustments });
    setShowCameraRawModal(false);
  };

  const handleReset = () => {
    setLocalAdjustments({ ...DEFAULT_ADJUSTMENTS });
    updateLayer(imgLayer.id, { adjustments: { ...DEFAULT_ADJUSTMENTS } });
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#242424] border border-[#383838] rounded-lg w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#cccccc] text-[11px]">
        {/* Top Camera Raw Header Bar */}
        <div className="h-9 bg-[#2c2c2c] border-b border-[#1c1c1c] flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#001e36] border border-[#00a4e4] rounded flex items-center justify-center font-bold text-[9px] text-[#00a4e4]">
              Cr
            </div>
            <span className="font-semibold text-white text-[12px]">Camera Raw 16.4</span>
            <span className="text-[#777] text-[10px]">({imgLayer.name})</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Before / After toggle button (Y key) */}
            <button
              onClick={() => setShowBeforeAfter(!showBeforeAfter)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-medium border transition-colors ${
                showBeforeAfter
                  ? 'bg-[#007acc] text-white border-transparent'
                  : 'bg-[#202020] border-[#383838] text-[#aaa] hover:text-white'
              }`}
              title="Toggle Before / After View (Y)"
            >
              <Eye className="w-3 h-3" />
              <span>Before / After</span>
            </button>

            <button
              onClick={handleCancel}
              className="p-1 hover:bg-[#383838] rounded text-[#888] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Body: Preview (Left) + Camera Raw Controls (Right) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Preview Pane */}
          <div className="flex-1 bg-[#181818] p-6 flex items-center justify-center relative overflow-hidden">
            {/* Checkerboard backdrop */}
            <div
              className="relative max-w-full max-h-full flex items-center justify-center shadow-2xl border border-[#333]"
              style={{
                backgroundImage: `repeating-conic-gradient(#222 0% 25%, #181818 0% 50%)`,
                backgroundSize: '16px 16px'
              }}
            >
              {showBeforeAfter ? (
                // Split View: Original vs Edited
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-[#888] font-mono mb-1">BEFORE (ORIGINAL)</span>
                    <img
                      src={imgLayer.src}
                      alt="Before"
                      className="max-h-[60vh] max-w-[32vw] object-contain rounded"
                    />
                  </div>
                  <div className="w-[1px] h-[55vh] bg-[#444]" />
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-[#00a4e4] font-mono mb-1">AFTER (CAMERA RAW)</span>
                    <img
                      src={imgLayer.src}
                      alt="After"
                      className="max-h-[60vh] max-w-[32vw] object-contain rounded transition-all"
                      style={{ filter: buildCssFilterString(localAdjustments) }}
                    />
                  </div>
                </div>
              ) : (
                <img
                  src={imgLayer.src}
                  alt="Camera Raw Preview"
                  className="max-h-[70vh] max-w-[55vw] object-contain rounded transition-all"
                  style={{ filter: buildCssFilterString(localAdjustments) }}
                />
              )}
            </div>
          </div>

          {/* Right Sidebar: Camera Raw Panels */}
          <div className="w-84 bg-[#282828] border-l border-[#1c1c1c] flex flex-col h-full overflow-hidden">
            {/* Top RGB Histogram */}
            <div className="p-3 border-b border-[#202020] bg-[#222222]">
              <HistogramWidget layer={{ ...imgLayer, adjustments: localAdjustments }} />
            </div>

            {/* Accordion Panels */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* 1. BASIC PANEL */}
              <div className="border border-[#383838] rounded bg-[#242424] overflow-hidden">
                <button
                  onClick={() => setActiveSection(activeSection === 'basic' ? ('' as any) : 'basic')}
                  className="w-full px-3 py-2 bg-[#2c2c2c] flex items-center justify-between text-[#ddd] font-semibold hover:bg-[#343434] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-[#00a4e4]" />
                    <span>Basic</span>
                  </span>
                  {activeSection === 'basic' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>

                {activeSection === 'basic' && (
                  <div className="p-3 space-y-3">
                    {/* White Balance */}
                    <div className="flex flex-col gap-1.5 pb-2 border-b border-[#333]">
                      <span className="text-[10px] font-semibold text-[#888] uppercase">White Balance</span>
                      <FilterSlider
                        label="Temperature (Warmth)"
                        value={localAdjustments.warmth}
                        min={-100}
                        max={100}
                        onChange={(v) => handleChange('warmth', v)}
                      />
                      <FilterSlider
                        label="Tint (Green / Magenta)"
                        value={localAdjustments.tint}
                        min={-100}
                        max={100}
                        onChange={(v) => handleChange('tint', v)}
                      />
                    </div>

                    {/* Tone */}
                    <div className="flex flex-col gap-1.5 pb-2 border-b border-[#333]">
                      <span className="text-[10px] font-semibold text-[#888] uppercase">Tone</span>
                      <FilterSlider
                        label="Exposure"
                        value={localAdjustments.exposure}
                        min={-100}
                        max={100}
                        onChange={(v) => handleChange('exposure', v)}
                      />
                      <FilterSlider
                        label="Contrast"
                        value={localAdjustments.contrast}
                        min={-100}
                        max={100}
                        onChange={(v) => handleChange('contrast', v)}
                      />
                      <FilterSlider
                        label="Highlights"
                        value={localAdjustments.highlights || 0}
                        min={-100}
                        max={100}
                        onChange={(v) => handleChange('highlights', v)}
                      />
                      <FilterSlider
                        label="Shadows"
                        value={localAdjustments.shadows || 0}
                        min={-100}
                        max={100}
                        onChange={(v) => handleChange('shadows', v)}
                      />
                      <FilterSlider
                        label="Whites"
                        value={localAdjustments.whites || 0}
                        min={-100}
                        max={100}
                        onChange={(v) => handleChange('whites', v)}
                      />
                      <FilterSlider
                        label="Blacks"
                        value={localAdjustments.blacks || 0}
                        min={-100}
                        max={100}
                        onChange={(v) => handleChange('blacks', v)}
                      />
                    </div>

                    {/* Presence */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-semibold text-[#888] uppercase">Presence</span>
                      <FilterSlider
                        label="Clarity"
                        value={localAdjustments.clarity || 0}
                        min={-100}
                        max={100}
                        onChange={(v) => handleChange('clarity', v)}
                      />
                      <FilterSlider
                        label="Dehaze"
                        value={localAdjustments.dehaze || 0}
                        min={-100}
                        max={100}
                        onChange={(v) => handleChange('dehaze', v)}
                      />
                      <FilterSlider
                        label="Vibrance"
                        value={localAdjustments.vibrance}
                        min={-100}
                        max={100}
                        onChange={(v) => handleChange('vibrance', v)}
                      />
                      <FilterSlider
                        label="Saturation"
                        value={localAdjustments.saturation}
                        min={-100}
                        max={100}
                        onChange={(v) => handleChange('saturation', v)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. DETAIL PANEL */}
              <div className="border border-[#383838] rounded bg-[#242424] overflow-hidden">
                <button
                  onClick={() => setActiveSection(activeSection === 'detail' ? ('' as any) : 'detail')}
                  className="w-full px-3 py-2 bg-[#2c2c2c] flex items-center justify-between text-[#ddd] font-semibold hover:bg-[#343434] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5 text-[#00a4e4]" />
                    <span>Detail (Sharpening & Blur)</span>
                  </span>
                  {activeSection === 'detail' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>

                {activeSection === 'detail' && (
                  <div className="p-3 space-y-2">
                    <FilterSlider
                      label="Sharpening Amount"
                      value={localAdjustments.sharpen}
                      min={0}
                      max={100}
                      onChange={(v) => handleChange('sharpen', v)}
                    />
                    <FilterSlider
                      label="Gaussian Blur"
                      value={localAdjustments.blur}
                      min={0}
                      max={40}
                      unit="px"
                      onChange={(v) => handleChange('blur', v)}
                    />
                  </div>
                )}
              </div>

              {/* 3. EFFECTS PANEL */}
              <div className="border border-[#383838] rounded bg-[#242424] overflow-hidden">
                <button
                  onClick={() => setActiveSection(activeSection === 'effects' ? ('' as any) : 'effects')}
                  className="w-full px-3 py-2 bg-[#2c2c2c] flex items-center justify-between text-[#ddd] font-semibold hover:bg-[#343434] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#00a4e4]" />
                    <span>Effects & Grading</span>
                  </span>
                  {activeSection === 'effects' ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>

                {activeSection === 'effects' && (
                  <div className="p-3 space-y-2">
                    <FilterSlider
                      label="Sepia Tone"
                      value={localAdjustments.sepia}
                      min={0}
                      max={100}
                      unit="%"
                      onChange={(v) => handleChange('sepia', v)}
                    />
                    <FilterSlider
                      label="Black & White (Grayscale)"
                      value={localAdjustments.grayscale}
                      min={0}
                      max={100}
                      unit="%"
                      onChange={(v) => handleChange('grayscale', v)}
                    />
                    <FilterSlider
                      label="Invert Colors"
                      value={localAdjustments.invert}
                      min={0}
                      max={100}
                      unit="%"
                      onChange={(v) => handleChange('invert', v)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions: Reset, Cancel, OK */}
            <div className="p-3 bg-[#202020] border-t border-[#1c1c1c] flex items-center justify-between">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded bg-[#2c2c2c] hover:bg-[#383838] text-[#aaa] hover:text-white transition-colors"
              >
                Reset
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-1.5 rounded bg-[#2c2c2c] hover:bg-[#383838] text-[#ccc] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="px-5 py-1.5 rounded bg-[#007acc] hover:bg-[#0062a3] text-white font-medium shadow-md transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
