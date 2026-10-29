import { BlendMode } from '../types';

/**
 * Maps Photoshop blend modes to HTML5 Canvas 2D / CSS mix-blend-mode operations
 */
export const BLEND_MODE_MAP: Record<BlendMode, GlobalCompositeOperation> = {
  'normal': 'source-over',
  'multiply': 'multiply',
  'screen': 'screen',
  'overlay': 'overlay',
  'darken': 'darken',
  'lighten': 'lighten',
  'color-dodge': 'color-dodge',
  'color-burn': 'color-burn',
  'hard-light': 'hard-light',
  'soft-light': 'soft-light',
  'difference': 'difference',
  'exclusion': 'exclusion'
};

export const BLEND_MODE_LABELS: { value: BlendMode; label: string; group: string }[] = [
  { value: 'normal', label: 'Normal', group: 'Basic' },
  { value: 'darken', label: 'Darken', group: 'Darken' },
  { value: 'multiply', label: 'Multiply', group: 'Darken' },
  { value: 'color-burn', label: 'Color Burn', group: 'Darken' },
  { value: 'lighten', label: 'Lighten', group: 'Lighten' },
  { value: 'screen', label: 'Screen', group: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge', group: 'Lighten' },
  { value: 'overlay', label: 'Overlay', group: 'Contrast' },
  { value: 'soft-light', label: 'Soft Light', group: 'Contrast' },
  { value: 'hard-light', label: 'Hard Light', group: 'Contrast' },
  { value: 'difference', label: 'Difference', group: 'Inversion' },
  { value: 'exclusion', label: 'Exclusion', group: 'Inversion' }
];

/**
 * Pure Photoshop blend mode mathematical functions (normalized [0, 1])
 * Used when performing software pixel-buffer compositing or shader simulations.
 */
export const BlendMath = {
  multiply: (b: number, s: number) => b * s,
  screen: (b: number, s: number) => b + s - b * s,
  overlay: (b: number, s: number) => (b < 0.5 ? 2 * b * s : 1 - 2 * (1 - b) * (1 - s)),
  darken: (b: number, s: number) => Math.min(b, s),
  lighten: (b: number, s: number) => Math.max(b, s),
  colorDodge: (b: number, s: number) => (s === 1 ? 1 : Math.min(1, b / (1 - s))),
  colorBurn: (b: number, s: number) => (s === 0 ? 0 : 1 - Math.min(1, (1 - b) / s)),
  hardLight: (b: number, s: number) => (s < 0.5 ? 2 * b * s : 1 - 2 * (1 - b) * (1 - s)),
  softLight: (b: number, s: number) => {
    if (s <= 0.5) {
      return b - (1 - 2 * s) * b * (1 - b);
    }
    const d = b <= 0.25 ? ((16 * b - 12) * b + 4) * b : Math.sqrt(b);
    return b + (2 * s - 1) * (d - b);
  },
  difference: (b: number, s: number) => Math.abs(b - s),
  exclusion: (b: number, s: number) => b + s - 2 * b * s
};
