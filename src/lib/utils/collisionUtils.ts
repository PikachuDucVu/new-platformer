import { Point } from '../struct/point';
import { Rect } from '../struct/rect';
import { Entity, EntityType, IPlatformWorld } from '../world';
import { rectAddPoint } from './mathUtils';

export const aabb = (source: Rect, target: Rect): boolean => {
  return (
    source.x + source.width > target.x &&
    target.x + target.width > source.x &&
    source.y + source.height > target.y &&
    target.y + target.height > source.y
  );
};

export const checkOutside = (sEntity: Entity, tEntity: Entity, offset: Point): boolean => {
  return (
    sEntity.id !== tEntity.id &&
    !aabb(sEntity.sceneHitbox, tEntity.sceneHitbox) &&
    aabb(rectAddPoint(sEntity.sceneHitbox, offset), tEntity.sceneHitbox)
  );
};

export const solidsCheck = (entity: Entity, offset: Point, world: IPlatformWorld): boolean => {
  for (let i = 0; i < world.getEntities(EntityType.SOLID).length; i++) {
    if (solidCheck(entity, world.getEntities(EntityType.SOLID)[i], offset)) {
      return true;
    }
  }

  return false;
};

export const solidCheck = (sEntity: Entity, tEntity: Entity, offset: Point): boolean => {
  return sEntity.id !== tEntity.id && aabb(rectAddPoint(sEntity.sceneHitbox, offset), tEntity.sceneHitbox);
};

export const jumpThroughsCheck = (entity: Entity, offset: Point, world: IPlatformWorld): boolean => {
  for (let i = 0; i < world.getEntities(EntityType.JUMP_THROUGH).length; i++) {
    if (checkOutside(entity, world.getEntities(EntityType.JUMP_THROUGH)[i], offset)) {
      return true;
    }
  }

  return false;
};

export const groundCheck = (entity: Entity, world: IPlatformWorld, distance = 1): boolean => {
  const offset = { x: 0, y: distance };

  return solidsCheck(entity, offset, world) || jumpThroughsCheck(entity, offset, world);
};

export const wallCheck = (entity: Entity, offset: Point, world: IPlatformWorld): boolean => {
  return solidsCheck(entity, offset, world);
};

export const isRidingSolid = (sEntity: Entity, tEntity: Entity, distance = 1): boolean => {
  return solidCheck(sEntity, tEntity, { x: 0, y: distance });
};

export const isRidingJumpthrough = (sEntity: Entity, tEntity: Entity, distance = 1): boolean => {
  return checkOutside(sEntity, tEntity, { x: 0, y: distance });
};
