import React from 'react';
import { useStudio } from '../context/StudioContext';

export const PhotoshopRulers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { zoom, mouseCoords } = useStudio();

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative bg-[#262626]">
      {/* Top Horizontal Ruler */}
      <div className="h-4 bg-[#1e1e1e] border-b border-[#111111] flex items-center text-[8px] font-mono text-[#888888] select-none pl-4 overflow-hidden relative z-20">
        {/* Origin Corner Box */}
        <div className="absolute left-0 top-0 w-4 h-4 bg-[#262626] border-r border-b border-[#111111] z-30 flex items-center justify-center text-[7px] text-[#555555]">
          px
        </div>

        {/* Ruler Tick Marks */}
        <div className="flex items-center" style={{ transform: `scale(${zoom})`, transformOrigin: 'left center' }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="w-[100px] flex-shrink-0 border-l border-[#444444] pl-1 relative h-3 flex items-center">
              <span className="font-mono text-[7px] text-[#999999]">{i * 100}</span>
              {/* 50px tick */}
              <div className="absolute left-[50px] top-1.5 h-1.5 w-[1px] bg-[#3a3a3a]" />
              {/* 25px & 75px sub-ticks */}
              <div className="absolute left-[25px] top-2 h-1 w-[1px] bg-[#2a2a2a]" />
              <div className="absolute left-[75px] top-2 h-1 w-[1px] bg-[#2a2a2a]" />
            </div>
          ))}
        </div>

        {/* Live Mouse Tracking Cursor Tick (Top Ruler) */}
        {mouseCoords.x > 0 && (
          <div
            className="absolute top-0 bottom-0 w-[1.5px] bg-[#00a4e4] z-40 pointer-events-none shadow-[0_0_4px_#00a4e4]"
            style={{ left: Math.max(16, 16 + mouseCoords.x * zoom) }}
          />
        )}
      </div>

      {/* Main Area with Left Vertical Ruler + Canvas Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Vertical Ruler */}
        <div className="w-4 bg-[#1e1e1e] border-r border-[#111111] flex flex-col text-[8px] font-mono text-[#888888] select-none overflow-hidden relative z-20">
          <div className="flex flex-col" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="h-[100px] flex-shrink-0 border-t border-[#444444] pt-0.5 relative flex justify-center">
                <span className="[writing-mode:vertical-rl] rotate-180 text-[7px] text-[#999999]">{i * 100}</span>
                {/* 50px tick */}
                <div className="absolute top-[50px] left-1.5 w-1.5 h-[1px] bg-[#3a3a3a]" />
                {/* 25px & 75px sub-ticks */}
                <div className="absolute top-[25px] left-2 w-1 h-[1px] bg-[#2a2a2a]" />
                <div className="absolute top-[75px] left-2 w-1 h-[1px] bg-[#2a2a2a]" />
              </div>
            ))}
          </div>

          {/* Live Mouse Tracking Cursor Tick (Left Ruler) */}
          {mouseCoords.y > 0 && (
            <div
              className="absolute left-0 right-0 h-[1.5px] bg-[#00a4e4] z-40 pointer-events-none shadow-[0_0_4px_#00a4e4]"
              style={{ top: mouseCoords.y * zoom }}
            />
          )}
        </div>

        {/* The Central Canvas Workspace */}
        <div className="flex-1 relative overflow-hidden flex flex-col bg-[#262626]">
          {children}
        </div>
      </div>
    </div>
  );
};
