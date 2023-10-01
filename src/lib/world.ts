import { Vector2 } from "gdxts";
import { JumpThrough } from "./entities/JumpThrough";
import { Overlapable } from "./entities/Overlapable";
import { defaultPlayerConfigs, Player, PlayerConfigs } from "./entities/Player";
import { Solid } from "./entities/Solid";
import { Direction } from "./enum/direction";
import { Timer } from "./logic/Timer";
import { Rect } from "./struct/rect";
import { Controls } from "../controls";

export enum EntityType {
  ACTOR = "ACTOR",
  SOLID = "SOLID",
  JUMP_THROUGH = "JUMP_THROUGH",
  OVERLAPABLE = "OVERLAPABLE",
}

export interface Entity {
  id: number;
  world: IPlatformWorld;
  type: EntityType;
  position: Vector2;
  speed: Vector2;
  remainder: Vector2;
  hitbox: Rect;

  get sceneHitbox(): Rect;

  update(delta: number): void;
}

export interface JumpThroughPlatform extends Entity {
  size: Vector2;
}

export interface SolidPlatform extends Entity {
  size: Vector2;
}

export interface OverlapablePlatform extends Entity {
  size: Vector2;
}

export interface PlayerActor extends Entity {
  size: Vector2;
  tJumpGrace: Timer;
  tVarJump: Timer;
  facing: Direction;
  configs: PlayerConfigs;

  onGround: boolean;
  onWall: boolean;
  onLeftWall: boolean;
  onRightWall: boolean;

  wallGrab: boolean;
  wallClimb: boolean;
  hasDashed: boolean;
  isDashing: boolean;
}

export interface IPlatformWorld {
  controls: Controls;
  entityId: number;
  entities: Entity[];
  entitiesMap: { [key in EntityType]: Entity[] };

  newEntity(): void;
  createEntity(entity: Entity, type: EntityType): number;
  createPlayer(body: Rect, hitbox?: Rect, configs?: PlayerConfigs): number;
  createSolidPlatform(body: Rect, hitbox?: Rect): number;
  createJumpthroughPlatform(body: Rect, hitbox?: Rect): number;
  createOverlapablePlatform(body: Rect, hitbox?: Rect): number;

  getEntity(id: number): Entity | undefined;
  getEntities(type?: EntityType): Entity[];
  destroyEntity(id: number): boolean;
  setVelocity(id: number, vX: number, vY: number): IPlatformWorld;

  update(delta: number): void;
}

export class PlatformWorld implements IPlatformWorld {
  entityId = 0;
  entities: Entity[] = [];
  entitiesMap: { [key in EntityType]: Entity[] } = {
    ACTOR: [],
    SOLID: [],
    JUMP_THROUGH: [],
    OVERLAPABLE: [],
  };

  constructor(public controls: Controls) {}

  /*
    Entity
  */
  newEntity() {
    return ++this.entityId;
  }

  createEntity(entity: Entity, type: EntityType): number {
    entity.world = this;
    this.entities.push(entity);
    this.entitiesMap[type].push(entity);
    return this.entityId;
  }

  createPlayer(body: Rect, hitbox?: Rect, configs?: Partial<PlayerConfigs>): number {
    this.newEntity();
    const pConfigs = configs ? { ...defaultPlayerConfigs, ...configs } : defaultPlayerConfigs;
    const player = new Player(this.entityId, body, hitbox, pConfigs);
    player.world = this;
    this.entities.push(player);
    this.entitiesMap[EntityType.ACTOR].push(player);
    return this.entityId;
  }

  createSolidPlatform(body: Rect, hitbox?: Rect): number {
    this.newEntity();
    const solid = new Solid(this.entityId, body, hitbox);
    solid.world = this;
    this.entities.push(solid);
    this.entitiesMap[EntityType.SOLID].push(solid);
    return this.entityId;
  }

  createJumpthroughPlatform(body: Rect, hitbox?: Rect): number {
    this.newEntity();
    const jumpThrough = new JumpThrough(this.entityId, body, hitbox);
    jumpThrough.world = this;
    this.entities.push(jumpThrough);
    this.entitiesMap[EntityType.JUMP_THROUGH].push(jumpThrough);
    return this.entityId;
  }

  createOverlapablePlatform(body: Rect, hitbox?: Rect): number {
    const id = this.newEntity();
    const overlapable = new Overlapable(id, body, hitbox);
    overlapable.world = this;
    this.entities.push(overlapable);
    this.entitiesMap[EntityType.OVERLAPABLE].push(overlapable);
    return id;
  }

  getEntity(id: number): Entity | undefined {
    return this.entities.find((e) => e.id === id);
  }

  getEntities(type?: EntityType): Entity[] {
    if (type) {
      return this.entitiesMap[type];
    } else {
      return this.entities;
    }
  }

  destroyEntity(id: number): boolean {
    const entity = this.getEntity(id)!;
    if (!entity) return false;
    const deleteIndex = this.entities.findIndex((e) => e.id === id);
    if (deleteIndex >= 0) {
      this.entities.splice(deleteIndex, 1);
    }

    const mapDeleteIndex = this.entitiesMap[entity.type].findIndex((e) => e.id === id);
    if (mapDeleteIndex >= 0) {
      this.entitiesMap[entity.type].splice(mapDeleteIndex, 1);
    }
    return false;
  }

  setVelocity(_id: number, _vX: number, _vY: number): IPlatformWorld {
    return this;
  }

  /*
    Update
  */
  update(delta: number) {
    this.resolvePlayersUpdate(delta);
    this.resolveSolidsUpdate(delta);
    this.resolveJumpthroughUpdate(delta);
    this.resolveOverlapablesUpdate(delta);
  }

  private resolvePlayersUpdate(delta: number) {
    for (const entity of this.entities) {
      if (entity.type === EntityType.ACTOR) {
        entity.update(delta);
      }
    }
  }

  private resolveSolidsUpdate(delta: number) {
    for (const entity of this.entities) {
      if (entity.type === EntityType.SOLID) {
        entity.update(delta);
      }
    }
  }

  private resolveJumpthroughUpdate(delta: number) {
    for (const entity of this.entities) {
      if (entity.type === EntityType.JUMP_THROUGH) {
        entity.update(delta);
      }
    }
  }

  private resolveOverlapablesUpdate(delta: number) {
    for (const entity of this.entities) {
      if (entity.type === EntityType.OVERLAPABLE) {
        entity.update(delta);
      }
    }
  }
}
