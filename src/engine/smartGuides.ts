import { Layer, SmartGuide } from '../types';

interface SnapResult {
  x: number;
  y: number;
  guides: SmartGuide[];
}

const SNAP_THRESHOLD = 8; // Snap distance tolerance in canvas pixels

/**
 * Computes magnetic snapping and visual smart guides for the dragged layer
 */
export function computeSmartGuides(
  targetLayer: Layer,
  allLayers: Layer[],
  canvasWidth: number,
  canvasHeight: number
): SnapResult {
  let snappedX = targetLayer.x;
  let snappedY = targetLayer.y;
  const guides: SmartGuide[] = [];

  const targetLeft = targetLayer.x;
  const targetRight = targetLayer.x + targetLayer.width;
  const targetCenterX = targetLayer.x + targetLayer.width / 2;

  const targetTop = targetLayer.y;
  const targetBottom = targetLayer.y + targetLayer.height;
  const targetCenterY = targetLayer.y + targetLayer.height / 2;

  // 1. Canvas Center Snapping
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;

  // Horizontal canvas center
  if (Math.abs(targetCenterX - canvasCenterX) <= SNAP_THRESHOLD) {
    snappedX = canvasCenterX - targetLayer.width / 2;
    guides.push({ type: 'vertical', position: canvasCenterX, label: 'Center' });
  }

  // Vertical canvas center
  if (Math.abs(targetCenterY - canvasCenterY) <= SNAP_THRESHOLD) {
    snappedY = canvasCenterY - targetLayer.height / 2;
    guides.push({ type: 'horizontal', position: canvasCenterY, label: 'Middle' });
  }

  // 2. Canvas Margins Snapping
  if (Math.abs(targetLeft) <= SNAP_THRESHOLD) {
    snappedX = 0;
    guides.push({ type: 'vertical', position: 0 });
  }
  if (Math.abs(targetRight - canvasWidth) <= SNAP_THRESHOLD) {
    snappedX = canvasWidth - targetLayer.width;
    guides.push({ type: 'vertical', position: canvasWidth });
  }
  if (Math.abs(targetTop) <= SNAP_THRESHOLD) {
    snappedY = 0;
    guides.push({ type: 'horizontal', position: 0 });
  }
  if (Math.abs(targetBottom - canvasHeight) <= SNAP_THRESHOLD) {
    snappedY = canvasHeight - targetLayer.height;
    guides.push({ type: 'horizontal', position: canvasHeight });
  }

  // 3. Layer-to-Layer Snapping
  for (const other of allLayers) {
    if (other.id === targetLayer.id || !other.visible) continue;

    const otherLeft = other.x;
    const otherRight = other.x + other.width;
    const otherCenterX = other.x + other.width / 2;

    const otherTop = other.y;
    const otherBottom = other.y + other.height;
    const otherCenterY = other.y + other.height / 2;

    // X alignments: Left-to-Left, Center-to-Center, Right-to-Right, Left-to-Right
    if (Math.abs(targetLeft - otherLeft) <= SNAP_THRESHOLD) {
      snappedX = otherLeft;
      guides.push({ type: 'vertical', position: otherLeft });
    } else if (Math.abs(targetCenterX - otherCenterX) <= SNAP_THRESHOLD) {
      snappedX = otherCenterX - targetLayer.width / 2;
      guides.push({ type: 'vertical', position: otherCenterX });
    } else if (Math.abs(targetRight - otherRight) <= SNAP_THRESHOLD) {
      snappedX = otherRight - targetLayer.width;
      guides.push({ type: 'vertical', position: otherRight });
    }

    // Y alignments: Top-to-Top, Center-to-Center, Bottom-to-Bottom
    if (Math.abs(targetTop - otherTop) <= SNAP_THRESHOLD) {
      snappedY = otherTop;
      guides.push({ type: 'horizontal', position: otherTop });
    } else if (Math.abs(targetCenterY - otherCenterY) <= SNAP_THRESHOLD) {
      snappedY = otherCenterY - targetLayer.height / 2;
      guides.push({ type: 'horizontal', position: otherCenterY });
    } else if (Math.abs(targetBottom - otherBottom) <= SNAP_THRESHOLD) {
      snappedY = otherBottom - targetLayer.height;
      guides.push({ type: 'horizontal', position: otherBottom });
    }
  }

  return { x: snappedX, y: snappedY, guides };
}
