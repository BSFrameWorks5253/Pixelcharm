import React, { useRef } from 'react';
import {
  MousePointer2,
  Hand,
  Type,
  Square,
  Circle,
  Triangle,
  Star,
  Image as ImageIcon,
  Paintbrush,
  LayoutTemplate,
  ShieldCheck,
  Upload,
  Plus
} from 'lucide-react';
import { useStudio, ToolType } from '../context/StudioContext';
import { ShapeType } from '../types';

export const Toolbar: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
    addTextLayer,
    addShapeLayer,
    addImageLayer,
    openPhotoshopFile,
    setShowTemplatesModal,
    setShowEvidenceModal,
    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize
  } = useStudio();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenClick = async () => {
    if (typeof window !== 'undefined' && window.electronAPI?.openNativeFile) {
      const nativeFile = await window.electronAPI.openNativeFile();
      if (!nativeFile) return;

      const ext = nativeFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'psd' || ext === 'psb' || ext === 'psdt') {
        await openPhotoshopFile(nativeFile);
      } else {
        const blob = new Blob([nativeFile.buffer]);
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          addImageLayer(url, nativeFile.name.replace(/\.[^/.]+$/, ''), img.width, img.height);
        };
        img.src = url;
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'psd' || ext === 'psb' || ext === 'psdt') {
      openPhotoshopFile(file);
      e.target.value = '';
      return;
    }

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
    e.target.value = '';
  };

  return (
    <aside className="w-16 bg-neutral-900/90 backdrop-blur border-r border-neutral-800 flex flex-col items-center py-3 gap-2.5 z-20 select-none">
      {/* Hidden file input for image & PSD uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".psd,.psb,.psdt,image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Select / Move Tool (V) */}
      <button
        onClick={() => setActiveTool('select')}
        className={`relative group w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
          activeTool === 'select'
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
            : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
        }`}
        title="Select & Move Tool (V)"
      >
        <MousePointer2 className="w-5 h-5" />
        <span className="absolute left-16 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded text-xs whitespace-nowrap text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md z-50">
          Move Tool <span className="text-neutral-500 font-mono">(V)</span>
        </span>
      </button>

      {/* Hand / Pan Tool (H) */}
      <button
        onClick={() => setActiveTool('hand')}
        className={`relative group w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
          activeTool === 'hand'
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
            : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
        }`}
        title="Hand / Pan Tool (H)"
      >
        <Hand className="w-5 h-5" />
        <span className="absolute left-16 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded text-xs whitespace-nowrap text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md z-50">
          Hand / Pan Tool <span className="text-neutral-500 font-mono">(H)</span>
        </span>
      </button>

      <div className="w-8 h-[1px] bg-neutral-800 my-1" />

      {/* Add Text Tool (T) */}
      <button
        onClick={() => addTextLayer()}
        className="relative group w-11 h-11 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-all"
        title="Add Text Layer (T)"
      >
        <Type className="w-5 h-5" />
        <span className="absolute left-16 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded text-xs whitespace-nowrap text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md z-50">
          Add Text <span className="text-neutral-500 font-mono">(T)</span>
        </span>
      </button>

      {/* Shapes Group */}
      <div className="relative group">
        <button
          onClick={() => addShapeLayer('rect')}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-all"
          title="Add Shape (U)"
        >
          <Square className="w-5 h-5" />
        </button>

        {/* Hover shapes flyout menu */}
        <div className="absolute left-16 top-0 hidden group-hover:flex bg-neutral-900/95 backdrop-blur border border-neutral-800 p-1.5 rounded-xl gap-1 shadow-2xl z-50">
          <button
            onClick={() => addShapeLayer('rect')}
            className="p-2 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg transition-colors"
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => addShapeLayer('circle')}
            className="p-2 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg transition-colors"
            title="Circle / Ellipse"
          >
            <Circle className="w-4 h-4" />
          </button>
          <button
            onClick={() => addShapeLayer('triangle')}
            className="p-2 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg transition-colors"
            title="Triangle"
          >
            <Triangle className="w-4 h-4" />
          </button>
          <button
            onClick={() => addShapeLayer('star')}
            className="p-2 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg transition-colors"
            title="Star"
          >
            <Star className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Freehand Brush Tool (B) */}
      <button
        onClick={() => setActiveTool('brush')}
        className={`relative group w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
          activeTool === 'brush'
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
            : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
        }`}
        title="Brush / Digital Painting Tool (B)"
      >
        <Paintbrush className="w-5 h-5" />
        <span className="absolute left-16 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded text-xs whitespace-nowrap text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md z-50">
          Brush Tool <span className="text-neutral-500 font-mono">(B)</span>
        </span>
      </button>

      {/* Image & PSD Upload Tool (I) */}
      <button
        onClick={handleOpenClick}
        className="relative group w-11 h-11 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-all"
        title="Open Photoshop (.PSD/.PSB) or Image"
      >
        <Upload className="w-5 h-5 text-blue-400" />
        <span className="absolute left-16 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded text-xs whitespace-nowrap text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md z-50">
          Open PSD / Image
        </span>
      </button>

      <div className="w-8 h-[1px] bg-neutral-800 my-1" />

      {/* Canva Templates Browser */}
      <button
        onClick={() => setShowTemplatesModal(true)}
        className="relative group w-11 h-11 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-all"
        title="Canva Design Templates"
      >
        <LayoutTemplate className="w-5 h-5 text-amber-400" />
        <span className="absolute left-16 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded text-xs whitespace-nowrap text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md z-50">
          Canva Templates
        </span>
      </button>

      <div className="flex-1" />

      {/* Reverse Engineering Evidence Modal */}
      <button
        onClick={() => setShowEvidenceModal(true)}
        className="relative group w-11 h-11 rounded-xl flex items-center justify-center text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/20 transition-all"
        title="View Canva & Photoshop Architecture Evidence"
      >
        <ShieldCheck className="w-5 h-5" />
        <span className="absolute left-16 bg-neutral-900 border border-emerald-600/50 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap text-emerald-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Technical Evidence Report
        </span>
      </button>
    </aside>
  );
};
