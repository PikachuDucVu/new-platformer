import { Vector2 } from "gdxts";

import { Direction, directionValue } from "../enum/direction";
import { Timer } from "../logic/Timer";
import { Point } from "../struct/point";
import { Rect } from "../struct/rect";
import { groundCheck, solidsCheck, wallCheck } from "../utils/collisionUtils";
import { approach } from "../utils/mathUtils";
import { moveX, moveY } from "../utils/movementUtils";
import { EntityType, IPlatformWorld, PlayerActor } from "../world";

const gravity = 2778;
const halfGravThreshold = 111; // Halves gravity at the peak of a jump, if the jump button is held

const coyoteTime = 0.1; // Time after leaving a ledge when you can still jump
const varJumpTime = 0.2; // Time after jumping that you can hold the jump button to continue gaining upward speed
const jumpSpeed = -528;
const jumpXBoost = 156; // If left or right is held at the moment of a jump, this horizontal speed boost is applied
const maxFall = 700;

const maxRun = 450;
const runAccel = (maxRun / 6) * 60;
const runDeccel = (maxRun / 3) * 60;
const runAccelAirMult = 0.5; // Gives you slightly less control of horizontal motion in the air

const climbUpSpeed = -208;
const climbDownSpeed = 370;
const climbSlipSpeed = 50;
const climbAccel = 23148;

const wallJumpHSpeed = maxRun * 1.8 + jumpXBoost;
const wallJumpForceTime = 0.16;
const WallJumpCheckDist = 2;

const dashXSpeed = 850;
const dashXBoostSpeed = 150;
const dashYSpeed = 750;
const dashMinTime = 0.16;

const bounceAutoJumpTime = 0.1;

export type PlayerConfigs = {
  grabWallOnTouch: boolean;
  maxJumpCount: number;
  resetJumpOnWall: boolean;
  resetDashOnWall: boolean;
  disableDash: boolean;
  disableWallJump: boolean;
};

export const defaultPlayerConfigs: PlayerConfigs = {
  grabWallOnTouch: true,
  maxJumpCount: 1,
  resetJumpOnWall: false,
  resetDashOnWall: false,
  disableDash: false,
  disableWallJump: false,
};

export class Player implements PlayerActor {
  id: number;
  type: EntityType;
  world: IPlatformWorld;

  jumpCount = 2;

  position: Vector2;
  remainder: Vector2;
  speed: Vector2;
  size: Vector2;
  hitbox: Rect;
  facing: Direction;
  configs: PlayerConfigs;

  onGround: boolean;
  onWall: boolean;
  onLeftWall: boolean;
  onRightWall: boolean;

  forceMoveX: number = 0;
  forceMoveXDir: Direction;
  forceMoveXTimer: Timer;

  autoJump: boolean = false;
  varJumpSpeed: number = 0;
  autoJumpTimer: Timer;
  tJumpGrace: Timer;
  tVarJump: Timer;

  wallGrab: boolean = false;
  wallClimb: boolean = false;

  hasDashed: boolean = false;
  isDashing: boolean = false;
  dashMinTimer: Timer;

  bottomOffset: Point = { x: 0, y: 1 };
  rightOffset: Point = { x: 1, y: 0 };
  leftOffset: Point = { x: -1, y: 0 };

  constructor(_id: number, body: Rect, _hitbox?: Rect, _configs?: PlayerConfigs) {
    this.id = _id;
    this.position = new Vector2(body.x, body.y);
    this.size = new Vector2(body.width, body.height);
    if (_hitbox) {
      this.hitbox = _hitbox;
    } else {
      this.hitbox = {
        x: 0,
        y: 0,
        width: body.width,
        height: body.height,
      };
    }
    this.configs = _configs!;

    this.type = EntityType.ACTOR;
    this.remainder = new Vector2(0, 0);
    this.speed = new Vector2(0, 0);

    this.tJumpGrace = new Timer();
    this.tVarJump = new Timer();
    this.forceMoveXTimer = new Timer();
    this.autoJumpTimer = new Timer();
    this.dashMinTimer = new Timer();
  }

  get sceneHitbox(): Rect {
    return {
      x: this.position.x + this.hitbox.x,
      y: this.position.y + this.hitbox.y,
      width: this.hitbox.width,
      height: this.hitbox.height,
    };
  }

  /*
      Jump
  */
  private jump() {
    this.jumpCount -= 1;
    this.world.controls.jump.release();
    this.tJumpGrace.clear();
    this.tVarJump.value = varJumpTime;
    this.speed.y = jumpSpeed;
    this.speed.x += jumpXBoost * this.world.controls.moveX;
  }

  private wallJump(direction: Direction) {
    this.tJumpGrace.clear();
    this.tVarJump.clear();
    this.autoJump = true;
    this.autoJumpTimer.value = bounceAutoJumpTime;

    if (this.world.controls.moveX !== 0) {
      this.forceMoveX = wallJumpHSpeed * directionValue[direction] * -1;
      this.forceMoveXTimer.value = wallJumpForceTime;
    }

    this.speed.x = wallJumpHSpeed * directionValue[direction] * -1;
    this.speed.y = jumpSpeed;

    this.varJumpSpeed = this.speed.y;
  }

  private climbJump() {
    this.jump();
  }

  private wallJumpCheck(direction: Direction) {
    return solidsCheck(this, { x: WallJumpCheckDist * directionValue[direction], y: 0 }, this.world);
  }

  /*
      Dash
  */
  private dash(x: number, y: number) {
    this.tVarJump.clear();
    this.speed.y = 0;

    this.world.controls.dash.release();
    this.hasDashed = true;
    this.isDashing = true;
    this.dashMinTimer.value = dashMinTime;

    if (y === 0) {
      this.forceMoveX = x * (dashXSpeed + dashXBoostSpeed);
    } else {
      this.forceMoveX = x * dashXSpeed;
    }
    this.forceMoveXTimer.value = dashMinTime;

    this.speed.y = y * dashYSpeed;
  }

  /*
      Resolver
  */
  private resolveMovement(delta: number) {
    let onGround = groundCheck(this, this.world);
    this.onGround = onGround;
    if (onGround) {
      this.tJumpGrace.value = coyoteTime;
      this.jumpCount = this.configs.maxJumpCount;
    }

    this.onLeftWall = wallCheck(this, this.leftOffset, this.world);
    this.onRightWall = wallCheck(this, this.rightOffset, this.world);
    this.onWall = (this.onLeftWall || this.onRightWall) && !onGround;

    // facing
    if (this.world.controls.moveX !== 0) {
      this.facing = this.world.controls.moveX === directionValue[Direction.LEFT] ? Direction.LEFT : Direction.RIGHT;
    }

    // Wall statuses
    if (this.onWall) {
      this.autoJump = false;
      this.autoJumpTimer.clear();
    }

    if (!onGround && this.onWall && !this.wallGrab && this.configs.grabWallOnTouch) {
      this.wallGrab = true;
      if (this.configs.resetJumpOnWall) {
        this.jumpCount = this.configs.maxJumpCount;
      }
    }

    if (onGround || !this.onWall) {
      this.wallGrab = false;
      this.wallClimb = false;
    }

    // Dash min timer
    if (this.dashMinTimer.value <= 0) {
      this.isDashing = false;
      if (onGround && this.hasDashed) {
        this.hasDashed = false;
      }
    }

    // Fall off the wall
    if (this.onWall && this.world.controls.moveX !== 0) {
      if ((this.onLeftWall && this.world.controls.moveX > 0) || (this.onRightWall && this.world.controls.moveX < 0)) {
        this.wallGrab = false;
      }
    }

    if (this.onWall && this.hasDashed && this.configs.resetDashOnWall) {
      this.hasDashed = false;
    }

    // Auto Jump
    if (this.autoJump) {
      if (this.autoJumpTimer.value <= 0) {
        this.autoJump = false;
      }
    } else {
      this.autoJumpTimer.clear();
    }

    //Gravity
    if ((this.tJumpGrace.value <= 0 || !this.world.controls.jump.pressed) && !this.isDashing) {
      let mult = 1;
      if (this.world.controls.jump.check && Math.abs(this.speed.y) <= halfGravThreshold) {
        mult = 0.8;
      }
      this.speed.y = approach(this.speed.y, maxFall, gravity * mult * delta);
    }

    // Wall slide
    if (this.wallGrab) {
      this.speed.y = climbSlipSpeed;
    }

    // Wall climb
    if (this.wallGrab) {
      if (this.world.controls.moveY !== 0) {
        this.wallClimb = true;
        let climbSpeedY = Math.sign(this.world.controls.moveY) > 0 ? climbDownSpeed : climbUpSpeed;
        this.speed.y = approach(0, climbSpeedY, climbAccel * delta);
      } else {
        this.wallClimb = false;
      }
    }

    // Variable Jump
    if (this.tVarJump.value > 0) {
      if (this.world.controls.jump.check) {
        if (this.autoJump) {
          this.speed.y = Math.min(this.speed.y, this.varJumpSpeed);
        } else {
          this.speed.y = jumpSpeed;
        }
      } else {
        this.tVarJump.clear();
      }
    }

    // Force Move X
    if (this.forceMoveXTimer.value <= 0) {
      this.forceMoveX = 0;
    } else {
      this.speed.x = this.forceMoveX;
    }

    // Acceleration X
    let accel = runAccel;
    if (Math.abs(this.world.controls.moveX * maxRun) <= 0.01) {
      accel = runDeccel;
    }

    // Air Acceleration X
    if (!onGround) {
      accel *= runAccelAirMult;
    }

    this.speed.x = approach(this.speed.x, this.world.controls.moveX * maxRun, accel * delta);

    // Jump
    if (this.world.controls.jump.pressed) {
      if (this.tJumpGrace.value > 0 || this.jumpCount > 0) {
        this.jump();
      } else if (!this.configs.disableWallJump) {
        if (this.wallJumpCheck(Direction.LEFT)) {
          if (this.wallClimb) {
            this.climbJump();
          } else {
            this.wallJump(Direction.LEFT);
          }
        } else if (this.wallJumpCheck(Direction.RIGHT)) {
          if (this.wallClimb) {
            this.climbJump();
          } else {
            this.wallJump(Direction.RIGHT);
          }
        }
      }
    }

    // Dash
    if (this.world.controls.dash.pressed && !this.hasDashed && !this.isDashing && !this.configs.disableDash) {
      if (this.world.controls.moveX !== 0 || this.world.controls.moveY !== 0) {
        this.dash(this.world.controls.moveX, this.world.controls.moveY);
      } else if (this.facing) {
        this.dash(directionValue[this.facing], 0);
      }
    }

    //Resolve Speed
    moveX(this.speed.x * delta, this, this.world, (col) => this.onCollideX(col));
    moveY(this.speed.y * delta, this, this.world, (col) => this.onCollideY(col));
  }

  update(delta: number) {
    // Timer
    this.tJumpGrace.update(delta);
    this.tVarJump.update(delta);
    this.forceMoveXTimer.update(delta);
    this.autoJumpTimer.update(delta);
    this.dashMinTimer.update(delta);

    // Movement
    this.resolveMovement(delta);
  }

  private onCollideX(_col: any) {
    this.speed.x = 0;
    this.remainder.x = 0;
  }

  private onCollideY(_col: any) {
    this.speed.y = 0;
    this.remainder.y = 0;
  }
}
