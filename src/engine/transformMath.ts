export type HandleType =
  | 'tl' // top-left
  | 'tm' // top-middle
  | 'tr' // top-right
  | 'mr' // middle-right
  | 'br' // bottom-right
  | 'bm' // bottom-middle
  | 'bl' // bottom-left
  | 'ml' // middle-left
  | 'rot'; // rotation handle

export interface Point {
  x: number;
  y: number;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

/**
 * Rotates a point around a pivot point by radians
 */
export function rotatePoint(p: Point, pivot: Point, radians: number): Point {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const dx = p.x - pivot.x;
  const dy = p.y - pivot.y;

  return {
    x: pivot.x + (dx * cos - dy * sin),
    y: pivot.y + (dx * sin + dy * cos)
  };
}

/**
 * Calculates 8 handle points and 1 rotation handle in world canvas coordinates
 */
export function getBoundingHandles(box: Box) {
  const rad = (box.rotation * Math.PI) / 180;
  const pivot: Point = {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2
  };

  const unrotated: Record<HandleType, Point> = {
    tl: { x: box.x, y: box.y },
    tm: { x: box.x + box.width / 2, y: box.y },
    tr: { x: box.x + box.width, y: box.y },
    mr: { x: box.x + box.width, y: box.y + box.height / 2 },
    br: { x: box.x + box.width, y: box.y + box.height },
    bm: { x: box.x + box.width / 2, y: box.y + box.height },
    bl: { x: box.x, y: box.y + box.height },
    ml: { x: box.x, y: box.y + box.height / 2 },
    rot: { x: box.x + box.width / 2, y: box.y - 28 } // 28px above top-center
  };

  const handles: Record<HandleType, Point> = {
    tl: rotatePoint(unrotated.tl, pivot, rad),
    tm: rotatePoint(unrotated.tm, pivot, rad),
    tr: rotatePoint(unrotated.tr, pivot, rad),
    mr: rotatePoint(unrotated.mr, pivot, rad),
    br: rotatePoint(unrotated.br, pivot, rad),
    bm: rotatePoint(unrotated.bm, pivot, rad),
    bl: rotatePoint(unrotated.bl, pivot, rad),
    ml: rotatePoint(unrotated.ml, pivot, rad),
    rot: rotatePoint(unrotated.rot, pivot, rad)
  };

  return { pivot, handles };
}

/**
 * Direct resize calculation with aspect ratio preservation
 */
export function calculateResize(
  initialBox: Box,
  handle: HandleType,
  currentMouse: Point,
  startMouse: Point,
  lockAspectRatio: boolean
): { x: number; y: number; width: number; height: number } {
  const rad = (initialBox.rotation * Math.PI) / 180;
  // Rotate delta into box local coordinates
  const dx = currentMouse.x - startMouse.x;
  const dy = currentMouse.y - startMouse.y;

  const localDx = dx * Math.cos(-rad) - dy * Math.sin(-rad);
  const localDy = dx * Math.sin(-rad) + dy * Math.cos(-rad);

  let newW = initialBox.width;
  let newH = initialBox.height;
  let newX = initialBox.x;
  let newY = initialBox.y;
  const ratio = initialBox.width / (initialBox.height || 1);

  switch (handle) {
    case 'br': {
      newW = Math.max(20, initialBox.width + localDx);
      newH = lockAspectRatio ? newW / ratio : Math.max(20, initialBox.height + localDy);
      break;
    }
    case 'tr': {
      newW = Math.max(20, initialBox.width + localDx);
      newH = lockAspectRatio ? newW / ratio : Math.max(20, initialBox.height - localDy);
      newY = initialBox.y + (initialBox.height - newH);
      break;
    }
    case 'bl': {
      newW = Math.max(20, initialBox.width - localDx);
      newH = lockAspectRatio ? newW / ratio : Math.max(20, initialBox.height + localDy);
      newX = initialBox.x + (initialBox.width - newW);
      break;
    }
    case 'tl': {
      newW = Math.max(20, initialBox.width - localDx);
      newH = lockAspectRatio ? newW / ratio : Math.max(20, initialBox.height - localDy);
      newX = initialBox.x + (initialBox.width - newW);
      newY = initialBox.y + (initialBox.height - newH);
      break;
    }
    case 'mr': {
      newW = Math.max(20, initialBox.width + localDx);
      if (lockAspectRatio) newH = newW / ratio;
      break;
    }
    case 'ml': {
      newW = Math.max(20, initialBox.width - localDx);
      newX = initialBox.x + (initialBox.width - newW);
      if (lockAspectRatio) newH = newW / ratio;
      break;
    }
    case 'bm': {
      newH = Math.max(20, initialBox.height + localDy);
      if (lockAspectRatio) newW = newH * ratio;
      break;
    }
    case 'tm': {
      newH = Math.max(20, initialBox.height - localDy);
      newY = initialBox.y + (initialBox.height - newH);
      if (lockAspectRatio) newW = newH * ratio;
      break;
    }
  }

  return { x: newX, y: newY, width: Math.round(newW), height: Math.round(newH) };
}
