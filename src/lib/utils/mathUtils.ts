import { Point } from '../struct/point';
import { Rect } from '../struct/rect';

export const approach = (value: number, target: number, maxDelta: number) => {
  return value > target ? Math.max(value - maxDelta, target) : Math.min(value + maxDelta, target);
};

export const rectAddPoint = (r: Rect, p: Point): Rect => {
  return {
    x: r.x + p.x,
    y: r.y + p.y,
    width: r.width,
    height: r.height
  };
};
