import React, { useState, useRef } from 'react';
import {
  Undo2,
  Redo2,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FolderOpen,
  Save,
  ChevronDown,
  Layers,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { CANVAS_PRESETS } from '../constants/presets';
import { AppLogo } from './AppLogo';

export const Header: React.FC = () => {
  const {
    documentState,
    setDocumentState,
    setDimensions,
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    canUndo,
    canRedo,
    undo,
    redo,
    historyStack,
    historyIndex,
    downloadImage,
    exportProjectJson,
    importProjectJson,
    openPhotoshopFile,
    exportPsd,
    setShowEvidenceModal,
    setShowTemplatesModal
  } = useStudio();

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenClick = async () => {
    if (typeof window !== 'undefined' && window.electronAPI?.openNativeFile) {
      const nativeFile = await window.electronAPI.openNativeFile();
      if (!nativeFile) return;

      const ext = nativeFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'psd' || ext === 'psb' || ext === 'psdt') {
        await openPhotoshopFile(nativeFile);
      } else {
        const decoder = new TextDecoder('utf-8');
        const jsonStr = decoder.decode(nativeFile.buffer);
        importProjectJson(jsonStr);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleOpenProject = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'psd' || ext === 'psb' || ext === 'psdt') {
      await openPhotoshopFile(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        importProjectJson(content);
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const currentActionName = historyStack[historyIndex]?.description || 'Idle';

  return (
    <header className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 z-30 select-none">
      {/* Hidden file input for opening PSD or project JSON */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".psd,.psb,.psdt,.pixycharm,.anything-project,.json"
        onChange={handleOpenProject}
        className="hidden"
      />

      {/* Left: App Identity & Title */}
      <div className="flex items-center gap-3">
        <AppLogo size={36} showText={true} />

        <div className="w-[1px] h-6 bg-neutral-800 mx-1" />

        <div className="flex flex-col">
          <input
            type="text"
            value={documentState.title}
            onChange={(e) => setDocumentState((p) => ({ ...p, title: e.target.value }))}
            className="text-xs font-medium text-neutral-300 hover:text-white bg-transparent border border-transparent hover:border-neutral-700 rounded px-1.5 py-0.5 transition-all focus:bg-neutral-950 focus:text-white focus:border-indigo-500 focus:outline-none max-w-[180px] truncate"
            title="Rename Document"
          />
        </div>

        <div className="w-[1px] h-6 bg-neutral-800 mx-2" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-colors ${
              canUndo
                ? 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                : 'text-neutral-600 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-colors ${
              canRedo
                ? 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                : 'text-neutral-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-neutral-500 font-mono ml-1 max-w-[140px] truncate hidden md:inline-block">
            {currentActionName}
          </span>
        </div>
      </div>

      {/* Center: Canvas Presets & Zoom */}
      <div className="flex items-center gap-2">
        {/* Canvas Dimension Preset Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPresetMenu(!showPresetMenu)}
            className="flex items-center gap-1.5 text-xs bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <span className="font-mono text-neutral-400">
              {documentState.width} × {documentState.height}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
          </button>

          {showPresetMenu && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1">
              <div className="text-[10px] font-semibold text-neutral-500 px-2 py-1 uppercase tracking-wider">
                Canvas Dimension Presets
              </div>
              {CANVAS_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setDimensions(p.width, p.height);
                    setShowPresetMenu(false);
                  }}
                  className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="font-mono text-[10px] text-neutral-500">
                    {p.width}×{p.height}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
          <button
            onClick={zoomOut}
            className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetZoom}
            className="px-2 text-xs font-mono text-neutral-300 hover:text-white font-medium"
            title="Reset Zoom (100%)"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={zoomIn}
            className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={fitToScreen}
            className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded ml-0.5"
            title="Fit to Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Templates, Evidence & Export */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowTemplatesModal(true)}
          className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Templates</span>
        </button>

        <button
          onClick={() => setShowEvidenceModal(true)}
          className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/30 px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Architecture Evidence</span>
        </button>

        <div className="w-[1px] h-6 bg-neutral-800 mx-1" />

        {/* Open Photoshop PSD / Project */}
        <button
          onClick={handleOpenClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-800 text-xs"
          title="Open Photoshop (.psd, .psb, .psdt) or Pixycharm Project"
        >
          <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline font-medium">Open PSD</span>
        </button>
        <button
          onClick={exportProjectJson}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          title="Save Pixycharm Project File (.pixycharm)"
        >
          <Save className="w-4 h-4" />
        </button>

        {/* Export High-Res Image / PSD Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md shadow-indigo-600/30 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-10 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-0.5">
              <button
                onClick={() => {
                  exportPsd();
                  setShowExportMenu(false);
                }}
                className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 hover:text-blue-200 transition-colors border border-blue-500/20"
              >
                <span className="font-semibold">Photoshop (.PSD)</span>
                <span className="text-[10px] text-blue-400 font-mono">Layers Preserved</span>
              </button>
              <div className="w-full h-[1px] bg-neutral-800 my-1" />
              <button
                onClick={() => {
                  downloadImage('png');
                  setShowExportMenu(false);
                }}
                className="flex items-center justify-between text-xs px-3 py-2 rounded-lg hover:bg-neutral-800 text-neutral-200 hover:text-white transition-colors"
              >
                <span>PNG Image</span>
                <span className="text-[10px] text-neutral-500">Lossless</span>
              </button>
              <button
                onClick={() => {
                  downloadImage('jpeg', 0.95);
                  setShowExportMenu(false);
                }}
                className="flex items-center justify-between text-xs px-3 py-2 rounded-lg hover:bg-neutral-800 text-neutral-200 hover:text-white transition-colors"
              >
                <span>JPEG Image</span>
                <span className="text-[10px] text-neutral-500">Compressed</span>
              </button>
              <button
                onClick={() => {
                  downloadImage('webp', 0.92);
                  setShowExportMenu(false);
                }}
                className="flex items-center justify-between text-xs px-3 py-2 rounded-lg hover:bg-neutral-800 text-neutral-200 hover:text-white transition-colors"
              >
                <span>WebP Image</span>
                <span className="text-[10px] text-neutral-500">Modern Web</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
