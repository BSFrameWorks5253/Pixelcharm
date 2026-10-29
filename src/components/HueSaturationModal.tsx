import React, { useState, useEffect } from 'react';
import { useStudio } from '../context/StudioContext';
import { ImageLayer } from '../types';
import { X } from 'lucide-react';
import { FilterSlider } from './FilterSlider';

export const HueSaturationModal: React.FC = () => {
  const {
    showHueSatModal,
    setShowHueSatModal,
    selectedLayer,
    updateLayer
  } = useStudio();

  const imgLayer = selectedLayer?.type === 'image' ? (selectedLayer as ImageLayer) : null;

  const [hue, setHue] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(0);
  const [lightness, setLightness] = useState<number>(0);

  const [initialHue, setInitialHue] = useState<number>(0);
  const [initialSat, setInitialSat] = useState<number>(0);
  const [initialBri, setInitialBri] = useState<number>(0);

  useEffect(() => {
    if (showHueSatModal && imgLayer) {
      setHue(imgLayer.adjustments.hueRotate || 0);
      setSaturation(imgLayer.adjustments.saturation || 0);
      setLightness(imgLayer.adjustments.brightness || 0);

      setInitialHue(imgLayer.adjustments.hueRotate || 0);
      setInitialSat(imgLayer.adjustments.saturation || 0);
      setInitialBri(imgLayer.adjustments.brightness || 0);
    }
  }, [showHueSatModal, imgLayer?.id]);

  if (!showHueSatModal || !imgLayer) return null;

  const handleApply = () => {
    updateLayer(
      imgLayer.id,
      {
        adjustments: {
          ...imgLayer.adjustments,
          hueRotate: hue,
          saturation: saturation,
          brightness: lightness
        }
      },
      true,
      'Hue/Saturation'
    );
    setShowHueSatModal(false);
  };

  const handleCancel = () => {
    updateLayer(imgLayer.id, {
      adjustments: {
        ...imgLayer.adjustments,
        hueRotate: initialHue,
        saturation: initialSat,
        brightness: initialBri
      }
    });
    setShowHueSatModal(false);
  };

  const handleHueChange = (val: number) => {
    setHue(val);
    updateLayer(imgLayer.id, {
      adjustments: { ...imgLayer.adjustments, hueRotate: val }
    });
  };

  const handleSatChange = (val: number) => {
    setSaturation(val);
    updateLayer(imgLayer.id, {
      adjustments: { ...imgLayer.adjustments, saturation: val }
    });
  };

  const handleLightChange = (val: number) => {
    setLightness(val);
    updateLayer(imgLayer.id, {
      adjustments: { ...imgLayer.adjustments, brightness: val }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-100">
      <div className="bg-[#2c2c2c] border border-[#3f3f3f] rounded shadow-2xl w-96 text-[#ccc] text-[11px] overflow-hidden">
        {/* Title Bar */}
        <div className="h-7 bg-[#383838] px-3 flex items-center justify-between border-b border-[#222]">
          <span className="font-semibold text-white">Hue/Saturation (Ctrl+U)</span>
          <button onClick={handleCancel} className="text-[#888] hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <FilterSlider
            label="Hue"
            value={hue}
            min={-180}
            max={180}
            unit="°"
            onChange={handleHueChange}
          />

          <FilterSlider
            label="Saturation"
            value={saturation}
            min={-100}
            max={100}
            onChange={handleSatChange}
          />

          <FilterSlider
            label="Lightness"
            value={lightness}
            min={-100}
            max={100}
            onChange={handleLightChange}
          />

          {/* Spectrum Bar */}
          <div
            className="w-full h-3 rounded-sm border border-[#444]"
            style={{
              background: 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)'
            }}
          />
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
