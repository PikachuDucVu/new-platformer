import { Vector2 } from 'gdxts';
import { JumpThrough } from '../lib/entities/JumpThrough';
import { Rect } from '../lib/struct/rect';
import Easing from '../util/common/Easing';
import { lerpVector2 } from '../util/common/mathUtil';

export class MovingJumpthrough extends JumpThrough {
  private to: Vector2;
  private from: Vector2;
  private moveTime: number;
  private lerp = 0;
  private movingPositive = true;

  private target: Vector2;

  constructor(_id: number, body: Rect, _hitbox: Rect, moveTo: Vector2, _moveTime: number) {
    super(_id, body, _hitbox);

    this.target = new Vector2(0, 0);
    this.to = new Vector2(moveTo.x, moveTo.y);
    this.from = new Vector2(this.position.x, this.position.y);
    this.moveTime = _moveTime;
  }

  update(delta: number): void {
    super.update(delta);

    if (this.movingPositive) {
      this.lerp = Math.min(this.moveTime, this.lerp + delta);
      if (this.lerp === this.moveTime) {
        this.movingPositive = false;
      }
    } else {
      this.lerp = Math.max(0, this.lerp - delta);
      if (this.lerp === 0) {
        this.movingPositive = true;
      }
    }
    lerpVector2(this.target, this.from, this.to, Easing.Cubic.InOut(this.lerp));

    this.moveTo(this.target);
  }
}
