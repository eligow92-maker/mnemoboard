import type { Position } from "./dimensions";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function rectCenter(rect: Rect): Position {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

// Punkt, w którym odcinek ze środka prostokąta w stronę `toward` przecina jego krawędź.
// Dzięki temu linia (i strzałka łańcucha) kończy się na brzegu karteczki, a nie pod nią.
export function borderPoint(rect: Rect, toward: Position): Position {
  const center = rectCenter(rect);
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;
  if (dx === 0 && dy === 0) return center;

  const scaleX = dx === 0 ? Infinity : rect.width / 2 / Math.abs(dx);
  const scaleY = dy === 0 ? Infinity : rect.height / 2 / Math.abs(dy);
  const scale = Math.min(scaleX, scaleY);
  if (scale >= 1) return center;
  return { x: center.x + dx * scale, y: center.y + dy * scale };
}
