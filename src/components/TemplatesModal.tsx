import React from 'react';
import { X, Sparkles, LayoutTemplate, ArrowRight } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { DESIGN_TEMPLATES } from '../constants/templates';

export const TemplatesModal: React.FC = () => {
  const { showTemplatesModal, setShowTemplatesModal, loadTemplate } = useStudio();

  if (!showTemplatesModal) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-6 select-none animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <LayoutTemplate className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Canva Template Presets</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                  Instant Scenegraph
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Choose a pre-composed template with nested vector layers, typography, and styling.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowTemplatesModal(false)}
            className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {DESIGN_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-neutral-950 border border-neutral-800/80 rounded-xl overflow-hidden hover:border-indigo-500/50 hover:shadow-xl transition-all flex flex-col group"
            >
              {/* Preview Thumbnail Box */}
              <div
                className="h-40 w-full flex items-center justify-center relative p-4"
                style={{ backgroundColor: tpl.background }}
              >
                <div className="border border-white/20 rounded-lg p-3 w-full h-full flex flex-col justify-center items-center text-center">
                  <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-1">
                    {tpl.category}
                  </span>
                  <span className="text-white font-bold text-sm tracking-tight drop-shadow">
                    {tpl.name}
                  </span>
                  <span className="text-white/60 text-[10px] font-mono mt-1">
                    {tpl.width} × {tpl.height}px
                  </span>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {tpl.layers.length} Layers
                  </span>
                  <button
                    onClick={() => loadTemplate(tpl.id)}
                    className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
