import { ImageAdjustments } from '../types';

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  warmth: 0,
  tint: 0,
  vibrance: 0,
  hueRotate: 0,
  blur: 0,
  sharpen: 0,
  invert: 0,
  sepia: 0,
  grayscale: 0,
  preset: 'none',

  // Adobe Camera Raw Parameters
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  clarity: 0,
  dehaze: 0,
  vignette: 0,
  temperatureKelvin: 5500
};

export const PRESET_FILTERS: Record<string, Partial<ImageAdjustments>> = {
  none: { ...DEFAULT_ADJUSTMENTS },
  cinematic: {
    brightness: -5,
    contrast: 25,
    saturation: 15,
    warmth: -10,
    tint: 5,
    exposure: 5,
    preset: 'cinematic'
  },
  vintage: {
    brightness: 5,
    contrast: -10,
    saturation: -20,
    warmth: 30,
    sepia: 25,
    exposure: 10,
    preset: 'vintage'
  },
  bw_dramatic: {
    brightness: 0,
    contrast: 45,
    saturation: -100,
    grayscale: 100,
    exposure: -5,
    preset: 'bw_dramatic'
  },
  vibrant: {
    brightness: 5,
    contrast: 15,
    saturation: 40,
    vibrance: 35,
    warmth: 5,
    preset: 'vibrant'
  },
  golden_hour: {
    brightness: 10,
    contrast: 10,
    saturation: 20,
    warmth: 45,
    tint: -5,
    exposure: 10,
    preset: 'golden_hour'
  },
  cyberpunk: {
    brightness: 0,
    contrast: 30,
    saturation: 50,
    hueRotate: 280,
    vibrance: 40,
    preset: 'cyberpunk'
  },
  matte: {
    brightness: 10,
    contrast: -25,
    saturation: -10,
    warmth: 15,
    exposure: 5,
    preset: 'matte'
  }
};

/**
 * Builds CSS filter string for high-speed hardware-accelerated preview rendering
 */
export function buildCssFilterString(adj: ImageAdjustments): string {
  const parts: string[] = [];

  // Camera Raw Exposure, Highlights, Whites, Blacks composite
  const effectiveExposure = (adj.exposure || 0) + (adj.whites || 0) * 0.3 - (adj.blacks || 0) * 0.2;
  const bVal = 100 + (adj.brightness || 0) + effectiveExposure * 0.8 + (adj.shadows || 0) * 0.25 - (adj.highlights || 0) * 0.15;
  if (bVal !== 100) parts.push(`brightness(${Math.max(0, bVal)}%)`);

  // Camera Raw Contrast & Clarity composite
  const cVal = 100 + (adj.contrast || 0) + (adj.clarity || 0) * 0.4 + (adj.dehaze || 0) * 0.3;
  if (cVal !== 100) parts.push(`contrast(${Math.max(0, cVal)}%)`);

  // Saturation & Vibrance & Dehaze
  const sVal = 100 + (adj.saturation || 0) + (adj.vibrance || 0) * 0.5 + (adj.dehaze || 0) * 0.2;
  if (sVal !== 100) parts.push(`saturate(${Math.max(0, sVal)}%)`);

  // Hue rotate & Temperature / Tint
  const kelvinShift = adj.temperatureKelvin ? ((adj.temperatureKelvin - 5500) / 100) : 0;
  const hueTotal = ((adj.hueRotate || 0) + (adj.tint || 0) * 0.5 + kelvinShift * 0.2) % 360;
  if (hueTotal !== 0) parts.push(`hue-rotate(${hueTotal}deg)`);

  // Invert
  if (adj.invert > 0) parts.push(`invert(${adj.invert}%)`);

  // Sepia & Warmth
  const effectiveWarmth = (adj.warmth || 0) + (kelvinShift > 0 ? kelvinShift * 0.8 : 0);
  const sepiaVal = Math.max(0, Math.min(100, (adj.sepia || 0) + (effectiveWarmth > 0 ? effectiveWarmth * 0.4 : 0)));
  if (sepiaVal > 0) parts.push(`sepia(${sepiaVal}%)`);

  // Grayscale
  if (adj.grayscale > 0) parts.push(`grayscale(${adj.grayscale}%)`);

  // Blur
  if (adj.blur > 0) parts.push(`blur(${adj.blur}px)`);

  return parts.length > 0 ? parts.join(' ') : 'none';
}

/**
 * Performs custom pixel-level software convolution filter (e.g. Photoshop Unsharp Mask / Sharpen)
 */
export function applySharpenKernel(imageData: ImageData, strength: number): ImageData {
  if (strength <= 0) return imageData;
  const w = imageData.width;
  const h = imageData.height;
  const src = imageData.data;
  const out = new ImageData(new Uint8ClampedArray(src), w, h);
  const dst = out.data;

  // Weight for 3x3 unsharp convolution kernel
  const factor = (strength / 100) * 1.5;
  const center = 1 + 4 * factor;
  const edge = -factor;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      const top = ((y - 1) * w + x) * 4;
      const bottom = ((y + 1) * w + x) * 4;
      const left = (y * w + (x - 1)) * 4;
      const right = (y * w + (x + 1)) * 4;

      for (let c = 0; c < 3; c++) {
        const val =
          src[idx + c] * center +
          src[top + c] * edge +
          src[bottom + c] * edge +
          src[left + c] * edge +
          src[right + c] * edge;
        dst[idx + c] = Math.min(255, Math.max(0, val));
      }
      dst[idx + 3] = src[idx + 3]; // Preserve alpha
    }
  }

  return out;
}
