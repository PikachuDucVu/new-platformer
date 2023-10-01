export enum Direction {
  TOP = 'TOP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export const directionValue: Record<Direction, number> = {
  [Direction.TOP]: 1,
  [Direction.DOWN]: -1,
  [Direction.LEFT]: -1,
  [Direction.RIGHT]: 1
};
