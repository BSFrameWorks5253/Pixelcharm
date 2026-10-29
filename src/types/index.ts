export type LayerType = 'image' | 'text' | 'shape' | 'drawing';

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

export type ShapeType =
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'star'
  | 'polygon'
  | 'line'
  | 'arrow'
  | 'heart'
  | 'badge';

export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  exposure: number; // -100 to 100
  warmth: number; // -100 to 100 (Color Temperature)
  tint: number; // -100 to 100 (Green / Magenta tint)
  vibrance: number; // -100 to 100
  hueRotate: number; // 0 to 360
  blur: number; // 0 to 40 px
  sharpen: number; // 0 to 100
  invert: number; // 0 to 100
  sepia: number; // 0 to 100
  grayscale: number; // 0 to 100
  preset?: string;

  // Adobe Camera Raw Parameters
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  whites: number; // -100 to 100
  blacks: number; // -100 to 100
  clarity: number; // -100 to 100
  dehaze: number; // -100 to 100
  vignette: number; // -100 to 100
  temperatureKelvin: number; // 2000K to 12000K (default 5500K)
}

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in degrees
  opacity: number; // 0 to 1
  visible: boolean;
  locked: boolean;
  blendMode: BlendMode;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  adjustments: ImageAdjustments;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string | number;
  fontStyle: 'normal' | 'italic';
  color: string;
  align: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineHeight: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  strokeColor: string;
  strokeWidth: number;
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shapeType: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius: number;
  sides?: number;
}

export interface DrawingLayer extends BaseLayer {
  type: 'drawing';
  points: DrawingPoint[];
  color: string;
  brushSize: number;
}

export type Layer = ImageLayer | TextLayer | ShapeLayer | DrawingLayer;

export interface DocumentState {
  title: string;
  width: number;
  height: number;
  background: string;
  zoom: number;
  panX: number;
  panY: number;
}

export interface SmartGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  label?: string;
}

export interface HistoryItem {
  id: string;
  layers: Layer[];
  document: {
    width: number;
    height: number;
    background: string;
  };
  description: string;
  timestamp: number;
}

export interface CanvasDimensionsPreset {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  iconName?: string;
}
