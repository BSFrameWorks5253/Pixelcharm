import React from 'react';

interface FilterSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  defaultValue?: number;
  onChange: (val: number) => void;
}

export const FilterSlider: React.FC<FilterSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  defaultValue = 0,
  onChange
}) => {
  return (
    <div className="flex flex-col gap-1 text-xs">
      <div className="flex justify-between items-center text-neutral-400">
        <span
          className="font-medium cursor-pointer hover:text-indigo-400 transition-colors"
          title="Double-click to reset"
          onDoubleClick={() => onChange(defaultValue)}
        >
          {label}
        </span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-12 bg-neutral-900 border border-neutral-800 rounded px-1.5 py-0.5 text-right text-neutral-200 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
          />
          <span className="text-neutral-500 text-[10px] w-3">{unit}</span>
        </div>
      </div>
      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
        />
        {/* Center notch for bi-directional sliders (e.g. -100 to +100) */}
        {min < 0 && max > 0 && (
          <div
            className="absolute left-1/2 -translate-x-1/2 w-0.5 h-2 bg-neutral-600 pointer-events-none rounded"
            title="Center 0"
          />
        )}
      </div>
    </div>
  );
};
