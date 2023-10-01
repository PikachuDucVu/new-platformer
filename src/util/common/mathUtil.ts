import { Color, Vector2 } from "gdxts";

export const lerpVector2 = (
  output: Vector2,
  value1: Vector2,
  value2: Vector2,
  alpha: number
): Vector2 => {
  return output
    .setVector(value2)
    .subVector(value1)
    .scale(alpha)
    .addVector(value1);
};

export const lerpColor = (
  output: Color,
  color1: Color,
  color2: Color,
  alpha: number
): Color => {
  const r = lerp(color1.r, color2.r, alpha);
  const g = lerp(color1.g, color2.g, alpha);
  const b = lerp(color1.b, color2.b, alpha);
  const a = lerp(color1.a, color2.a, alpha);
  return output.set(r, g, b, a);
};

export const lerp = (start: number, end: number, alpha: number): number => {
  return start + (end - start) * alpha;
};

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export type Ref = {
  value: number;
};

export function smoothDamp(
  current: number,
  target: number,
  currentVelocityRef: Ref,
  smoothTime: number,
  maxSpeed: number = Infinity,
  deltaTime: number
): number {
  // Based on Game Programming Gems 4 Chapter 1.10
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;

  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  let change = current - target;
  const originalTo = target;

  // Clamp maximum speed
  const maxChange = maxSpeed * smoothTime;
  change = clamp(change, -maxChange, maxChange);
  target = current - change;

  const temp = (currentVelocityRef.value + omega * change) * deltaTime;
  currentVelocityRef.value = (currentVelocityRef.value - omega * temp) * exp;
  let output = target + (change + temp) * exp;

  // Prevent overshooting
  if (originalTo - current > 0.0 === output > originalTo) {
    output = originalTo;
    currentVelocityRef.value = (output - originalTo) / deltaTime;
  }

  return output;
}

export function smoothDampVec2(
  current: Vector2,
  target: Vector2,
  currentVelocityRef: Vector2,
  smoothTime: number,
  maxSpeed: number = Infinity,
  deltaTime: number,
  out: Vector2
) {
  // Based on Game Programming Gems 4 Chapter 1.10
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;

  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

  let targetX = target.x;
  let targetY = target.y;

  let changeX = current.x - targetX;
  let changeY = current.y - targetY;

  const originalToX = targetX;
  const originalToY = targetY;

  // Clamp maximum speed
  const maxChange = maxSpeed * smoothTime;

  const maxChangeSq = maxChange * maxChange;
  const magnitudeSq = changeX * changeX + changeY * changeY;

  if (magnitudeSq > maxChangeSq) {
    const magnitude = Math.sqrt(magnitudeSq);
    changeX = (changeX / magnitude) * maxChange;
    changeY = (changeY / magnitude) * maxChange;
  }

  targetX = current.x - changeX;
  targetY = current.y - changeY;

  const tempX = (currentVelocityRef.x + omega * changeX) * deltaTime;
  const tempY = (currentVelocityRef.y + omega * changeY) * deltaTime;

  currentVelocityRef.x = (currentVelocityRef.x - omega * tempX) * exp;
  currentVelocityRef.y = (currentVelocityRef.y - omega * tempY) * exp;

  out.x = targetX + (changeX + tempX) * exp;
  out.y = targetY + (changeY + tempY) * exp;

  // Prevent overshooting
  const origMinusCurrentX = originalToX - current.x;
  const origMinusCurrentY = originalToY - current.y;
  const outMinusOrigX = out.x - originalToX;
  const outMinusOrigY = out.y - originalToY;

  if (
    origMinusCurrentX * outMinusOrigX + origMinusCurrentY * outMinusOrigY >
    0
  ) {
    out.x = originalToX;
    out.y = originalToY;

    currentVelocityRef.x = (out.x - originalToX) / deltaTime;
    currentVelocityRef.y = (out.y - originalToY) / deltaTime;
  }

  return out;
}
