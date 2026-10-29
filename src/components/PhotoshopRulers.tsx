import React from 'react';
import { useStudio } from '../context/StudioContext';

export const PhotoshopRulers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { zoom } = useStudio();

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative bg-[#262626]">
      {/* Top Horizontal Ruler */}
      <div className="h-4 bg-[#1e1e1e] border-b border-[#111111] flex items-center text-[8px] font-mono text-[#888888] select-none pl-4 overflow-hidden relative z-20">
        <div className="absolute left-0 top-0 w-4 h-4 bg-[#262626] border-r border-b border-[#111111] z-30" />
        <div className="flex items-center" style={{ transform: `scale(${zoom})`, transformOrigin: 'left center' }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="w-[100px] flex-shrink-0 border-l border-[#3a3a3a] pl-1 relative h-3 flex items-center">
              <span>{i * 100}</span>
              <div className="absolute left-[50px] top-1.5 h-1.5 w-[1px] bg-[#333333]" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Area with Left Vertical Ruler + Canvas Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Vertical Ruler */}
        <div className="w-4 bg-[#1e1e1e] border-r border-[#111111] flex flex-col text-[8px] font-mono text-[#888888] select-none overflow-hidden relative z-20">
          <div className="flex flex-col" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="h-[100px] flex-shrink-0 border-t border-[#3a3a3a] pt-0.5 relative flex justify-center">
                <span className="[writing-mode:vertical-rl] rotate-180 text-[7px]">{i * 100}</span>
                <div className="absolute top-[50px] left-1.5 w-1.5 h-[1px] bg-[#333333]" />
              </div>
            ))}
          </div>
        </div>

        {/* The Central Canvas Workspace */}
        <div className="flex-1 relative overflow-hidden flex flex-col bg-[#262626]">
          {children}
        </div>
      </div>
    </div>
  );
};
