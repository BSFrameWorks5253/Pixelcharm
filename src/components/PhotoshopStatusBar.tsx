import React from 'react';
import { useStudio } from '../context/StudioContext';

export const PhotoshopStatusBar: React.FC = () => {
  const { zoom, setZoom, documentState, activeTool, selectedLayer, mouseCoords } = useStudio();

  return (
    <div className="h-6 bg-[#1e1e1e] border-t border-[#111111] text-[#888888] text-[10px] font-mono flex items-center justify-between px-3 select-none z-30">
      {/* Left: Zoom Control & Document Resolution */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1 bg-[#262626] px-1.5 py-0.5 rounded-xs border border-[#333333]">
          <input
            type="number"
            min={10}
            max={500}
            value={Math.round(zoom * 100)}
            onChange={(e) => setZoom(Number(e.target.value) / 100)}
            className="w-8 bg-transparent text-white text-right focus:outline-none"
          />
          <span className="text-[#666666]">%</span>
        </div>
        <div className="h-3 w-[1px] bg-[#333333]" />
        <span>Doc: {documentState.width} px × {documentState.height} px (72 ppi)</span>
      </div>

      {/* Center: Live Mouse Coordinates on Canvas (X: / Y:) */}
      <div className="flex items-center gap-2 bg-[#262626] px-2.5 py-0.5 rounded-xs border border-[#333333] text-white">
        <span className="text-[#aaaaaa]">X:</span>
        <span className="w-10 text-right">{mouseCoords.x} px</span>
        <div className="h-3 w-[1px] bg-[#444444]" />
        <span className="text-[#aaaaaa]">Y:</span>
        <span className="w-10 text-right">{mouseCoords.y} px</span>
      </div>

      {/* Right: Selected Layer Status & Tool Hint */}
      <div className="flex items-center gap-3">
        {selectedLayer && (
          <span className="text-[#00a4e4] truncate max-w-[150px]">
            Layer: {selectedLayer.name}
          </span>
        )}
        <div className="h-3 w-[1px] bg-[#333333]" />
        <span className="capitalize">{activeTool} Tool Active</span>
        <div className="h-3 w-[1px] bg-[#333333]" />
        <span className="text-[#666666]">sRGB IEC61966-2.1 (8bpc)</span>
      </div>
    </div>
  );
};
