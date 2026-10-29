import { writePsdUint8Array, Psd, Layer as PsdLayer } from 'ag-psd';
import { Layer, DocumentState } from '../types';
import { buildCssFilterString } from './imageFilters';
import { BLEND_MODE_MAP } from './blendModes';

/**
 * Converts Studio layers to an authentic Photoshop PSD file and triggers download
 */
export async function exportToPhotoshopPsd(
  doc: DocumentState,
  layers: Layer[]
): Promise<void> {
  const psdChildren: PsdLayer[] = [];

  for (const layer of layers) {
    if (!layer.visible) continue;

    // Render layer to off-screen canvas
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, layer.width);
    canvas.height = Math.max(1, layer.height);
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Draw layer content
      if (layer.type === 'image') {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = layer.src;
        await new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        });
        if (img.naturalWidth > 0) {
          ctx.filter = buildCssFilterString(layer.adjustments);
          ctx.drawImage(img, 0, 0, layer.width, layer.height);
        }
      } else if (layer.type === 'text') {
        ctx.font = `${layer.fontStyle === 'italic' ? 'italic ' : ''}${layer.fontWeight} ${layer.fontSize}px "${layer.fontFamily}", sans-serif`;
        ctx.textAlign = layer.align;
        ctx.textBaseline = 'top';
        ctx.fillStyle = layer.color;
        const textX =
          layer.align === 'center'
            ? layer.width / 2
            : layer.align === 'right'
            ? layer.width
            : 0;
        ctx.fillText(layer.text, textX, 0);
      } else if (layer.type === 'shape') {
        ctx.fillStyle = layer.fill;
        ctx.strokeStyle = layer.stroke;
        ctx.lineWidth = layer.strokeWidth;
        if (layer.shapeType === 'rect') {
          ctx.roundRect(0, 0, layer.width, layer.height, layer.borderRadius);
        } else if (layer.shapeType === 'circle') {
          ctx.ellipse(layer.width / 2, layer.height / 2, layer.width / 2, layer.height / 2, 0, 0, Math.PI * 2);
        }
        if (layer.fill && layer.fill !== 'transparent') ctx.fill();
        if (layer.strokeWidth > 0 && layer.stroke) ctx.stroke();
      } else if (layer.type === 'drawing') {
        if (layer.points.length > 1) {
          ctx.strokeStyle = layer.color;
          ctx.lineWidth = layer.brushSize;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(layer.points[0].x, layer.points[0].y);
          for (let i = 1; i < layer.points.length; i++) {
            ctx.lineTo(layer.points[i].x, layer.points[i].y);
          }
          ctx.stroke();
        }
      }
    }

    psdChildren.push({
      name: layer.name,
      left: layer.x,
      top: layer.y,
      right: layer.x + layer.width,
      bottom: layer.y + layer.height,
      opacity: layer.opacity,
      hidden: !layer.visible,
      blendMode: (layer.blendMode === 'normal' ? 'normal' : layer.blendMode) as any,
      canvas
    });
  }

  const psd: Psd = {
    width: doc.width,
    height: doc.height,
    children: psdChildren
  };

  const uint8 = writePsdUint8Array(psd);
  const blob = new Blob([uint8.buffer as ArrayBuffer], { type: 'image/vnd.adobe.photoshop' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${doc.title.toLowerCase().replace(/\s+/g, '-')}.psd`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
