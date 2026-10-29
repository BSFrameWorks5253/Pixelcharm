import React, { useState } from 'react';
import { X, Smartphone, Monitor, Printer, Image as ImageIcon, Film, FileText, Check, Sparkles } from 'lucide-react';
import { useStudio } from '../context/StudioContext';

interface PresetItem {
  id: string;
  name: string;
  width: number;
  height: number;
  resolution: number;
  unit: string;
  category: string;
  description: string;
}

const DOCUMENT_PRESETS: PresetItem[] = [
  // Photo
  { id: 'p1', name: 'Default Photoshop Size', width: 2100, height: 1500, resolution: 300, unit: 'px', category: 'photo', description: '7 x 5 in @ 300 ppi' },
  { id: 'p2', name: 'Landscape 4 x 6 in', width: 1800, height: 1200, resolution: 300, unit: 'px', category: 'photo', description: '4 x 6 in @ 300 ppi' },
  { id: 'p3', name: 'Portrait 8 x 10 in', width: 2400, height: 3000, resolution: 300, unit: 'px', category: 'photo', description: '8 x 10 in @ 300 ppi' },
  
  // Print
  { id: 'pr1', name: 'Letter', width: 2550, height: 3300, resolution: 300, unit: 'px', category: 'print', description: '8.5 x 11 in @ 300 ppi' },
  { id: 'pr2', name: 'A4', width: 2480, height: 3508, resolution: 300, unit: 'px', category: 'print', description: '210 x 297 mm @ 300 ppi' },
  { id: 'pr3', name: 'Tabloid / Poster', width: 3300, height: 5100, resolution: 300, unit: 'px', category: 'print', description: '11 x 17 in @ 300 ppi' },

  // Web
  { id: 'w1', name: 'Web Most Common', width: 1920, height: 1080, resolution: 72, unit: 'px', category: 'web', description: '1920 x 1080 px @ 72 ppi' },
  { id: 'w2', name: 'Web Large', width: 1920, height: 1200, resolution: 72, unit: 'px', category: 'web', description: '1920 x 1200 px @ 72 ppi' },
  { id: 'w3', name: 'Web Medium', width: 1440, height: 900, resolution: 72, unit: 'px', category: 'web', description: '1440 x 900 px @ 72 ppi' },
  { id: 'w4', name: 'Web Small', width: 1280, height: 720, resolution: 72, unit: 'px', category: 'web', description: '1280 x 720 px @ 72 ppi' },
  { id: 'w5', name: 'Instagram Square', width: 1080, height: 1080, resolution: 72, unit: 'px', category: 'web', description: '1080 x 1080 px (1:1)' },
  { id: 'w6', name: 'YouTube Thumbnail', width: 1280, height: 720, resolution: 72, unit: 'px', category: 'web', description: '1280 x 720 px (16:9)' },

  // Mobile
  { id: 'm1', name: 'iPhone 15 / 16 Pro', width: 1179, height: 2556, resolution: 460, unit: 'px', category: 'mobile', description: '1179 x 2556 px' },
  { id: 'm2', name: 'iPad Pro 12.9"', width: 2048, height: 2732, resolution: 264, unit: 'px', category: 'mobile', description: '2048 x 2732 px' },
  { id: 'm3', name: 'Android 1080p', width: 1080, height: 2400, resolution: 400, unit: 'px', category: 'mobile', description: '1080 x 2400 px' },

  // Film & Video
  { id: 'f1', name: 'HDTV 1080p', width: 1920, height: 1080, resolution: 72, unit: 'px', category: 'film', description: '1920 x 1080 px (16:9)' },
  { id: 'f2', name: 'UHD 4K', width: 3840, height: 2160, resolution: 72, unit: 'px', category: 'film', description: '3840 x 2160 px (16:9)' },
  { id: 'f3', name: 'DCI 8K', width: 7680, height: 4320, resolution: 72, unit: 'px', category: 'film', description: '7680 x 4320 px' },

  // Adobe Illustrator / Vector Artboards
  { id: 'vec1', name: 'Vector Artboard (1080p)', width: 1920, height: 1080, resolution: 300, unit: 'px', category: 'vector', description: '1920 x 1080 px Vector Canvas' },
  { id: 'vec2', name: 'Logo Design (Square)', width: 800, height: 800, resolution: 300, unit: 'px', category: 'vector', description: '800 x 800 px Vector Symbol' },
  { id: 'vec3', name: 'App Icon Master', width: 1024, height: 1024, resolution: 300, unit: 'px', category: 'vector', description: '1024 x 1024 px Apple/Google Store' },
  { id: 'vec4', name: 'Vector Icon (Small)', width: 512, height: 512, resolution: 300, unit: 'px', category: 'vector', description: '512 x 512 px SVG Icon Grid' },
  { id: 'vec5', name: 'Vector Social Banner', width: 1200, height: 630, resolution: 300, unit: 'px', category: 'vector', description: '1200 x 630 px Social Vector Card' },
  { id: 'vec6', name: 'A4 Vector Print Sheet', width: 2480, height: 3508, resolution: 300, unit: 'px', category: 'vector', description: '210 x 297 mm Vector Graphics' }
];

export const NewDocumentModal: React.FC = () => {
  const { showNewDocModal, setShowNewDocModal, createNewDocument } = useStudio();

  const [activeCategory, setActiveCategory] = useState<string>('web');
  const [selectedPreset, setSelectedPreset] = useState<PresetItem>(DOCUMENT_PRESETS[3]); // Web Most Common

  // Preset Details form
  const [docTitle, setDocTitle] = useState('Untitled-1');
  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);
  const [resolution, setResolution] = useState<number>(72);
  const [colorMode, setColorMode] = useState<string>('RGB Color');
  const [bgType, setBgType] = useState<string>('white');
  const [customBgColor, setCustomBgColor] = useState<string>('#ffffff');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');

  if (!showNewDocModal) return null;

  const handleSelectPreset = (preset: PresetItem) => {
    setSelectedPreset(preset);
    setWidth(preset.width);
    setHeight(preset.height);
    setResolution(preset.resolution);
    setOrientation(preset.width >= preset.height ? 'landscape' : 'portrait');
  };

  const toggleOrientation = (target: 'portrait' | 'landscape') => {
    setOrientation(target);
    if ((target === 'portrait' && width > height) || (target === 'landscape' && height > width)) {
      const temp = width;
      setWidth(height);
      setHeight(temp);
    }
  };

  const handleCreate = () => {
    let resolvedBg = '#ffffff';
    if (bgType === 'black') resolvedBg = '#000000';
    else if (bgType === 'transparent') resolvedBg = 'transparent';
    else if (bgType === 'custom') resolvedBg = customBgColor;
    else if (bgType === 'dark') resolvedBg = '#181818';

    createNewDocument(width, height, resolvedBg, docTitle);
  };

  const filteredPresets = DOCUMENT_PRESETS.filter((p) => p.category === activeCategory);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans select-none text-[12px]">
      <div className="bg-[#262626] border border-[#3f3f3f] rounded shadow-2xl w-[960px] h-[640px] flex flex-col overflow-hidden text-[#cccccc]">
        {/* Header */}
        <div className="h-10 bg-[#1e1e1e] border-b border-[#111111] flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#001e36] border border-[#00a4e4] rounded flex items-center justify-center font-bold text-[9px] text-[#00a4e4]">
              Ps
            </div>
            <span className="font-semibold text-white text-[13px]">New Document</span>
          </div>
          <button
            onClick={() => setShowNewDocModal(false)}
            className="text-[#888888] hover:text-white p-1 hover:bg-[#323232] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs Strip (Photoshop / Illustrator style) */}
        <div className="h-9 bg-[#202020] border-b border-[#111111] flex items-center px-4 gap-6 text-[12px] font-medium overflow-x-auto">
          {[
            { id: 'web', label: 'Web', icon: Monitor },
            { id: 'vector', label: 'Illustrator / Vector', icon: Sparkles },
            { id: 'photo', label: 'Photo', icon: ImageIcon },
            { id: 'print', label: 'Print', icon: Printer },
            { id: 'mobile', label: 'Mobile', icon: Smartphone },
            { id: 'film', label: 'Film & Video', icon: Film }
          ].map(({ id, label, icon: Icon }) => {
            const isVector = id === 'vector';
            const isActive = activeCategory === id;
            return (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`flex items-center gap-1.5 py-1.5 border-b-2 transition-colors ${
                  isActive
                    ? isVector
                      ? 'border-[#ff9a00] text-[#ff9a00] font-semibold'
                      : 'border-[#00a4e4] text-white font-semibold'
                    : isVector
                    ? 'border-transparent text-[#ff9a00]/70 hover:text-[#ff9a00]'
                    : 'border-transparent text-[#888888] hover:text-[#dddddd]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content: Left Presets Grid, Right Details Panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Presets Grid */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#262626]">
            <h3 className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-3">
              Blank Document Presets
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {filteredPresets.map((preset) => {
                const isSelected = selectedPreset.id === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`border rounded p-3 cursor-pointer flex flex-col justify-between h-28 transition-all relative ${
                      isSelected
                        ? 'border-[#00a4e4] bg-[#2d3748]/40 shadow-md ring-1 ring-[#00a4e4]'
                        : 'border-[#383838] bg-[#1f1f1f] hover:border-[#555555] hover:bg-[#252525]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white text-[12px] truncate">{preset.name}</div>
                      <div className="text-[11px] text-[#888888] mt-1 font-mono">{preset.description}</div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#aaaaaa] border-t border-[#333333] pt-1.5 mt-2 font-mono">
                      <span>{preset.width} × {preset.height} px</span>
                      <span>{preset.resolution} ppi</span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#00a4e4] flex items-center justify-center text-white">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: PRESET DETAILS Sidebar (Photoshop authentic layout) */}
          <div className="w-80 bg-[#1e1e1e] border-l border-[#111111] p-4 flex flex-col justify-between overflow-y-auto">
            <div className="flex flex-col gap-3.5">
              <h3 className="text-[11px] font-semibold text-white uppercase tracking-wider border-b border-[#333333] pb-2">
                Preset Details
              </h3>

              {/* Title input */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#888888]">Document Name</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="bg-[#2b2b2b] border border-[#3e3e3e] text-white px-2.5 py-1.5 rounded focus:outline-none focus:border-[#00a4e4]"
                />
              </div>

              {/* Width & Height */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-[#888888]">Width</label>
                  <div className="flex items-center bg-[#2b2b2b] border border-[#3e3e3e] rounded px-2 focus-within:border-[#00a4e4]">
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))}
                      className="bg-transparent text-white py-1.5 w-full focus:outline-none font-mono text-[12px]"
                    />
                    <span className="text-[#888888] text-[10px]">px</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-[#888888]">Height</label>
                  <div className="flex items-center bg-[#2b2b2b] border border-[#3e3e3e] rounded px-2 focus-within:border-[#00a4e4]">
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
                      className="bg-transparent text-white py-1.5 w-full focus:outline-none font-mono text-[12px]"
                    />
                    <span className="text-[#888888] text-[10px]">px</span>
                  </div>
                </div>
              </div>

              {/* Orientation Buttons */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#888888]">Orientation</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleOrientation('portrait')}
                    className={`flex-1 py-1.5 border rounded flex items-center justify-center gap-1.5 transition-colors ${
                      orientation === 'portrait'
                        ? 'border-[#00a4e4] bg-[#2a374a] text-white font-medium'
                        : 'border-[#3a3a3a] bg-[#262626] text-[#888888] hover:text-white'
                    }`}
                  >
                    <div className="w-3 h-4 border border-current rounded-xs" />
                    <span>Portrait</span>
                  </button>
                  <button
                    onClick={() => toggleOrientation('landscape')}
                    className={`flex-1 py-1.5 border rounded flex items-center justify-center gap-1.5 transition-colors ${
                      orientation === 'landscape'
                        ? 'border-[#00a4e4] bg-[#2a374a] text-white font-medium'
                        : 'border-[#3a3a3a] bg-[#262626] text-[#888888] hover:text-white'
                    }`}
                  >
                    <div className="w-4 h-3 border border-current rounded-xs" />
                    <span>Landscape</span>
                  </button>
                </div>
              </div>

              {/* Resolution */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#888888]">Resolution</label>
                <div className="flex items-center justify-between bg-[#2b2b2b] border border-[#3e3e3e] rounded px-2.5 py-1 focus-within:border-[#00a4e4]">
                  <input
                    type="number"
                    value={resolution}
                    onChange={(e) => setResolution(Number(e.target.value))}
                    className="bg-transparent text-white w-20 focus:outline-none font-mono text-[12px]"
                  />
                  <span className="text-[#888888] text-[11px]">Pixels/Inch (ppi)</span>
                </div>
              </div>

              {/* Color Mode */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#888888]">Color Mode</label>
                <select
                  value={colorMode}
                  onChange={(e) => setColorMode(e.target.value)}
                  className="bg-[#2b2b2b] border border-[#3e3e3e] text-white px-2.5 py-1.5 rounded focus:outline-none focus:border-[#00a4e4]"
                >
                  <option value="RGB Color">RGB Color 8 Bit</option>
                  <option value="RGB Color 16">RGB Color 16 Bit</option>
                  <option value="Grayscale">Grayscale 8 Bit</option>
                  <option value="CMYK Color">CMYK Color 8 Bit</option>
                </select>
              </div>

              {/* Background Contents */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#888888]">Background Contents</label>
                <div className="flex items-center gap-2">
                  <select
                    value={bgType}
                    onChange={(e) => setBgType(e.target.value)}
                    className="flex-1 bg-[#2b2b2b] border border-[#3e3e3e] text-white px-2.5 py-1.5 rounded focus:outline-none focus:border-[#00a4e4]"
                  >
                    <option value="white">White</option>
                    <option value="black">Black</option>
                    <option value="dark">Photoshop Dark (#181818)</option>
                    <option value="transparent">Transparent</option>
                    <option value="custom">Custom Color</option>
                  </select>
                  {bgType === 'custom' && (
                    <input
                      type="color"
                      value={customBgColor}
                      onChange={(e) => setCustomBgColor(e.target.value)}
                      className="w-8 h-8 rounded border border-[#3e3e3e] cursor-pointer bg-transparent p-0"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#333333] mt-4">
              <button
                onClick={() => setShowNewDocModal(false)}
                className="px-4 py-1.5 bg-[#333333] hover:bg-[#444444] text-[#cccccc] hover:text-white rounded transition-colors text-[12px]"
              >
                Close
              </button>
              <button
                onClick={handleCreate}
                className="px-6 py-1.5 bg-[#0078d4] hover:bg-[#0086f0] text-white font-semibold rounded shadow-md transition-colors text-[12px]"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
