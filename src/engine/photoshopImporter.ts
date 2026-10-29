import { readPsd, initializeCanvas, Layer as PsdLayer, Psd } from 'ag-psd';
import { Layer, ImageLayer, TextLayer, BlendMode } from '../types';
import { DEFAULT_ADJUSTMENTS } from './imageFilters';

// Ensure browser canvas factory is registered for ag-psd
if (typeof document !== 'undefined') {
  initializeCanvas((width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  });
}

export interface ParsedPsdProject {
  title: string;
  width: number;
  height: number;
  background: string;
  layers: Layer[];
}

/**
 * Normalizes Photoshop blend mode string to our Studio BlendMode
 */
function normalizeBlendMode(bm?: string): BlendMode {
  if (!bm) return 'normal';
  const clean = bm.toLowerCase().replace(/\s+/g, '-');
  switch (clean) {
    case 'multiply':
      return 'multiply';
    case 'screen':
      return 'screen';
    case 'overlay':
      return 'overlay';
    case 'darken':
      return 'darken';
    case 'lighten':
      return 'lighten';
    case 'color-dodge':
      return 'color-dodge';
    case 'color-burn':
      return 'color-burn';
    case 'hard-light':
      return 'hard-light';
    case 'soft-light':
      return 'soft-light';
    case 'difference':
      return 'difference';
    case 'exclusion':
      return 'exclusion';
    default:
      return 'normal';
  }
}

/**
 * Flattens and converts Photoshop PSD/PSB layers recursively
 */
function extractLayers(
  children: PsdLayer[],
  offsetX = 0,
  offsetY = 0
): Layer[] {
  const result: Layer[] = [];

  for (const child of children) {
    // If it's a group / folder with children, recursively unpack
    if (child.children && child.children.length > 0) {
      const subLayers = extractLayers(
        child.children,
        offsetX + (child.left || 0),
        offsetY + (child.top || 0)
      );
      result.push(...subLayers);
      continue;
    }

    const name = child.name || 'Photoshop Layer';
    const x = (child.left || 0) + offsetX;
    const y = (child.top || 0) + offsetY;
    const width = (child.right && child.left) ? Math.max(1, child.right - child.left) : (child.canvas?.width || 100);
    const height = (child.bottom && child.top) ? Math.max(1, child.bottom - child.top) : (child.canvas?.height || 100);
    const opacity = child.opacity !== undefined ? Math.max(0, Math.min(1, child.opacity)) : 1;
    const visible = child.hidden !== true;
    const locked = Boolean(
      child.protected?.transparency ||
      child.protected?.composite ||
      child.protected?.position
    );
    const blendMode = normalizeBlendMode(child.blendMode);

    // 1. Text Layer
    if (child.text && child.text.text) {
      const textVal = child.text.text.replace(/\r/g, '\n');
      const fontSize = child.text.style?.fontSize ? Math.round(child.text.style.fontSize) : 32;

      // Extract text color
      let color = '#ffffff';
      if (child.text.style?.fillColor) {
        const fc = child.text.style.fillColor as any;
        if (fc.r !== undefined && fc.g !== undefined && fc.b !== undefined) {
          color = `rgb(${Math.round(fc.r)}, ${Math.round(fc.g)}, ${Math.round(fc.b)})`;
        }
      }

      const fontName = child.text.style?.font?.name || 'Inter';
      const fontStyleStr = (child.text.style?.font as any)?.style || '';

      const textLayer: TextLayer = {
        id: `psd-text-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name,
        type: 'text',
        x,
        y,
        width: Math.max(width, 120),
        height: Math.max(height, 40),
        rotation: 0,
        opacity,
        visible,
        locked,
        blendMode,
        text: textVal,
        fontSize,
        fontFamily: fontName.includes('Serif') ? 'Playfair Display' : 'Inter',
        fontWeight: fontStyleStr.includes('Bold') || fontName.includes('Bold') ? 700 : 400,
        fontStyle: fontStyleStr.includes('Italic') || fontName.includes('Italic') ? 'italic' : 'normal',
        color,
        align: 'left',
        letterSpacing: 0,
        lineHeight: 1.2,
        shadowColor: '#000000',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        strokeColor: '',
        strokeWidth: 0
      };

      result.push(textLayer);
      continue;
    }

    // 2. Raster Image / Pixel Layer
    if (child.canvas) {
      const dataUrl = child.canvas.toDataURL('image/png');
      const imageLayer: ImageLayer = {
        id: `psd-img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name,
        type: 'image',
        src: dataUrl,
        naturalWidth: child.canvas.width,
        naturalHeight: child.canvas.height,
        x,
        y,
        width,
        height,
        rotation: 0,
        opacity,
        visible,
        locked,
        blendMode,
        adjustments: { ...DEFAULT_ADJUSTMENTS }
      };

      result.push(imageLayer);
      continue;
    }

    // If layer has no canvas and no text (e.g. empty adjustment layer or empty group marker),
    // we still create an empty layer if it has dimensions
    if (width > 0 && height > 0) {
      const dummyCanvas = document.createElement('canvas');
      dummyCanvas.width = width;
      dummyCanvas.height = height;
      const imageLayer: ImageLayer = {
        id: `psd-layer-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name,
        type: 'image',
        src: dummyCanvas.toDataURL(),
        naturalWidth: width,
        naturalHeight: height,
        x,
        y,
        width,
        height,
        rotation: 0,
        opacity,
        visible,
        locked,
        blendMode,
        adjustments: { ...DEFAULT_ADJUSTMENTS }
      };
      result.push(imageLayer);
    }
  }

  return result;
}

/**
 * Parses any Photoshop file (.psd, .psb, .psdt) from an ArrayBuffer
 */
export async function parsePhotoshopFile(
  buffer: ArrayBuffer,
  fileName = 'photoshop-document.psd'
): Promise<ParsedPsdProject> {
  const psd: Psd = readPsd(buffer, {
    skipLayerImageData: false,
    skipThumbnail: false,
    skipCompositeImageData: false
  });

  const width = psd.width || 1200;
  const height = psd.height || 800;
  const cleanTitle = fileName.replace(/\.(psd|psb|psdt)$/i, '');

  let layers: Layer[] = [];

  if (psd.children && psd.children.length > 0) {
    layers = extractLayers(psd.children);
  }

  // If PSD has no individual layers or only composite image
  if (layers.length === 0 && psd.canvas) {
    const dataUrl = psd.canvas.toDataURL('image/png');
    layers.push({
      id: `psd-composite-${Date.now()}`,
      name: 'Background Composite',
      type: 'image',
      src: dataUrl,
      naturalWidth: psd.canvas.width,
      naturalHeight: psd.canvas.height,
      x: 0,
      y: 0,
      width,
      height,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      blendMode: 'normal',
      adjustments: { ...DEFAULT_ADJUSTMENTS }
    });
  }

  return {
    title: cleanTitle,
    width,
    height,
    background: '#ffffff',
    layers
  };
}
