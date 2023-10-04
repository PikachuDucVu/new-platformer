export type AllowedActions = "left" | "right" | "up" | "down" | "jump" | "dash";

export interface Input {
  type: "up" | "down";
  key: AllowedActions;
}

export interface Frame {
  current: number;
}
