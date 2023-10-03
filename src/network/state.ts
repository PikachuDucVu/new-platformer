import { Schema, type } from "@colyseus/schema";
import { Vector2 } from "gdxts";
import { Player } from "../lib/entities/Player";
import { Direction } from "../lib/enum/direction";
import { Timer } from "../lib/logic/Timer";

export class XY extends Schema {
  @type("number")
  x: number;
  @type("number")
  y: number;
}

export type DirectionType = "TOP" | "DOWN" | "LEFT" | "RIGHT";

export class PlayerState extends Schema {
  @type("number") id: number;
  @type("number") jumpCount: number;

  @type(XY) position: XY;
  @type(XY) remainder: XY;
  @type(XY) speed: XY;
  @type(XY) size: XY;
  @type("string") facing: DirectionType;

  @type("boolean") onGround: boolean;
  @type("boolean") onWall: boolean;
  @type("boolean") onLeftWall: boolean;
  @type("boolean") onRightWall: boolean;

  @type("number") forceMoveX: number;
  @type("string") forceMoveXDir: DirectionType;
  @type("number") forceMoveXTimer: number;

  @type("boolean") autoJump: boolean;
  @type("number") varJumpSpeed: number;
  @type("number") autoJumpTimer: number;
  @type("number") tJumpGrace: number;
  @type("number") tVarJump: number;

  @type("boolean") wallGrab: boolean;
  @type("boolean") wallClimb: boolean;

  @type("boolean") hasDashed: boolean;
  @type("boolean") isDashing: boolean;
  @type("number") dashMinTimer: number;
}

export const vec2ToXY = (vec2: Vector2, xy?: XY): XY => {
  if (!xy) {
    xy = new XY();
  }
  xy.x = vec2.x;
  xy.y = vec2.y;
  return xy;
};

export const xyToVec2 = (xy: XY, vec2?: Vector2): Vector2 => {
  if (!vec2) {
    vec2 = new Vector2();
  }
  vec2.x = xy.x;
  vec2.y = xy.y;
  return vec2;
};

export const valueToTimer = (value: number, timer?: Timer): Timer => {
  if (!timer) {
    timer = new Timer();
  }
  timer.value = value;
  return timer;
};

export const playerToState = (player: Player, state?: PlayerState) => {
  if (!state) {
    state = new PlayerState();
  }
  state.id = player.id;
  state.jumpCount = player.jumpCount;
  state.position = vec2ToXY(player.position, state.position);
  state.remainder = vec2ToXY(player.remainder, state.remainder);
  state.speed = vec2ToXY(player.speed, state.speed);
  state.size = vec2ToXY(player.size, state.size);

  state.facing = player.facing;
  state.onGround = player.onGround;
  state.onWall = player.onWall;
  state.onLeftWall = player.onLeftWall;
  state.onRightWall = player.onRightWall;

  state.forceMoveX = player.forceMoveX;
  state.forceMoveXDir = player.forceMoveXDir;
  state.forceMoveXTimer = player.forceMoveXTimer.value;

  state.autoJump = player.autoJump;
  state.varJumpSpeed = player.varJumpSpeed;
  state.autoJumpTimer = player.autoJumpTimer.value;
  state.tJumpGrace = player.tJumpGrace.value;
  state.tVarJump = player.tVarJump.value;

  state.wallGrab = player.wallGrab;
  state.wallClimb = player.wallClimb;

  state.hasDashed = player.hasDashed;
  state.isDashing = player.isDashing;
  state.dashMinTimer = player.dashMinTimer.value;

  return state;
};

export const directionTypeToDirection = (directionType: DirectionType): Direction => {
  return directionType === "TOP"
    ? Direction.TOP
    : directionType === "DOWN"
    ? Direction.DOWN
    : directionType === "LEFT"
    ? Direction.LEFT
    : Direction.RIGHT;
};

export const stateToPlayer = (state: PlayerState, player: Player) => {
  player.id = state.id;
  player.jumpCount = state.jumpCount;
  player.position = xyToVec2(state.position, player.position);
  player.remainder = xyToVec2(state.remainder, player.remainder);
  player.speed = xyToVec2(state.speed, player.speed);
  player.size = xyToVec2(state.size, player.size);

  player.facing = directionTypeToDirection(state.facing);
  player.onGround = state.onGround;
  player.onWall = state.onWall;
  player.onLeftWall = state.onLeftWall;
  player.onRightWall = state.onRightWall;

  player.forceMoveX = state.forceMoveX;
  player.forceMoveXDir = directionTypeToDirection(state.forceMoveXDir);
  player.forceMoveXTimer = valueToTimer(state.forceMoveXTimer, player.forceMoveXTimer);

  player.autoJump = state.autoJump;
  player.varJumpSpeed = state.varJumpSpeed;
  player.autoJumpTimer = valueToTimer(state.autoJumpTimer, player.autoJumpTimer);
  player.tJumpGrace = valueToTimer(state.tJumpGrace, player.tJumpGrace);
  player.tVarJump = valueToTimer(state.tVarJump, player.tVarJump);

  player.wallGrab = state.wallGrab;
  player.wallClimb = state.wallClimb;

  player.hasDashed = state.hasDashed;
  player.isDashing = state.isDashing;
  player.dashMinTimer = valueToTimer(state.dashMinTimer, player.dashMinTimer);

  return player;
};
