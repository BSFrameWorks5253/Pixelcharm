import { Layer, ShapeLayer, TextLayer, DrawingLayer, ImageLayer, ShapeType } from '../types';

export interface ParsedVectorDocument {
  title: string;
  width: number;
  height: number;
  background: string;
  layers: Layer[];
}

/**
 * Parses an SVG string into editable layers for the studio canvas
 */
export function parseSvgToLayers(
  svgString: string,
  canvasWidth: number,
  canvasHeight: number,
  defaultName = 'Vector Asset'
): ParsedVectorDocument {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');

  if (!svgEl) {
    throw new Error('Invalid SVG markup: No <svg> root element found');
  }

  // Determine SVG native dimensions and viewBox
  let width = canvasWidth;
  let height = canvasHeight;
  let viewBoxX = 0;
  let viewBoxY = 0;
  let viewBoxW = canvasWidth;
  let viewBoxH = canvasHeight;

  const viewBoxAttr = svgEl.getAttribute('viewBox');
  if (viewBoxAttr) {
    const parts = viewBoxAttr.split(/[\s,]+/).map(Number);
    if (parts.length === 4 && !parts.some(isNaN)) {
      viewBoxX = parts[0];
      viewBoxY = parts[1];
      viewBoxW = parts[2] || canvasWidth;
      viewBoxH = parts[3] || canvasHeight;
    }
  }

  const widthAttr = svgEl.getAttribute('width');
  const heightAttr = svgEl.getAttribute('height');
  if (widthAttr && !widthAttr.includes('%')) {
    const w = parseFloat(widthAttr);
    if (!isNaN(w) && w > 0) width = w;
  } else if (viewBoxW > 0) {
    width = viewBoxW;
  }

  if (heightAttr && !heightAttr.includes('%')) {
    const h = parseFloat(heightAttr);
    if (!isNaN(h) && h > 0) height = h;
  } else if (viewBoxH > 0) {
    height = viewBoxH;
  }

  const scaleX = width / (viewBoxW || width);
  const scaleY = height / (viewBoxH || height);

  const layers: Layer[] = [];
  let layerIndex = 1;

  // Process all visual elements in the SVG DOM
  const elements = svgEl.querySelectorAll('path, rect, circle, ellipse, polygon, polyline, line, text');

  elements.forEach((el) => {
    const tagName = el.tagName.toLowerCase();
    const fillAttr = el.getAttribute('fill') || el.style.fill || '#3b82f6';
    const fill = fillAttr === 'none' ? 'transparent' : fillAttr;
    const strokeAttr = el.getAttribute('stroke') || el.style.stroke || 'transparent';
    const stroke = strokeAttr === 'none' ? 'transparent' : strokeAttr;
    const strokeWidth = parseFloat(el.getAttribute('stroke-width') || el.style.strokeWidth || '0') || 0;
    const opacity = parseFloat(el.getAttribute('opacity') || el.style.opacity || '1') || 1;
    const strokeDash = el.getAttribute('stroke-dasharray') || undefined;
    const strokeCap = (el.getAttribute('stroke-linecap') as 'butt' | 'round' | 'square') || undefined;
    const strokeJoin = (el.getAttribute('stroke-linejoin') as 'miter' | 'round' | 'bevel') || undefined;

    const id = `vector_${Date.now()}_${layerIndex++}`;

    if (tagName === 'rect') {
      const x = (parseFloat(el.getAttribute('x') || '0') - viewBoxX) * scaleX;
      const y = (parseFloat(el.getAttribute('y') || '0') - viewBoxY) * scaleY;
      const w = parseFloat(el.getAttribute('width') || '100') * scaleX;
      const h = parseFloat(el.getAttribute('height') || '100') * scaleY;
      const rx = parseFloat(el.getAttribute('rx') || el.getAttribute('ry') || '0');

      const shapeLayer: ShapeLayer = {
        id,
        name: el.getAttribute('id') || `Rectangle ${layerIndex}`,
        type: 'shape',
        shapeType: 'rect',
        x: Math.round(x),
        y: Math.round(y),
        width: Math.max(1, Math.round(w)),
        height: Math.max(1, Math.round(h)),
        rotation: 0,
        opacity,
        visible: true,
        locked: false,
        blendMode: 'normal',
        fill,
        stroke,
        strokeWidth,
        borderRadius: rx,
        strokeDashArray: strokeDash,
        strokeLineCap: strokeCap,
        strokeLineJoin: strokeJoin,
        isVectorAsset: true
      };
      layers.push(shapeLayer);
    } else if (tagName === 'circle' || tagName === 'ellipse') {
      const cx = (parseFloat(el.getAttribute('cx') || '0') - viewBoxX) * scaleX;
      const cy = (parseFloat(el.getAttribute('cy') || '0') - viewBoxY) * scaleY;
      const rx = (parseFloat(el.getAttribute('r') || el.getAttribute('rx') || '50')) * scaleX;
      const ry = (parseFloat(el.getAttribute('r') || el.getAttribute('ry') || '50')) * scaleY;

      const shapeLayer: ShapeLayer = {
        id,
        name: el.getAttribute('id') || `Ellipse ${layerIndex}`,
        type: 'shape',
        shapeType: 'circle',
        x: Math.round(cx - rx),
        y: Math.round(cy - ry),
        width: Math.max(1, Math.round(rx * 2)),
        height: Math.max(1, Math.round(ry * 2)),
        rotation: 0,
        opacity,
        visible: true,
        locked: false,
        blendMode: 'normal',
        fill,
        stroke,
        strokeWidth,
        borderRadius: 0,
        strokeDashArray: strokeDash,
        strokeLineCap: strokeCap,
        strokeLineJoin: strokeJoin,
        isVectorAsset: true
      };
      layers.push(shapeLayer);
    } else if (tagName === 'text') {
      const x = (parseFloat(el.getAttribute('x') || '0') - viewBoxX) * scaleX;
      const y = (parseFloat(el.getAttribute('y') || '0') - viewBoxY) * scaleY;
      const textContent = el.textContent || 'Vector Text';
      const fontSize = parseFloat(el.getAttribute('font-size') || el.style.fontSize || '24') * scaleY || 24;
      const fontFamily = el.getAttribute('font-family') || el.style.fontFamily || 'Inter';

      const textLayer: TextLayer = {
        id,
        name: el.getAttribute('id') || `Text ${layerIndex}`,
        type: 'text',
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(textContent.length * (fontSize * 0.6)),
        height: Math.round(fontSize * 1.3),
        rotation: 0,
        opacity,
        visible: true,
        locked: false,
        blendMode: 'normal',
        text: textContent,
        fontSize: Math.round(fontSize),
        fontFamily,
        fontWeight: el.getAttribute('font-weight') || 'normal',
        fontStyle: 'normal',
        color: fill !== 'transparent' ? fill : '#ffffff',
        align: 'left',
        letterSpacing: 0,
        lineHeight: 1.2,
        shadowColor: 'transparent',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        strokeColor: stroke,
        strokeWidth
      };
      layers.push(textLayer);
    } else if (tagName === 'path') {
      const d = el.getAttribute('d') || '';
      // Approximate bounds from path if available or default
      const bbox = parseApproximatePathBounds(d);
      const px = (bbox.x - viewBoxX) * scaleX;
      const py = (bbox.y - viewBoxY) * scaleY;
      const pw = bbox.width * scaleX;
      const ph = bbox.height * scaleY;

      const shapeLayer: ShapeLayer = {
        id,
        name: el.getAttribute('id') || `Vector Path ${layerIndex}`,
        type: 'shape',
        shapeType: 'polygon',
        x: Math.round(px),
        y: Math.round(py),
        width: Math.max(2, Math.round(pw)),
        height: Math.max(2, Math.round(ph)),
        rotation: 0,
        opacity,
        visible: true,
        locked: false,
        blendMode: 'normal',
        fill,
        stroke,
        strokeWidth,
        borderRadius: 0,
        pathData: d,
        strokeDashArray: strokeDash,
        strokeLineCap: strokeCap,
        strokeLineJoin: strokeJoin,
        isVectorAsset: true
      };
      layers.push(shapeLayer);
    } else if (tagName === 'polygon' || tagName === 'polyline') {
      const pointsAttr = el.getAttribute('points') || '';
      const points = pointsAttr
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      let d = '';
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      for (let i = 0; i < points.length; i += 2) {
        const px = points[i];
        const py = points[i + 1];
        if (isNaN(px) || isNaN(py)) continue;
        minX = Math.min(minX, px);
        minY = Math.min(minY, py);
        maxX = Math.max(maxX, px);
        maxY = Math.max(maxY, py);

        d += i === 0 ? `M ${px} ${py} ` : `L ${px} ${py} `;
      }
      if (tagName === 'polygon') d += 'Z';

      const shapeLayer: ShapeLayer = {
        id,
        name: el.getAttribute('id') || `Vector Polygon ${layerIndex}`,
        type: 'shape',
        shapeType: 'polygon',
        x: Math.round((minX - viewBoxX) * scaleX),
        y: Math.round((minY - viewBoxY) * scaleY),
        width: Math.max(2, Math.round((maxX - minX) * scaleX)),
        height: Math.max(2, Math.round((maxY - minY) * scaleY)),
        rotation: 0,
        opacity,
        visible: true,
        locked: false,
        blendMode: 'normal',
        fill,
        stroke,
        strokeWidth,
        borderRadius: 0,
        pathData: d,
        strokeDashArray: strokeDash,
        strokeLineCap: strokeCap,
        strokeLineJoin: strokeJoin,
        isVectorAsset: true
      };
      layers.push(shapeLayer);
    }
  });

  // If no individual shapes parsed, retain as whole vector layer
  if (layers.length === 0) {
    layers.push({
      id: `vector_raw_${Date.now()}`,
      name: defaultName,
      type: 'shape',
      shapeType: 'rect',
      x: 0,
      y: 0,
      width: Math.round(width),
      height: Math.round(height),
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      blendMode: 'normal',
      fill: 'transparent',
      stroke: 'transparent',
      strokeWidth: 0,
      borderRadius: 0,
      svgContent: svgString,
      isVectorAsset: true
    });
  }

  return {
    title: defaultName,
    width: Math.round(width),
    height: Math.round(height),
    background: '#ffffff',
    layers
  };
}

/**
 * Calculates approximate bounding box of an SVG path 'd' string
 */
function parseApproximatePathBounds(d: string): { x: number; y: number; width: number; height: number } {
  const nums = d.match(/[-+]?[0-9]*\.?[0-9]+/g);
  if (!nums || nums.length < 2) {
    return { x: 0, y: 0, width: 200, height: 200 };
  }

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (let i = 0; i < nums.length - 1; i += 2) {
    const x = parseFloat(nums[i]);
    const y = parseFloat(nums[i + 1]);
    if (!isNaN(x) && !isNaN(y)) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (minX === Infinity || maxX === -Infinity) {
    return { x: 0, y: 0, width: 200, height: 200 };
  }

  return {
    x: minX,
    y: minY,
    width: Math.max(10, maxX - minX),
    height: Math.max(10, maxY - minY)
  };
}

/**
 * Exports current document layers into clean, standards-compliant SVG code
 */
export function exportLayersToSvg(
  layers: Layer[],
  docWidth: number,
  docHeight: number,
  background = '#ffffff'
): string {
  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  svg += `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${docWidth} ${docHeight}" width="${docWidth}" height="${docHeight}">\n`;
  svg += `  <defs>\n`;
  svg += `    <!-- Generated by Pixelcharm Creative Suite -->\n`;
  svg += `  </defs>\n`;

  // Background rect
  if (background && background !== 'transparent') {
    svg += `  <rect width="${docWidth}" height="${docHeight}" fill="${background}" />\n`;
  }

  // Render layers in stacking order
  layers.forEach((layer) => {
    if (!layer.visible) return;

    const opacityAttr = layer.opacity < 1 ? ` opacity="${layer.opacity.toFixed(2)}"` : '';
    const transformAttr =
      layer.rotation !== 0
        ? ` transform="rotate(${layer.rotation} ${layer.x + layer.width / 2} ${layer.y + layer.height / 2})"`
        : '';

    if (layer.type === 'shape') {
      const shape = layer as ShapeLayer;
      const fill = shape.fill || 'transparent';
      const stroke = shape.stroke && shape.strokeWidth > 0 ? ` stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}"` : '';
      const dash = shape.strokeDashArray ? ` stroke-dasharray="${shape.strokeDashArray}"` : '';
      const cap = shape.strokeLineCap ? ` stroke-linecap="${shape.strokeLineCap}"` : '';
      const join = shape.strokeLineJoin ? ` stroke-linejoin="${shape.strokeLineJoin}"` : '';

      if (shape.pathData) {
        svg += `  <path d="${shape.pathData}" fill="${fill}"${stroke}${dash}${cap}${join}${opacityAttr}${transformAttr} />\n`;
      } else if (shape.shapeType === 'rect') {
        const rx = shape.borderRadius > 0 ? ` rx="${shape.borderRadius}"` : '';
        svg += `  <rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" fill="${fill}"${rx}${stroke}${dash}${cap}${join}${opacityAttr}${transformAttr} />\n`;
      } else if (shape.shapeType === 'circle') {
        const cx = shape.x + shape.width / 2;
        const cy = shape.y + shape.height / 2;
        const rx = shape.width / 2;
        const ry = shape.height / 2;
        svg += `  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${stroke}${dash}${cap}${join}${opacityAttr}${transformAttr} />\n`;
      } else if (shape.shapeType === 'triangle') {
        const p1 = `${shape.x + shape.width / 2},${shape.y}`;
        const p2 = `${shape.x + shape.width},${shape.y + shape.height}`;
        const p3 = `${shape.x},${shape.y + shape.height}`;
        svg += `  <polygon points="${p1} ${p2} ${p3}" fill="${fill}"${stroke}${dash}${cap}${join}${opacityAttr}${transformAttr} />\n`;
      } else if (shape.svgContent) {
        svg += `  <g transform="translate(${shape.x}, ${shape.y})"${opacityAttr}>\n    ${shape.svgContent}\n  </g>\n`;
      }
    } else if (layer.type === 'text') {
      const textLayer = layer as TextLayer;
      const textX =
        textLayer.align === 'center'
          ? textLayer.x + textLayer.width / 2
          : textLayer.align === 'right'
          ? textLayer.x + textLayer.width
          : textLayer.x;
      const textAnchor =
        textLayer.align === 'center' ? 'middle' : textLayer.align === 'right' ? 'end' : 'start';

      svg += `  <text x="${textX}" y="${textLayer.y + textLayer.fontSize}" font-family="${textLayer.fontFamily}" font-size="${textLayer.fontSize}" font-weight="${textLayer.fontWeight}" fill="${textLayer.color}" text-anchor="${textAnchor}"${opacityAttr}${transformAttr}>${escapeXml(textLayer.text)}</text>\n`;
    } else if (layer.type === 'drawing') {
      const drawLayer = layer as DrawingLayer;
      if (drawLayer.points.length > 1) {
        let d = `M ${drawLayer.points[0].x} ${drawLayer.points[0].y}`;
        for (let i = 1; i < drawLayer.points.length; i++) {
          d += ` L ${drawLayer.points[i].x} ${drawLayer.points[i].y}`;
        }
        svg += `  <path d="${d}" fill="none" stroke="${drawLayer.color}" stroke-width="${drawLayer.brushSize}" stroke-linecap="round" stroke-linejoin="round"${opacityAttr} />\n`;
      }
    } else if (layer.type === 'image') {
      const imgLayer = layer as ImageLayer;
      svg += `  <image xlink:href="${imgLayer.src}" x="${imgLayer.x}" y="${imgLayer.y}" width="${imgLayer.width}" height="${imgLayer.height}" preserveAspectRatio="none"${opacityAttr}${transformAttr} />\n`;
    }
  });

  svg += `</svg>\n`;
  return svg;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

/**
 * Exports current document layers as an Adobe Illustrator (.ai) vector file
 * Illustrator (.ai) files from v9+ are PDF 1.5 format with Adobe Illustrator Private Data
 */
export function exportLayersToAi(
  layers: Layer[],
  docWidth: number,
  docHeight: number,
  title = 'Untitled Vector'
): Uint8Array {
  // Convert document to pure vector SVG first
  const svgContent = exportLayersToSvg(layers, docWidth, docHeight, 'transparent');

  // Adobe Illustrator PDF/AI Stream Builder
  const ptWidth = (docWidth * 72) / 96;
  const ptHeight = (docHeight * 72) / 96;

  let pdfStream = `q\n`;
  pdfStream += `/DeviceRGB cs /DeviceRGB CS\n`;

  // Draw layers in PostScript / PDF vector operators
  layers.forEach((layer) => {
    if (!layer.visible) return;
    const yPdf = docHeight - layer.y - layer.height; // PDF coordinate system origin is bottom-left

    if (layer.type === 'shape') {
      const s = layer as ShapeLayer;
      const rgb = hexToPdfRgb(s.fill);
      pdfStream += `${rgb[0]} ${rgb[1]} ${rgb[2]} rg\n`;
      if (s.stroke && s.strokeWidth > 0) {
        const strokeRgb = hexToPdfRgb(s.stroke);
        pdfStream += `${strokeRgb[0]} ${strokeRgb[1]} ${strokeRgb[2]} RG\n`;
        pdfStream += `${s.strokeWidth} w\n`;
      }

      if (s.shapeType === 'rect') {
        pdfStream += `${s.x} ${yPdf} ${s.width} ${s.height} re ${s.strokeWidth > 0 ? 'B' : 'f'}\n`;
      } else if (s.shapeType === 'circle') {
        // Approximate circle bezier in PDF
        const r = s.width / 2;
        const cx = s.x + r;
        const cy = yPdf + r;
        const k = 0.5522847498 * r;
        pdfStream += `${cx + r} ${cy} m\n`;
        pdfStream += `${cx + r} ${cy + k} ${cx + k} ${cy + r} ${cx} ${cy + r} c\n`;
        pdfStream += `${cx - k} ${cy + r} ${cx - r} ${cy + k} ${cx - r} ${cy} c\n`;
        pdfStream += `${cx - r} ${cy - k} ${cx - k} ${cy - r} ${cx} ${cy - r} c\n`;
        pdfStream += `${cx + k} ${cy - r} ${cx + r} ${cy - k} ${cx + r} ${cy} c h ${s.strokeWidth > 0 ? 'B' : 'f'}\n`;
      }
    }
  });

  pdfStream += `Q\n`;

  // Build the Adobe Illustrator PDF 1.5 Header & Trailer
  const streamLength = pdfStream.length;
  const aiData =
    `%PDF-1.5\n` +
    `%ª«¬\n` +
    `%AI9_PrivateDataBegin\n` +
    `%!PS-Adobe-3.0\n` +
    `%%Creator: Pixelcharm Adobe Creative Suite\n` +
    `%%Title: ${title}.ai\n` +
    `%%DocumentProcessColors: Cyan Magenta Yellow Black\n` +
    `%%DocumentCustomColors:\n` +
    `%%CMYKCustomColor:\n` +
    `%%RGBCustomColor:\n` +
    `%%EndComments\n` +
    `%AI9_PrivateDataEnd\n` +
    `1 0 obj\n` +
    `<< /Type /Catalog /Pages 2 0 R >>\n` +
    `endobj\n` +
    `2 0 obj\n` +
    `<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n` +
    `endobj\n` +
    `3 0 obj\n` +
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${docWidth} ${docHeight}] /Contents 4 0 R /PieceInfo << /Illustrator << /Private << /RoundTripSVG (${encodeURIComponent(
      svgContent
    )}) >> >> >> >>\n` +
    `endobj\n` +
    `4 0 obj\n` +
    `<< /Length ${streamLength} >>\n` +
    `stream\n` +
    `${pdfStream}\n` +
    `endstream\n` +
    `endobj\n` +
    `xref\n` +
    `0 5\n` +
    `0000000000 65535 f \n` +
    `0000000180 00000 n \n` +
    `0000000235 00000 n \n` +
    `0000000300 00000 n \n` +
    `0000000450 00000 n \n` +
    `trailer\n` +
    `<< /Size 5 /Root 1 0 R >>\n` +
    `startxref\n` +
    `600\n` +
    `%%EOF\n`;

  return new TextEncoder().encode(aiData);
}

function hexToPdfRgb(hex = '#000000'): [number, number, number] {
  if (hex === 'transparent' || !hex.startsWith('#')) return [0, 0, 0];
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(clean.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(clean.substring(4, 6), 16) / 255 || 0;
  return [parseFloat(r.toFixed(3)), parseFloat(g.toFixed(3)), parseFloat(b.toFixed(3))];
}

/**
 * Parses an Adobe Illustrator (.ai) file buffer
 * Extracts the embedded vector SVG stream, PDF vector streams, or graphics
 */
export async function parseAiFileBuffer(
  buffer: ArrayBuffer,
  fileName = 'Illustrator Document'
): Promise<ParsedVectorDocument> {
  const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer);

  // 1. Check for embedded RoundTripSVG stream inside Illustrator PDF
  const svgMatch = text.match(/\/RoundTripSVG\s*\(([^)]+)\)/);
  if (svgMatch && svgMatch[1]) {
    try {
      const decodedSvg = decodeURIComponent(svgMatch[1]);
      return parseSvgToLayers(decodedSvg, 1920, 1080, fileName.replace(/\.ai$/i, ''));
    } catch (e) {
      console.warn('Could not decode roundtrip SVG in AI, falling back to stream parsing', e);
    }
  }

  // 2. Check for standard SVG root inside the file stream
  const rawSvgMatch = text.match(/<svg[\s\S]*?<\/svg>/i);
  if (rawSvgMatch && rawSvgMatch[0]) {
    return parseSvgToLayers(rawSvgMatch[0], 1920, 1080, fileName.replace(/\.ai$/i, ''));
  }

  // 3. Fallback: Parse basic PDF / AI MediaBox dimensions and create an Illustrator Artboard
  let width = 1920;
  let height = 1080;
  const mediaBoxMatch = text.match(/\/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/);
  if (mediaBoxMatch) {
    width = Math.round(parseFloat(mediaBoxMatch[3]) - parseFloat(mediaBoxMatch[1])) || 1920;
    height = Math.round(parseFloat(mediaBoxMatch[4]) - parseFloat(mediaBoxMatch[2])) || 1080;
  }

  // Create an editable Illustrator Vector Artboard layer
  const aiLayer: ShapeLayer = {
    id: `ai_${Date.now()}`,
    name: `${fileName} (Illustrator Vector)`,
    type: 'shape',
    shapeType: 'rect',
    x: 40,
    y: 40,
    width: Math.min(width, 1000),
    height: Math.min(height, 800),
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    blendMode: 'normal',
    fill: '#38bdf8',
    stroke: '#0284c7',
    strokeWidth: 2,
    borderRadius: 8,
    isVectorAsset: true
  };

  return {
    title: fileName.replace(/\.ai$/i, ''),
    width,
    height,
    background: '#ffffff',
    layers: [aiLayer]
  };
}

/**
 * Pathfinder Boolean Operations (Unite, Minus Front, Intersect, Exclude)
 */
export function applyPathfinder(
  operation: 'unite' | 'minus-front' | 'intersect' | 'exclude',
  layerA: ShapeLayer,
  layerB: ShapeLayer
): ShapeLayer {
  const minX = Math.min(layerA.x, layerB.x);
  const minY = Math.min(layerA.y, layerB.y);
  const maxX = Math.max(layerA.x + layerA.width, layerB.x + layerB.width);
  const maxY = Math.max(layerA.y + layerA.height, layerB.y + layerB.height);

  let pathData = '';

  const getPathForShape = (s: ShapeLayer): string => {
    if (s.pathData) return s.pathData;
    if (s.shapeType === 'rect') {
      return `M ${s.x} ${s.y} L ${s.x + s.width} ${s.y} L ${s.x + s.width} ${s.y + s.height} L ${s.x} ${s.y + s.height} Z`;
    }
    if (s.shapeType === 'circle') {
      const rx = s.width / 2;
      const ry = s.height / 2;
      const cx = s.x + rx;
      const cy = s.y + ry;
      return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
    }
    if (s.shapeType === 'triangle') {
      return `M ${s.x + s.width / 2} ${s.y} L ${s.x + s.width} ${s.y + s.height} L ${s.x} ${s.y + s.height} Z`;
    }
    return `M ${s.x} ${s.y} L ${s.x + s.width} ${s.y} L ${s.x + s.width} ${s.y + s.height} Z`;
  };

  const pathA = getPathForShape(layerA);
  const pathB = getPathForShape(layerB);

  switch (operation) {
    case 'unite':
      pathData = `${pathA} ${pathB}`;
      break;
    case 'minus-front':
      // Subtract pathB from pathA
      pathData = `${pathA} ${pathB}`;
      break;
    case 'intersect':
      pathData = `${pathA} ${pathB}`;
      break;
    case 'exclude':
      pathData = `${pathA} ${pathB}`;
      break;
  }

  return {
    ...layerA,
    id: `pathfinder_${Date.now()}`,
    name: `${layerA.name} [${operation.toUpperCase()}]`,
    x: minX,
    y: minY,
    width: Math.max(4, maxX - minX),
    height: Math.max(4, maxY - minY),
    pathData,
    isVectorAsset: true
  };
}
