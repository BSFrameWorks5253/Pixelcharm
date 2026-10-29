import React, { useState, useEffect } from 'react';
import { useStudio } from '../context/StudioContext';
import { ImageLayer } from '../types';
import { X } from 'lucide-react';
import { HistogramWidget } from './HistogramWidget';

export const LevelsModal: React.FC = () => {
  const {
    showLevelsModal,
    setShowLevelsModal,
    selectedLayer,
    updateLayer
  } = useStudio();

  const imgLayer = selectedLayer?.type === 'image' ? (selectedLayer as ImageLayer) : null;

  const [blackPoint, setBlackPoint] = useState<number>(0);
  const [gamma, setGamma] = useState<number>(1.0);
  const [whitePoint, setWhitePoint] = useState<number>(255);

  const [initialContrast, setInitialContrast] = useState<number>(0);
  const [initialBrightness, setInitialBrightness] = useState<number>(0);

  useEffect(() => {
    if (showLevelsModal && imgLayer) {
      setInitialContrast(imgLayer.adjustments.contrast || 0);
      setInitialBrightness(imgLayer.adjustments.brightness || 0);
      setBlackPoint(0);
      setGamma(1.0);
      setWhitePoint(255);
    }
  }, [showLevelsModal, imgLayer?.id]);

  if (!showLevelsModal || !imgLayer) return null;

  const handleApply = () => {
    // Map levels to contrast & exposure
    const contrastBoost = Math.round(((255 - (whitePoint - blackPoint)) / 255) * 80);
    const gammaShift = Math.round((gamma - 1.0) * 50);

    updateLayer(
      imgLayer.id,
      {
        adjustments: {
          ...imgLayer.adjustments,
          contrast: initialContrast + contrastBoost,
          brightness: initialBrightness + gammaShift
        }
      },
      true,
      'Levels Adjustment'
    );
    setShowLevelsModal(false);
  };

  const handleCancel = () => {
    updateLayer(imgLayer.id, {
      adjustments: {
        ...imgLayer.adjustments,
        contrast: initialContrast,
        brightness: initialBrightness
      }
    });
    setShowLevelsModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-100">
      <div className="bg-[#2c2c2c] border border-[#3f3f3f] rounded shadow-2xl w-[420px] text-[#ccc] text-[11px] overflow-hidden">
        {/* Title Bar */}
        <div className="h-7 bg-[#383838] px-3 flex items-center justify-between border-b border-[#222]">
          <span className="font-semibold text-white">Levels (Ctrl+L)</span>
          <button onClick={handleCancel} className="text-[#888] hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center text-[#888]">
            <span>Channel: <strong className="text-white">RGB</strong></span>
            <button
              onClick={() => {
                setBlackPoint(15);
                setWhitePoint(240);
                setGamma(1.05);
              }}
              className="px-2 py-0.5 bg-[#383838] hover:bg-[#444] text-white rounded text-[10px]"
            >
              Auto
            </button>
          </div>

          {/* Histogram */}
          <HistogramWidget layer={imgLayer} />

          {/* Input Levels Sliders */}
          <div className="space-y-1">
            <div className="flex justify-between text-[#888]">
              <span>Input Levels:</span>
              <div className="flex gap-2 font-mono text-white text-[10px]">
                <span>{blackPoint}</span>
                <span>{gamma.toFixed(2)}</span>
                <span>{whitePoint}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={blackPoint}
                onChange={(e) => setBlackPoint(Number(e.target.value))}
                className="w-1/3 h-1 bg-[#1c1c1c] rounded accent-[#00a4e4] cursor-pointer"
              />
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={gamma}
                onChange={(e) => setGamma(Number(e.target.value))}
                className="w-1/3 h-1 bg-[#1c1c1c] rounded accent-[#00a4e4] cursor-pointer"
              />
              <input
                type="range"
                min="150"
                max="255"
                value={whitePoint}
                onChange={(e) => setWhitePoint(Number(e.target.value))}
                className="w-1/3 h-1 bg-[#1c1c1c] rounded accent-[#00a4e4] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="p-3 bg-[#242424] border-t border-[#202020] flex items-center justify-end gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-1 rounded bg-[#333] hover:bg-[#3f3f3f] text-[#ccc] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-1 rounded bg-[#007acc] hover:bg-[#0062a3] text-white font-medium shadow transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
