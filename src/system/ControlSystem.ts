import { GameManager } from "..";
import { AllowedActions } from "../types";

export const KEY_MAP: Record<string, AllowedActions> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  x: "jump",
  c: "dash",
};

export const register = (manager: GameManager, delay = 1) => {
  const inputs = manager.context.inputs;
  const frame = manager.context.frame;

  document.body.addEventListener("keydown", (ev) => {
    const key = KEY_MAP[ev.key];
    if (key) {
      inputs.add(frame.current + delay, { type: "down", key });
    }
  });

  document.documentElement.addEventListener("keyup", (ev) => {
    const key = KEY_MAP[ev.key];
    if (key) {
      inputs.add(frame.current + delay, { type: "up", key });
    }
  });
};
