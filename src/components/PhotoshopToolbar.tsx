import React, { useState } from 'react';
import {
  Move,
  Crop,
  Paintbrush,
  Type,
  Square,
  Hand,
  ZoomIn,
  ChevronsRight,
  ChevronsLeft,
  Stamp,
  Eraser,
  PenTool,
  Pipette,
  MousePointer,
  Lasso,
  Wand2,
  Blend
} from 'lucide-react';
import { useStudio, ToolType } from '../context/StudioContext';

export const PhotoshopToolbar: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
    addTextLayer,
    addShapeLayer,
    brushColor,
    setBrushColor,
    zoomIn,
    activeShapeType
  } = useStudio();

  const [isTwoColumn, setIsTwoColumn] = useState<boolean>(false);
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');

  // Swap Foreground / Background colors (X key)
  const swapColors = () => {
    const temp = brushColor;
    setBrushColor(backgroundColor);
    setBackgroundColor(temp);
  };

  // Reset to Default Black / White (D key)
  const resetDefaultColors = () => {
    setBrushColor('#000000');
    setBackgroundColor('#ffffff');
  };

  const toolButton = (
    tool: ToolType,
    label: string,
    shortcut: string,
    icon: React.ReactNode,
    onClick?: () => void
  ) => {
    // Note: 'select' and 'move' both map to Move tool
    const isSelected = activeTool === tool || (tool === 'move' && activeTool === 'select');
    return (
      <button
        onClick={onClick || (() => setActiveTool(tool))}
        className={`w-7 h-7 flex items-center justify-center rounded-sm transition-all group relative ${
          isSelected
            ? 'bg-[#323232] text-white border border-[#4a4a4a] shadow-sm'
            : 'text-[#aaaaaa] hover:text-[#ffffff] hover:bg-[#323232]'
        }`}
        title={`${label} (${shortcut})`}
      >
        {icon}
      </button>
    );
  };

  return (
    <aside
      className={`bg-[#1e1e1e] border-r border-[#111111] flex flex-col items-center py-1 select-none z-40 transition-all font-sans ${
        isTwoColumn ? 'w-16' : 'w-9'
      }`}
    >
      {/* Photoshop Column Toggle Header (>> / <<) */}
      <div className="w-full flex justify-end px-1.5 pb-1 border-b border-[#2a2a2a] mb-1">
        <button
          onClick={() => setIsTwoColumn(!isTwoColumn)}
          className="text-[#888888] hover:text-white transition-colors p-0.5 rounded"
          title={isTwoColumn ? 'Collapse to 1 column' : 'Expand to 2 columns'}
        >
          {isTwoColumn ? <ChevronsLeft className="w-3 h-3" /> : <ChevronsRight className="w-3 h-3" />}
        </button>
      </div>

      {/* Standard Tools Container */}
      <div
        className={`flex flex-col gap-0.5 ${
          isTwoColumn ? 'grid grid-cols-2 gap-0.5 px-1' : 'items-center'
        }`}
      >
        {/* 1. Move Tool (V) */}
        {toolButton('move', 'Move Tool', 'V', <Move className="w-4 h-4" />, () => setActiveTool('move'))}

        {/* 2. Rectangular Marquee Tool (M) */}
        {toolButton(
          'marquee',
          'Rectangular Marquee Tool',
          'M',
          <div className="w-3.5 h-3.5 border border-dashed border-current" />
        )}

        {/* 3. Lasso Tool (L) */}
        {toolButton('lasso', 'Lasso Tool', 'L', <Lasso className="w-3.5 h-3.5" />)}

        {/* 4. Magic Wand Tool (W) */}
        {toolButton('magic-wand', 'Magic Wand Tool', 'W', <Wand2 className="w-3.5 h-3.5" />)}

        {/* 5. Crop Tool (C) */}
        {toolButton('crop', 'Crop Tool', 'C', <Crop className="w-4 h-4" />)}

        {/* 6. Eyedropper Tool (I) */}
        {toolButton('eyedropper', 'Eyedropper Tool', 'I', <Pipette className="w-3.5 h-3.5" />)}

        {/* 7. Brush Tool (B) */}
        {toolButton('brush', 'Brush Tool', 'B', <Paintbrush className="w-4 h-4" />)}

        {/* 8. Clone Stamp Tool (S) */}
        {toolButton('clone-stamp', 'Clone Stamp Tool', 'S', <Stamp className="w-3.5 h-3.5" />)}

        {/* 9. Eraser Tool (E) */}
        {toolButton('eraser', 'Eraser Tool', 'E', <Eraser className="w-3.5 h-3.5" />)}

        {/* 10. Gradient Tool (G) */}
        {toolButton('gradient', 'Gradient Tool', 'G', <Blend className="w-3.5 h-3.5" />)}

        {/* 11. Pen Tool (P) */}
        {toolButton('pen', 'Pen Tool', 'P', <PenTool className="w-3.5 h-3.5" />)}

        {/* 12. Text Tool (T) */}
        {toolButton('text', 'Horizontal Type Tool', 'T', <Type className="w-4 h-4" />, () => {
          setActiveTool('text');
          addTextLayer();
        })}

        {/* 13. Path Selection Tool (A) */}
        {toolButton('path-selection', 'Path Selection Tool', 'A', <MousePointer className="w-3.5 h-3.5" />)}

        {/* Shapes Helper Tool (U) */}
        {toolButton('shape', 'Rectangle Tool', 'U', <Square className="w-4 h-4" />, () => {
          setActiveTool('shape');
          addShapeLayer(activeShapeType);
        })}

        {/* 14. Hand Tool (H) */}
        {toolButton('hand', 'Hand Tool', 'H', <Hand className="w-4 h-4" />)}

        {/* 15. Zoom Tool (Z) */}
        {toolButton('zoom', 'Zoom Tool', 'Z', <ZoomIn className="w-4 h-4" />, () => {
          setActiveTool('zoom');
          zoomIn();
        })}
      </div>

      <div className="flex-1" />

      {/* Photoshop Signature Dual Foreground / Background Color Picker */}
      <div className="relative w-8 h-8 mb-2 flex items-center justify-center">
        {/* Reset Default Colors (Black & White mini icon - D key) */}
        <button
          onClick={resetDefaultColors}
          className="absolute -top-3 left-0 flex items-center group"
          title="Default Foreground and Background Colors (D)"
        >
          <div className="w-2 h-2 bg-black border border-white group-hover:scale-110" />
          <div className="w-2 h-2 bg-white border border-black -ml-1 -mt-1 group-hover:scale-110" />
        </button>

        {/* Swap Colors (Arrow icon - X key) */}
        <button
          onClick={swapColors}
          className="absolute -top-3 right-0 text-[#888] hover:text-white transition-colors text-[9px]"
          title="Switch Foreground and Background Colors (X)"
        >
          ⇄
        </button>

        {/* Background Color Square (Underneath) */}
        <label
          className="absolute bottom-0 right-0 w-4 h-4 border border-[#111] shadow cursor-pointer"
          style={{ backgroundColor: backgroundColor }}
          title="Set Background Color"
        >
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="hidden"
          />
        </label>

        {/* Foreground Color Square (On Top) */}
        <label
          className="absolute top-0 left-0 w-4 h-4 border border-[#ffffff] shadow-lg cursor-pointer z-10"
          style={{ backgroundColor: brushColor }}
          title="Set Foreground Color"
        >
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="hidden"
          />
        </label>
      </div>

      {/* Quick Mask Mode (Q) icon */}
      <div
        className="w-7 h-5 flex items-center justify-center border-t border-[#2a2a2a] pt-1 text-[#666] hover:text-[#aaa] cursor-pointer"
        title="Edit in Quick Mask Mode (Q)"
      >
        <div className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-current" />
        </div>
      </div>
    </aside>
  );
};
