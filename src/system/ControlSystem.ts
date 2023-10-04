import { GameManager } from "..";
import { initKeyboardInputSystem } from "../util/keyboardInput";

export const register = (manager: GameManager) => {
  initKeyboardInputSystem(manager.context.controls);
};
