import React, { useEffect, useRef, useState } from 'react';
import { HistogramData, computeHistogram } from '../engine/histogram';
import { ImageLayer } from '../types';

interface HistogramWidgetProps {
  layer: ImageLayer | null;
}

export const HistogramWidget: React.FC<HistogramWidgetProps> = ({ layer }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [channelMode, setChannelMode] = useState<'rgb' | 'luma' | 'r' | 'g' | 'b'>('rgb');
  const [histData, setHistData] = useState<HistogramData | null>(null);

  useEffect(() => {
    if (!layer || layer.type !== 'image' || !layer.src) {
      setHistData(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = layer.src;

    img.onload = () => {
      // Create off-screen canvas to sample pixels
      const sampleCanvas = document.createElement('canvas');
      const ctx = sampleCanvas.getContext('2d');
      if (!ctx) return;

      // Downsample to max 300x300 for ultra-fast 60fps responsiveness
      const w = Math.min(250, img.naturalWidth || 250);
      const h = Math.min(250, img.naturalHeight || 250);
      sampleCanvas.width = w;
      sampleCanvas.height = h;

      ctx.drawImage(img, 0, 0, w, h);
      try {
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = computeHistogram(imgData);
        setHistData(data);
      } catch (err) {
        console.warn('Histogram sampling failed:', err);
      }
    };
  }, [layer?.src, layer?.adjustments]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !histData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw background grid lines
    ctx.strokeStyle = '#262626';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += w / 4) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    const drawCurve = (bins: number[], maxVal: number, strokeColor: string, fillColor: string) => {
      ctx.beginPath();
      ctx.moveTo(0, h);

      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * w;
        const normalized = maxVal > 0 ? bins[i] / maxVal : 0;
        const y = h - normalized * (h - 4);
        ctx.lineTo(x, y);
      }

      ctx.lineTo(w, h);
      ctx.closePath();

      ctx.fillStyle = fillColor;
      ctx.fill();

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    };

    if (channelMode === 'rgb') {
      ctx.globalCompositeOperation = 'screen';
      drawCurve(histData.r, histData.maxR, '#ef4444', 'rgba(239, 68, 68, 0.25)');
      drawCurve(histData.g, histData.maxG, '#22c55e', 'rgba(34, 197, 94, 0.25)');
      drawCurve(histData.b, histData.maxB, '#3b82f6', 'rgba(59, 130, 246, 0.25)');
      ctx.globalCompositeOperation = 'source-over';
    } else if (channelMode === 'luma') {
      drawCurve(histData.luma, histData.maxLuma, '#e2e8f0', 'rgba(226, 232, 240, 0.2)');
    } else if (channelMode === 'r') {
      drawCurve(histData.r, histData.maxR, '#ef4444', 'rgba(239, 68, 68, 0.35)');
    } else if (channelMode === 'g') {
      drawCurve(histData.g, histData.maxG, '#22c55e', 'rgba(34, 197, 94, 0.35)');
    } else if (channelMode === 'b') {
      drawCurve(histData.b, histData.maxB, '#3b82f6', 'rgba(59, 130, 246, 0.35)');
    }
  }, [histData, channelMode]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-neutral-300">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>Photoshop Histogram</span>
        </div>
        <div className="flex bg-neutral-950 p-0.5 rounded border border-neutral-800 text-[10px]">
          {(['rgb', 'luma', 'r', 'g', 'b'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setChannelMode(mode)}
              className={`px-1.5 py-0.5 rounded uppercase font-mono font-medium transition-colors ${
                channelMode === mode
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full h-24 bg-neutral-950 rounded border border-neutral-800/80 overflow-hidden flex items-center justify-center">
        {histData ? (
          <canvas
            ref={canvasRef}
            width={240}
            height={96}
            className="w-full h-full object-fill"
          />
        ) : (
          <span className="text-[11px] text-neutral-600">Select an image to view RGB histogram</span>
        )}
      </div>

      {histData && (
        <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono px-0.5">
          <span>Mean Luma: {histData.meanLuma} / 255</span>
          <span>Sampled: {(histData.totalPixels / 1000).toFixed(1)}k px</span>
        </div>
      )}
    </div>
  );
};
