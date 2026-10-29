import React, { useState, useEffect } from 'react';
import { useStudio } from '../context/StudioContext';
import { exportLayersToSvg, parseSvgToLayers } from '../engine/vectorEngine';
import { X, Copy, Check, Download, Play, Code, Sparkles } from 'lucide-react';

export const SvgCodeEditorModal: React.FC = () => {
  const {
    showSvgEditorModal,
    setShowSvgEditorModal,
    layers,
    documentState,
    setDocumentState,
    setLayers,
    exportSvgDocument,
    exportAiDocument
  } = useStudio();

  const [svgCode, setSvgCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync SVG code whenever modal is opened
  useEffect(() => {
    if (showSvgEditorModal) {
      const generated = exportLayersToSvg(
        layers,
        documentState.width,
        documentState.height,
        documentState.background
      );
      setSvgCode(generated);
      setError(null);
      setSuccessMsg(null);
    }
  }, [showSvgEditorModal, layers, documentState]);

  if (!showSvgEditorModal) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(svgCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleApplyChanges = () => {
    try {
      setError(null);
      const parsed = parseSvgToLayers(svgCode, documentState.width, documentState.height);
      setLayers(parsed.layers);
      setSuccessMsg('Canvas updated with your edited SVG markup successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to parse SVG markup. Please check syntax.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-[850px] max-w-[94vw] h-[640px] max-h-[90vh] bg-[#222222] border border-[#3e3e3e] rounded shadow-2xl flex flex-col text-[#cccccc] font-sans overflow-hidden">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#1b1b1b] border-b border-[#333333] select-none">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#ff9a00] text-black font-black text-[10px] flex items-center justify-center tracking-tighter">
              Ai
            </div>
            <span className="font-semibold text-[13px] text-white">Adobe Illustrator / SVG Code Inspector & Editor</span>
            <span className="text-[11px] text-[#888888] font-mono ml-2">
              {documentState.width} × {documentState.height} px
            </span>
          </div>
          <button
            onClick={() => setShowSvgEditorModal(false)}
            className="text-[#888888] hover:text-white p-1 hover:bg-[#333333] rounded transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#282828] border-b border-[#333333] text-[11px]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyChanges}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#ff9a00] hover:bg-[#e08900] text-black font-semibold rounded shadow transition-all active:scale-95"
              title="Apply SVG markup to live canvas"
            >
              <Play size={12} fill="currentColor" />
              <span>Apply to Canvas</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#323232] hover:bg-[#3a3a3a] text-white border border-[#444444] rounded transition-all"
              title="Copy SVG XML to clipboard"
            >
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              <span>{copied ? 'Copied!' : 'Copy SVG'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSvgDocument()}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#323232] hover:bg-[#3a3a3a] text-[#cccccc] hover:text-white border border-[#444444] rounded transition-all"
              title="Download standard SVG file"
            >
              <Download size={12} />
              <span>Export .SVG</span>
            </button>
            <button
              onClick={() => exportAiDocument()}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#323232] hover:bg-[#3a3a3a] text-[#ff9a00] border border-[#ff9a00]/40 rounded transition-all font-medium"
              title="Download Adobe Illustrator .AI file"
            >
              <Sparkles size={12} />
              <span>Export .AI</span>
            </button>
          </div>
        </div>

        {/* Feedback Banners */}
        {error && (
          <div className="bg-red-950/80 border-b border-red-800 text-red-200 px-4 py-1.5 text-[11px] flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white font-bold ml-2">×</button>
          </div>
        )}
        {successMsg && (
          <div className="bg-green-950/80 border-b border-green-800 text-green-200 px-4 py-1.5 text-[11px] flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="text-green-400 hover:text-white font-bold ml-2">×</button>
          </div>
        )}

        {/* Code Editor Body */}
        <div className="flex-1 flex flex-col p-3 bg-[#181818] overflow-hidden">
          <div className="flex items-center justify-between text-[11px] text-[#777777] mb-1.5 px-1 font-mono">
            <span className="flex items-center gap-1">
              <Code size={12} /> XML / SVG Vector Source
            </span>
            <span>UTF-8 • {svgCode.length} characters</span>
          </div>

          <textarea
            value={svgCode}
            onChange={(e) => setSvgCode(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full p-3 font-mono text-[12px] leading-relaxed bg-[#121212] border border-[#333333] rounded text-[#81c784] focus:outline-none focus:border-[#ff9a00] resize-none overflow-y-auto selection:bg-[#ff9a00]/30 selection:text-white"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#1b1b1b] border-t border-[#333333] text-[11px] text-[#888888]">
          <span>Compatible with Adobe Illustrator CC, Inkscape, Figma, and CorelDRAW</span>
          <button
            onClick={() => setShowSvgEditorModal(false)}
            className="px-4 py-1 bg-[#323232] hover:bg-[#3e3e3e] text-white rounded transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
