import React, { useState, useRef, useEffect } from 'react';
import { useStudio } from '../context/StudioContext';
import { Minus, Square as MaximizeIcon, X as CloseIcon, Check } from 'lucide-react';
import { AppLogo } from './AppLogo';

export const PhotoshopMenuBar: React.FC = () => {
  const {
    documentState,
    undo,
    redo,
    canUndo,
    canRedo,
    exportPsd,
    downloadImage,
    openPhotoshopFile,
    importProjectJson,
    exportProjectJson,
    addNewLayer,
    deleteLayer,
    duplicateLayer,
    selectedLayerId,
    bringToFront,
    sendToBack,
    setShowEvidenceModal,
    setShowTemplatesModal,
    resetZoom,
    zoomIn,
    zoomOut,
    fitToScreen,
    setShowCameraRawModal,
    setShowHueSatModal,
    setShowLevelsModal,
    setActiveTool,
    showNewDocModal,
    setShowNewDocModal
  } = useStudio();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const menuBarRef = useRef<HTMLDivElement | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Photoshop Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd) {
        const key = e.key.toLowerCase();
        if (key === 'o') {
          e.preventDefault();
          handleOpenNativeOrWeb();
        } else if (key === 's') {
          e.preventDefault();
          if (e.shiftKey) {
            exportPsd();
          } else {
            exportProjectJson();
          }
        } else if (key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (key === 'y') {
          e.preventDefault();
          redo();
        } else if (key === 't') {
          e.preventDefault();
          setShowTemplatesModal(true);
        } else if (key === 'n') {
          e.preventDefault();
          if (e.shiftKey) {
            addNewLayer();
          } else {
            setShowNewDocModal(true);
          }
        } else if (key === '=' || key === '+') {
          e.preventDefault();
          zoomIn();
        } else if (key === '-') {
          e.preventDefault();
          zoomOut();
        } else if (key === '0') {
          e.preventDefault();
          fitToScreen();
        }
        return;
      }

      if (!isInput) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (selectedLayerId) {
            e.preventDefault();
            deleteLayer(selectedLayerId);
          }
        } else {
          const k = e.key.toLowerCase();
          switch (k) {
            case 'v': setActiveTool('move'); break;
            case 'm': setActiveTool('marquee'); break;
            case 'l': setActiveTool('lasso'); break;
            case 'w': setActiveTool('magic-wand'); break;
            case 'c': setActiveTool('crop'); break;
            case 'i': setActiveTool('eyedropper'); break;
            case 'b': setActiveTool('brush'); break;
            case 's': setActiveTool('clone-stamp'); break;
            case 'e': setActiveTool('eraser'); break;
            case 'g': setActiveTool('gradient'); break;
            case 'p': setActiveTool('pen'); break;
            case 't': setActiveTool('text'); break;
            case 'u': setActiveTool('shape'); break;
            case 'h': setActiveTool('hand'); break;
            case 'z': setActiveTool('zoom'); break;
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedLayerId, undo, redo, exportPsd, exportProjectJson, addNewLayer, deleteLayer, zoomIn, zoomOut, fitToScreen, setActiveTool, setShowTemplatesModal]);

  const handleOpenNativeOrWeb = async () => {
    setActiveMenu(null);
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

  const handleWebFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

  return (
    <div
      ref={menuBarRef}
      className="h-8 bg-[#1e1e1e] text-[#cccccc] text-[12px] flex items-center justify-between px-2 select-none border-b border-[#111111] z-50 font-sans"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".psd,.psb,.psdt,.pixycharm,.anything-project,.json,image/*"
        onChange={handleWebFileChange}
        className="hidden"
      />

      {/* Left: Custom Branding (Logo + App Name) + Photoshop Menus */}
      <div className="flex items-center">
        {/* Pre-provided Pixelcharm Brand Logo & Workspace Name */}
        <div
          onClick={() => setShowEvidenceModal(true)}
          className="flex items-center gap-1.5 mr-3 pr-2.5 border-r border-[#2d2d2d] cursor-pointer hover:opacity-90 transition-opacity"
          title="Pixelcharm Studio — Creative Canvas & Photo Magic"
        >
          <AppLogo size={20} showText={false} />
          <span className="font-semibold text-[13px] tracking-tight text-white">Pixelcharm</span>
          <div className="w-4 h-4 bg-[#001e36] border border-[#00a4e4] rounded flex items-center justify-center font-bold text-[8px] text-[#00a4e4] ml-1 shadow-sm">
            Ps
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex items-center">
          {/* FILE MENU */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'File' ? null : 'File')}
              onMouseEnter={() => activeMenu && setActiveMenu('File')}
              className={`px-2.5 py-1 rounded-sm hover:bg-[#3f3f3f] hover:text-white transition-colors ${
                activeMenu === 'File' ? 'bg-[#3f3f3f] text-white' : ''
              }`}
            >
              File
            </button>
            {activeMenu === 'File' && (
              <div className="absolute left-0 top-7 w-60 bg-[#2b2b2b] border border-[#1c1c1c] shadow-2xl py-1 z-50 text-[11px] rounded-sm">
                <button
                  onClick={() => {
                    setShowNewDocModal(true);
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left font-medium"
                >
                  <span>New...</span>
                  <span className="text-[#888] font-mono">Ctrl+N</span>
                </button>
                <button
                  onClick={handleOpenNativeOrWeb}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left"
                >
                  <span>Open Photoshop (.psd, .psb)...</span>
                  <span className="text-[#888] font-mono">Ctrl+O</span>
                </button>
                <button
                  onClick={() => {
                    setShowTemplatesModal(true);
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left"
                >
                  <span>Browse Templates (Canva)...</span>
                  <span className="text-[#888] font-mono">Ctrl+T</span>
                </button>
                <div className="h-[1px] bg-[#3a3a3a] my-1" />
                <button
                  onClick={() => {
                    exportProjectJson();
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left"
                >
                  <span>Save Project File</span>
                  <span className="text-[#888] font-mono">Ctrl+S</span>
                </button>
                <button
                  onClick={() => {
                    exportPsd();
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left font-medium"
                >
                  <span>Export Photoshop (.PSD)...</span>
                  <span className="text-[#888] font-mono">Ctrl+Shift+S</span>
                </button>
                <div className="h-[1px] bg-[#3a3a3a] my-1" />
                <button
                  onClick={() => {
                    downloadImage('png');
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left"
                >
                  <span>Quick Export as PNG</span>
                  <span className="text-[#888] font-mono">Ctrl+Alt+W</span>
                </button>
                <button
                  onClick={() => {
                    downloadImage('jpeg', 0.95);
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left"
                >
                  <span>Export as JPEG...</span>
                </button>
                <button
                  onClick={() => {
                    downloadImage('webp', 0.92);
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left"
                >
                  <span>Export as WebP...</span>
                </button>
              </div>
            )}
          </div>

          {/* EDIT MENU */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'Edit' ? null : 'Edit')}
              onMouseEnter={() => activeMenu && setActiveMenu('Edit')}
              className={`px-2.5 py-1 rounded-sm hover:bg-[#3f3f3f] hover:text-white transition-colors ${
                activeMenu === 'Edit' ? 'bg-[#3f3f3f] text-white' : ''
              }`}
            >
              Edit
            </button>
            {activeMenu === 'Edit' && (
              <div className="absolute left-0 top-7 w-52 bg-[#2b2b2b] border border-[#1c1c1c] shadow-2xl py-1 z-50 text-[11px] rounded-sm">
                <button
                  onClick={() => {
                    undo();
                    setActiveMenu(null);
                  }}
                  disabled={!canUndo}
                  className={`w-full px-4 py-1.5 flex justify-between text-left ${
                    canUndo ? 'hover:bg-[#007acc] hover:text-white text-[#ddd]' : 'text-[#666] cursor-not-allowed'
                  }`}
                >
                  <span>Undo</span>
                  <span className="text-[#888] font-mono">Ctrl+Z</span>
                </button>
                <button
                  onClick={() => {
                    redo();
                    setActiveMenu(null);
                  }}
                  disabled={!canRedo}
                  className={`w-full px-4 py-1.5 flex justify-between text-left ${
                    canRedo ? 'hover:bg-[#007acc] hover:text-white text-[#ddd]' : 'text-[#666] cursor-not-allowed'
                  }`}
                >
                  <span>Redo</span>
                  <span className="text-[#888] font-mono">Ctrl+Y</span>
                </button>
                <div className="h-[1px] bg-[#3a3a3a] my-1" />
                <button
                  onClick={() => {
                    if (selectedLayerId) duplicateLayer(selectedLayerId);
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left"
                >
                  <span>Duplicate Layer</span>
                  <span className="text-[#888] font-mono">Ctrl+D</span>
                </button>
                <button
                  onClick={() => {
                    if (selectedLayerId) deleteLayer(selectedLayerId);
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left text-red-400"
                >
                  <span>Delete Layer</span>
                  <span className="text-[#888] font-mono">Del</span>
                </button>
              </div>
            )}
          </div>

          {/* IMAGE MENU */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'Image' ? null : 'Image')}
              onMouseEnter={() => activeMenu && setActiveMenu('Image')}
              className={`px-2.5 py-1 rounded-sm hover:bg-[#3f3f3f] hover:text-white transition-colors ${
                activeMenu === 'Image' ? 'bg-[#3f3f3f] text-white' : ''
              }`}
            >
              Image
            </button>
            {activeMenu === 'Image' && (
              <div className="absolute left-0 top-7 w-60 bg-[#2b2b2b] border border-[#1c1c1c] shadow-2xl py-1 z-50 text-[11px] rounded-sm">
                <div className="px-4 py-1 text-[#888] font-semibold text-[10px] uppercase">
                  Adjustments
                </div>
                <button
                  onClick={() => {
                    setShowLevelsModal(true);
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left"
                >
                  <span>Levels...</span>
                  <span className="text-[#888] font-mono">Ctrl+L</span>
                </button>
                <button
                  onClick={() => {
                    setShowHueSatModal(true);
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left"
                >
                  <span>Hue/Saturation...</span>
                  <span className="text-[#888] font-mono">Ctrl+U</span>
                </button>
                <div className="h-[1px] bg-[#3a3a3a] my-1" />
                <div className="px-4 py-1 text-[#888] font-semibold text-[10px] uppercase">
                  Color Mode: RGB Color / 8 Bit
                </div>
                <div className="px-4 py-1 text-[#888] font-semibold text-[10px] uppercase">
                  Canvas Size: {documentState.width} × {documentState.height} px
                </div>
              </div>
            )}
          </div>

          {/* FILTER MENU (Camera Raw) */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'Filter' ? null : 'Filter')}
              onMouseEnter={() => activeMenu && setActiveMenu('Filter')}
              className={`px-2.5 py-1 rounded-sm hover:bg-[#3f3f3f] hover:text-white transition-colors ${
                activeMenu === 'Filter' ? 'bg-[#3f3f3f] text-white' : ''
              }`}
            >
              Filter
            </button>
            {activeMenu === 'Filter' && (
              <div className="absolute left-0 top-7 w-64 bg-[#2b2b2b] border border-[#1c1c1c] shadow-2xl py-1 z-50 text-[11px] rounded-sm">
                <button
                  onClick={() => {
                    setShowCameraRawModal(true);
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left font-medium text-white"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00a4e4]" />
                    <span>Camera Raw Filter...</span>
                  </span>
                  <span className="text-[#888] font-mono">Ctrl+Shift+A</span>
                </button>
                <div className="h-[1px] bg-[#3a3a3a] my-1" />
                <div className="px-4 py-1 text-[#888] font-semibold text-[10px] uppercase">
                  Blur & Sharpen
                </div>
                <button
                  onClick={() => {
                    setShowCameraRawModal(true);
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left"
                >
                  <span>Gaussian Blur & Sharpen...</span>
                </button>
              </div>
            )}
          </div>

          {/* LAYER MENU */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'Layer' ? null : 'Layer')}
              onMouseEnter={() => activeMenu && setActiveMenu('Layer')}
              className={`px-2.5 py-1 rounded-sm hover:bg-[#3f3f3f] hover:text-white transition-colors ${
                activeMenu === 'Layer' ? 'bg-[#3f3f3f] text-white' : ''
              }`}
            >
              Layer
            </button>
            {activeMenu === 'Layer' && (
              <div className="absolute left-0 top-7 w-52 bg-[#2b2b2b] border border-[#1c1c1c] shadow-2xl py-1 z-50 text-[11px] rounded-sm">
                <button
                  onClick={() => {
                    if (selectedLayerId) bringToFront(selectedLayerId);
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left"
                >
                  <span>Bring to Front</span>
                  <span className="text-[#888] font-mono">Ctrl+Shift+]</span>
                </button>
                <button
                  onClick={() => {
                    if (selectedLayerId) sendToBack(selectedLayerId);
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left"
                >
                  <span>Send to Back</span>
                  <span className="text-[#888] font-mono">Ctrl+Shift+[</span>
                </button>
              </div>
            )}
          </div>

          {/* VIEW MENU */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'View' ? null : 'View')}
              onMouseEnter={() => activeMenu && setActiveMenu('View')}
              className={`px-2.5 py-1 rounded-sm hover:bg-[#3f3f3f] hover:text-white transition-colors ${
                activeMenu === 'View' ? 'bg-[#3f3f3f] text-white' : ''
              }`}
            >
              View
            </button>
            {activeMenu === 'View' && (
              <div className="absolute left-0 top-7 w-52 bg-[#2b2b2b] border border-[#1c1c1c] shadow-2xl py-1 z-50 text-[11px] rounded-sm">
                <button
                  onClick={() => {
                    zoomIn();
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left"
                >
                  <span>Zoom In</span>
                  <span className="text-[#888] font-mono">Ctrl++</span>
                </button>
                <button
                  onClick={() => {
                    zoomOut();
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left"
                >
                  <span>Zoom Out</span>
                  <span className="text-[#888] font-mono">Ctrl+-</span>
                </button>
                <button
                  onClick={() => {
                    fitToScreen();
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left"
                >
                  <span>Fit on Screen</span>
                  <span className="text-[#888] font-mono">Ctrl+0</span>
                </button>
                <button
                  onClick={() => {
                    resetZoom();
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left"
                >
                  <span>100% Actual Pixels</span>
                  <span className="text-[#888] font-mono">Ctrl+1</span>
                </button>
              </div>
            )}
          </div>

          {/* WINDOW MENU */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'Window' ? null : 'Window')}
              onMouseEnter={() => activeMenu && setActiveMenu('Window')}
              className={`px-2.5 py-1 rounded-sm hover:bg-[#323232] hover:text-white transition-colors ${
                activeMenu === 'Window' ? 'bg-[#323232] text-white' : ''
              }`}
            >
              Window
            </button>
            {activeMenu === 'Window' && (
              <div className="absolute left-0 top-7 w-56 bg-[#1e1e1e] border border-[#111111] shadow-2xl py-1 z-50 text-[11px] rounded-sm text-[#cccccc]">
                <div className="px-3 py-1 text-[10px] text-[#777] uppercase tracking-wider font-semibold">Workspace Panels</div>
                <div className="px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00a4e4]" />
                    <span>Layers</span>
                  </div>
                  <span className="text-[#888] font-mono">F7</span>
                </div>
                <div className="px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00a4e4]" />
                    <span>History</span>
                  </div>
                </div>
                <div className="px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00a4e4]" />
                    <span>Color / Swatches</span>
                  </div>
                  <span className="text-[#888] font-mono">F6</span>
                </div>
                <div className="px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00a4e4]" />
                    <span>Adjustments</span>
                  </div>
                </div>
                <div className="px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00a4e4]" />
                    <span>Properties</span>
                  </div>
                </div>
                <div className="h-[1px] bg-[#2a2a2a] my-1" />
                <div className="px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00a4e4]" />
                    <span>Tools</span>
                  </div>
                </div>
                <div className="px-3 py-1.5 flex items-center justify-between hover:bg-[#007acc] hover:text-white cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00a4e4]" />
                    <span>Options Bar</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* HELP MENU */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'Help' ? null : 'Help')}
              onMouseEnter={() => activeMenu && setActiveMenu('Help')}
              className={`px-2.5 py-1 rounded-sm hover:bg-[#3f3f3f] hover:text-white transition-colors ${
                activeMenu === 'Help' ? 'bg-[#3f3f3f] text-white' : ''
              }`}
            >
              Help
            </button>
            {activeMenu === 'Help' && (
              <div className="absolute left-0 top-7 w-64 bg-[#2b2b2b] border border-[#1c1c1c] shadow-2xl py-1 z-50 text-[11px] rounded-sm">
                <button
                  onClick={() => {
                    setShowEvidenceModal(true);
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-1.5 flex justify-between hover:bg-[#007acc] hover:text-white text-left"
                >
                  <span>Photoshop & Canva Architecture Evidence</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center: Active Document Title */}
      <div className="text-[11px] text-[#888] font-medium hidden md:block">
        Pixelcharm Masterpiece — Adobe Photoshop Workspace
      </div>

      {/* Right: Workspace & Window Controls */}
      <div className="flex items-center gap-3">
        {/* Workspace Switcher */}
        <div className="flex items-center gap-1.5 text-[11px] bg-[#222222] px-2 py-0.5 rounded border border-[#383838]">
          <span className="text-[#aaa]">Workspace:</span>
          <span className="text-white font-medium">Essentials (Default)</span>
        </div>

        {/* Electron Window Controls (if running on desktop) */}
        {typeof window !== 'undefined' && window.electronAPI && (
          <div className="flex items-center gap-0.5 ml-2 -mr-1">
            <button
              onClick={() => window.electronAPI?.minimizeWindow()}
              className="p-1.5 hover:bg-[#3f3f3f] text-[#aaa] hover:text-white rounded transition-colors"
              title="Minimize"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => window.electronAPI?.maximizeWindow()}
              className="p-1.5 hover:bg-[#3f3f3f] text-[#aaa] hover:text-white rounded transition-colors"
              title="Maximize"
            >
              <MaximizeIcon className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={() => window.electronAPI?.closeWindow()}
              className="p-1.5 hover:bg-red-600 text-[#aaa] hover:text-white rounded transition-colors"
              title="Close"
            >
              <CloseIcon className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
