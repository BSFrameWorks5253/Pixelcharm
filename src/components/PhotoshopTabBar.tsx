import React from 'react';
import { useStudio } from '../context/StudioContext';
import { X, Plus } from 'lucide-react';

export const PhotoshopTabBar: React.FC = () => {
  const { documentState, zoom, resetZoom } = useStudio();

  return (
    <div className="h-7 bg-[#1e1e1e] border-b border-[#111111] flex items-center px-2 select-none text-[11px] gap-1 z-30 font-sans">
      {/* Active Document Tab (matches #262626 workspace background) */}
      <div className="flex items-center gap-2 bg-[#262626] text-white px-3 py-1 rounded-t border-t border-l border-r border-[#323232] border-b-transparent shadow-sm">
        <span className="font-medium truncate max-w-[200px]">
          {documentState.title.endsWith('.psd') ? documentState.title : `${documentState.title}.psd`}
        </span>
        <span className="text-[#888888] font-mono text-[10px]">
          @{Math.round(zoom * 100)}% (RGB/8#)
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            resetZoom();
          }}
          className="p-0.5 hover:bg-[#323232] rounded text-[#888888] hover:text-white transition-colors"
          title="Reset Zoom"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* New Tab Button */}
      <button
        className="p-1 hover:bg-[#323232] text-[#888888] hover:text-white rounded transition-colors"
        title="New Document"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
};
