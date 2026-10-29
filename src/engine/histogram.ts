export interface HistogramData {
  r: number[];
  g: number[];
  b: number[];
  luma: number[];
  maxR: number;
  maxG: number;
  maxB: number;
  maxLuma: number;
  totalPixels: number;
  meanLuma: number;
}

/**
 * Computes 256-bin histogram for Red, Green, Blue, and Luminance channels
 * using standard ITU-R BT.601 weights (0.299 R + 0.587 G + 0.114 B)
 */
export function computeHistogram(imageData: ImageData): HistogramData {
  const r = new Array(256).fill(0);
  const g = new Array(256).fill(0);
  const b = new Array(256).fill(0);
  const luma = new Array(256).fill(0);

  const data = imageData.data;
  const total = data.length / 4;
  let sumLuma = 0;

  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];
    const alpha = data[i + 3];

    // Only count visible pixels
    if (alpha > 10) {
      r[red]++;
      g[green]++;
      b[blue]++;
      const lum = Math.round(0.299 * red + 0.587 * green + 0.114 * blue);
      luma[lum]++;
      sumLuma += lum;
    }
  }

  let maxR = 1;
  let maxG = 1;
  let maxB = 1;
  let maxLuma = 1;

  for (let i = 0; i < 256; i++) {
    if (r[i] > maxR) maxR = r[i];
    if (g[i] > maxG) maxG = g[i];
    if (b[i] > maxB) maxB = b[i];
    if (luma[i] > maxLuma) maxLuma = luma[i];
  }

  return {
    r,
    g,
    b,
    luma,
    maxR,
    maxG,
    maxB,
    maxLuma,
    totalPixels: total,
    meanLuma: total > 0 ? Math.round(sumLuma / total) : 0
  };
}
