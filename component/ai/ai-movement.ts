// component/ai/ai-movement.ts

export interface Position {
  x: number;
  y: number;
}

export function clampToSafeArea(
  pos: Position,
  companionSize: number,
  isMobile: boolean
): Position {
  if (typeof window === "undefined") return pos;

  const dockHeight = isMobile ? 88 : 96;
  // Image renders at 1.4x the circle size (see AICharacter.tsx), so we need
  // extra margin to prevent the visible artwork from clipping off-screen.
  const overflowPadding = companionSize * 0.2; // (1.4x - 1x) / 2
  const margin = 12 + overflowPadding;

  const maxX = window.innerWidth - companionSize - margin;
  const maxY = window.innerHeight - dockHeight - companionSize - margin;

  return {
    x: Math.min(Math.max(margin, pos.x), Math.max(margin, maxX)),
    y: Math.min(Math.max(margin, pos.y), Math.max(margin, maxY)),
  };
}

export function getRandomIdlePosition(
  companionSize: number,
  isMobile: boolean
): Position {
  if (typeof window === "undefined") return { x: 0, y: 0 };

  const dockHeight = isMobile ? 88 : 96;
  const margin = 24;

  const x = margin + Math.random() * (window.innerWidth - companionSize - margin * 2);
  const y =
    margin +
    Math.random() *
      (window.innerHeight - dockHeight - companionSize - margin * 2);

  return clampToSafeArea({ x, y }, companionSize, isMobile);
}

export function getCornerPosition(
  companionSize: number,
  isMobile: boolean
): Position {
  if (typeof window === "undefined") return { x: 0, y: 0 };

  const dockHeight = isMobile ? 88 : 96;
  const overflowPadding = companionSize * 0.2;
  const margin = (isMobile ? 16 : 32) + overflowPadding;

  const x = window.innerWidth - companionSize - margin;
  const y = window.innerHeight - dockHeight - companionSize - margin;

  return clampToSafeArea({ x, y }, companionSize, isMobile);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function distanceBetween(a: Position, b: Position): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function stepToward(
  from: Position,
  to: Position,
  speed: number
): { next: Position; arrived: boolean; facing: "left" | "right" } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);

  const facing: "left" | "right" = dx < 0 ? "left" : "right";

  if (dist <= speed || dist === 0) {
    return { next: to, arrived: true, facing };
  }

  const ratio = speed / dist;
  return {
    next: {
      x: from.x + dx * ratio,
      y: from.y + dy * ratio,
    },
    arrived: false,
    facing,
  };
}