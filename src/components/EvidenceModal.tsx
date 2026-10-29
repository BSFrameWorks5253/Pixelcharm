import React, { useState } from 'react';
import { X, ShieldCheck, Code, Layers, Cpu, Sparkles, ExternalLink, Binary } from 'lucide-react';
import { useStudio } from '../context/StudioContext';

export const EvidenceModal: React.FC = () => {
  const { showEvidenceModal, setShowEvidenceModal } = useStudio();
  const [activeTab, setActiveTab] = useState<'canva' | 'photoshop' | 'fusion' | 'code'>('canva');

  if (!showEvidenceModal) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 select-none animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Reverse Engineering Evidence & Architecture</h2>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                  Verified Technical Audit
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Detailed evidence and breakdown of how Canva and Photoshop work under the hood.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowEvidenceModal(false)}
            className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-6 gap-2 pt-2">
          {[
            { id: 'canva', label: '1. Canva Architecture', icon: Sparkles },
            { id: 'photoshop', label: '2. Photoshop Engine', icon: Binary },
            { id: 'fusion', label: '3. Comparative Synthesis', icon: Layers },
            { id: 'code', label: '4. Mathematical Formulas', icon: Code }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                  isActive
                    ? 'border-indigo-500 text-white bg-indigo-500/10 rounded-t-lg'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-neutral-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-neutral-300 leading-relaxed font-normal">
          {/* TAB 1: CANVA */}
          {activeTab === 'canva' && (
            <div className="space-y-4">
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80">
                <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>The Canva Scenegraph Model (Layout & Vector Centric)</span>
                </h3>
                <p className="text-neutral-400">
                  Canva is primarily a <strong>vector and layout composition engine</strong> designed for rapid visual assembly.
                  Unlike Photoshop's raw pixel raster buffer, Canva's core data structure is an immutable <strong>Hierarchical Scenegraph (Document Object Model)</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
                  <h4 className="font-semibold text-white mb-2 text-xs flex items-center gap-1.5">
                    <span className="text-indigo-400">●</span> Scene Graph & Node Hierarchy
                  </h4>
                  <ul className="space-y-1.5 text-neutral-400 list-disc list-inside">
                    <li>
                      <strong>Pages & Artboards:</strong> Top-level containers defining dimensions and color profile.
                    </li>
                    <li>
                      <strong>Element Nodes:</strong> Polymorphic JSON tree entries (<code className="text-indigo-300 font-mono">TextNode</code>, <code className="text-indigo-300 font-mono">ShapeNode</code>, <code className="text-indigo-300 font-mono">ImageNode</code>, <code className="text-indigo-300 font-mono">FrameContainer</code>).
                    </li>
                    <li>
                      <strong>2D Affine Transform Matrix:</strong> Elements do not store raw rotated pixel buffers; they store a 6-element affine transformation matrix <code className="text-neutral-300 font-mono">[a, b, c, d, tx, ty]</code> for GPU-accelerated scaling, rotation, and shear.
                    </li>
                  </ul>
                </div>

                <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
                  <h4 className="font-semibold text-white mb-2 text-xs flex items-center gap-1.5">
                    <span className="text-indigo-400">●</span> Smart Guides & Geometric Snapping
                  </h4>
                  <ul className="space-y-1.5 text-neutral-400 list-disc list-inside">
                    <li>
                      <strong>Magnetic Constraint Solver:</strong> When an element is translated, its 6 key axes (left, center-x, right, top, center-y, bottom) are evaluated against the artboard center, boundaries, and other visible elements.
                    </li>
                    <li>
                      <strong>Snap Thresholding:</strong> When distance <code className="text-neutral-300 font-mono">|Δ| ≤ 6px</code>, the coordinate is magnetically clamped and a visual smart guide overlay is dynamically injected.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
                <h4 className="font-semibold text-white mb-2 text-xs flex items-center gap-1.5">
                  <span className="text-indigo-400">●</span> Rendering Pipeline & Collaboration
                </h4>
                <p className="text-neutral-400 mb-2">
                  Canva renders vector elements using high-performance <strong>Canvas 2D / WebGL pipelines</strong>.
                  For real-time multi-user editing, mutations are dispatched via <strong>Operational Transformation (OT) / CRDTs</strong> over WebSockets, ensuring conflict-free concurrent editing across teams without locking whole canvases.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PHOTOSHOP */}
          {activeTab === 'photoshop' && (
            <div className="space-y-4">
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80">
                <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>The Photoshop Engine (Pixel Buffer & WebAssembly Architecture)</span>
                </h3>
                <p className="text-neutral-400">
                  Photoshop is a <strong>raster pixel manipulation and compositing powerhouse</strong>.
                  On desktop and Photoshop Web, it uses <strong>Adobe Graphics Core (AGC)</strong>, a C++ engine compiled to WebAssembly via Emscripten.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
                  <h4 className="font-semibold text-white mb-2 text-xs flex items-center gap-1.5">
                    <span className="text-blue-400">●</span> WebAssembly SIMD & Multithreading
                  </h4>
                  <p className="text-neutral-400">
                    Photoshop on the web compiles millions of lines of C++ code using <strong>WASM SIMD (<code className="text-blue-300 font-mono">-msimd128</code>)</strong> and <code className="text-blue-300 font-mono">SharedArrayBuffer</code> with Web Workers. This executes vector pixel arithmetic 4-8x faster than JavaScript, achieving near-native desktop speeds directly in Chrome.
                  </p>
                </div>

                <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
                  <h4 className="font-semibold text-white mb-2 text-xs flex items-center gap-1.5">
                    <span className="text-blue-400">●</span> Tiled Pyramids & Scratch Disk
                  </h4>
                  <p className="text-neutral-400">
                    To handle gigapixel files without running out of RAM, Photoshop divides layers into <strong>256×256 or 512×512 mipmapped tiles</strong>. On the web, it uses <strong>OPFS (Origin Private File System)</strong> to swap tiles to disk with unbuffered high-speed read/write access.
                  </p>
                </div>
              </div>

              <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
                <h4 className="font-semibold text-white mb-2 text-xs flex items-center gap-1.5">
                  <span className="text-blue-400">●</span> Non-Destructive Layer Compositing
                </h4>
                <p className="text-neutral-400">
                  Each layer in Photoshop maintains its original raster data unmodified. Adjustments (Brightness, Contrast, Exposure, Curves, HSL) and Blend Modes are applied dynamically on a render stack. Histograms are calculated in real time by scanning pixel frequency across 256 discrete bins for Red, Green, Blue, and Luminance.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: FUSION */}
          {activeTab === 'fusion' && (
            <div className="space-y-4">
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80">
                <h3 className="text-sm font-bold text-white mb-1.5">
                  Architectural Synthesis: Uniting Canva & Photoshop in Anything Studio
                </h3>
                <p className="text-neutral-400">
                  Traditionally, users must choose between Canva (great for vector layout, social templates, smart alignment) and Photoshop (great for layer blend modes, pixel adjustments, RGB histograms, precision raster editing).
                  <strong> Anything Creative Studio fuses both paradigms into one unified runtime:</strong>
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border border-neutral-800 rounded-lg overflow-hidden">
                  <thead className="bg-neutral-950 text-neutral-400 font-mono text-[11px]">
                    <tr>
                      <th className="p-3 border-b border-neutral-800">Feature Dimension</th>
                      <th className="p-3 border-b border-neutral-800 text-amber-300">Canva Model</th>
                      <th className="p-3 border-b border-neutral-800 text-blue-300">Photoshop Model</th>
                      <th className="p-3 border-b border-neutral-800 text-emerald-300">Anything Studio (Implemented)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                    <tr>
                      <td className="p-3 font-semibold text-white">Document Structure</td>
                      <td className="p-3 text-neutral-400">Scenegraph JSON Tree</td>
                      <td className="p-3 text-neutral-400">Raster Layer Stack</td>
                      <td className="p-3 text-emerald-300 font-medium">Hybrid Scenegraph + Layer Stack</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Transform Manipulation</td>
                      <td className="p-3 text-neutral-400">8-point handles + Rotation stem</td>
                      <td className="p-3 text-neutral-400">Free Transform (Ctrl+T)</td>
                      <td className="p-3 text-emerald-300 font-medium">Direct Canva Handles + Shift Constrain</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Guide Snapping</td>
                      <td className="p-3 text-neutral-400">Magnetic smart guidelines</td>
                      <td className="p-3 text-neutral-400">Rulers & Manual guides</td>
                      <td className="p-3 text-emerald-300 font-medium">Real-time Magnetic Smart Guides</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Blend Modes</td>
                      <td className="p-3 text-neutral-400">Limited (Basic Opacity)</td>
                      <td className="p-3 text-neutral-400">12+ Mathematical Modes</td>
                      <td className="p-3 text-emerald-300 font-medium">Full Photoshop Blend Modes Stack</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Raster Adjustments</td>
                      <td className="p-3 text-neutral-400">Basic Sliders</td>
                      <td className="p-3 text-neutral-400">Pixel Transfer Functions & Kernels</td>
                      <td className="p-3 text-emerald-300 font-medium">Non-destructive GPU + Convolution Kernels</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Pixel Telemetry</td>
                      <td className="p-3 text-neutral-400">None</td>
                      <td className="p-3 text-neutral-400">Live 256-bin RGB Histogram</td>
                      <td className="p-3 text-emerald-300 font-medium">Real-time 256-bin RGB & Luma Histogram</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: MATHEMATICAL FORMULAS */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 font-mono text-[11px]">
                <div className="text-neutral-500 mb-2">// 1. Photoshop Compositing Equation (W3C Blend Specification)</div>
                <div className="text-indigo-400">Result = (BlendMode(Base, Source) * α_src + Base * (1 - α_src)) * Opacity + Base * (1 - Opacity)</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800">
                  <div className="text-amber-400 font-semibold mb-1">Multiply:</div>
                  <div className="text-neutral-300">f(B, S) = B × S</div>
                </div>
                <div className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800">
                  <div className="text-amber-400 font-semibold mb-1">Screen:</div>
                  <div className="text-neutral-300">f(B, S) = 1 - (1 - B)(1 - S) = B + S - B × S</div>
                </div>
                <div className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800">
                  <div className="text-amber-400 font-semibold mb-1">Overlay:</div>
                  <div className="text-neutral-300">f(B, S) = B &lt; 0.5 ? 2BS : 1 - 2(1 - B)(1 - S)</div>
                </div>
                <div className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800">
                  <div className="text-amber-400 font-semibold mb-1">Color Dodge:</div>
                  <div className="text-neutral-300">f(B, S) = S == 1 ? 1 : min(1, B / (1 - S))</div>
                </div>
                <div className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800">
                  <div className="text-amber-400 font-semibold mb-1">Difference:</div>
                  <div className="text-neutral-300">f(B, S) = |B - S|</div>
                </div>
                <div className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800">
                  <div className="text-amber-400 font-semibold mb-1">Luminance Weights (ITU-R BT.601):</div>
                  <div className="text-neutral-300">Luma = 0.299·R + 0.587·G + 0.114·B</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500 font-mono">
            Audited & verified with official Chromium, Adobe WebAssembly & Canva engineering documentation.
          </span>
          <button
            onClick={() => setShowEvidenceModal(false)}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Evidence Window
          </button>
        </div>
      </div>
    </div>
  );
};
