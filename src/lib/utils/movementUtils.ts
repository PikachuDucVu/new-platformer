import { Point } from '../struct/point';
import { Entity, IPlatformWorld } from '../world';
import { jumpThroughsCheck, solidsCheck } from './collisionUtils';

export const moveX = (
  amount: number,
  entity: Entity,
  world: IPlatformWorld,
  onCollide?: (col: any) => void
): boolean => {
  entity.remainder.x += amount;
  let move = Math.round(entity.remainder.x);
  if (move !== 0) {
    entity.remainder.x -= move;
    return moveExactX(move, entity, world, onCollide);
  } else {
    return false;
  }
};

export const moveY = (
  amount: number,
  entity: Entity,
  world: IPlatformWorld,
  onCollide?: (col: any) => void
): boolean => {
  entity.remainder.y += amount;
  let move = Math.round(entity.remainder.y);
  if (move !== 0) {
    entity.remainder.y -= move;
    return moveExactY(move, entity, world, onCollide);
  } else {
    return false;
  }
};

export const moveToX = (x: number, entity: Entity, world: IPlatformWorld, onCollide?: (collision: any) => void) => {
  moveX(x - (entity.position.x + entity.remainder.x), entity, world, onCollide);
};

export const moveToY = (y: number, entity: Entity, world: IPlatformWorld, onCollide?: (collision: any) => void) => {
  moveX(y - (entity.position.y + entity.remainder.y), entity, world, onCollide);
};

export const moveExactX = (
  amount: number,
  entity: Entity,
  world: IPlatformWorld,
  onCollide?: (col: any) => void
): boolean => {
  let move = amount;
  let sign = Math.sign(amount);

  while (move !== 0) {
    if (solidsCheck(entity, { x: sign, y: 0 }, world)) {
      onCollide && onCollide(null);
      return true;
    }

    entity.position.x += sign;
    move -= sign;
  }

  return false;
};

export const moveExactY = (
  amount: number,
  entity: Entity,
  world: IPlatformWorld,
  onCollide?: (col: any) => void
): boolean => {
  let move = amount;
  const sign = Math.sign(amount);
  const offset: Point = { x: 0, y: sign };

  if (move > 0) {
    while (move !== 0) {
      if (solidsCheck(entity, offset, world) || jumpThroughsCheck(entity, offset, world)) {
        onCollide && onCollide(null);
        return true;
      }

      entity.position.y += sign;
      move -= sign;
    }
  } else {
    while (move !== 0) {
      if (solidsCheck(entity, offset, world)) {
        onCollide && onCollide(null);
        return true;
      }

      entity.position.y += sign;
      move -= sign;
    }
  }

  return false;
};
