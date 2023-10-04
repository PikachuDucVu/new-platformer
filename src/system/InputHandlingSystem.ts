import { GameManager } from "..";
import { Controls } from "../controls";
import { AllowedActions } from "../types";

const handleKeyDown = (controls: Controls, key: AllowedActions) => {
  switch (key) {
    case "jump":
      if (!controls.jump.check) {
        controls.jump.pressed = true;
        controls.jump.check = true;
      }
      break;

    case "dash":
      controls.dash.pressed = true;
      controls.dash.check = true;
      break;

    case "left":
      controls.pressedKeys["right"] = false;
      controls.moveX = -1;
      break;

    case "right":
      controls.pressedKeys["left"] = false;
      controls.moveX = 1;
      break;

    case "up":
      controls.pressedKeys["down"] = false;
      controls.moveY = -1;
      break;

    case "down":
      controls.pressedKeys["up"] = false;
      controls.moveY = 1;
      break;

    default:
      break;
  }

  controls.pressedKeys[key] = true;
};

const handleKeyUp = (controls: Controls, key: AllowedActions) => {
  switch (key) {
    case "jump":
      controls.jump.pressed = false;
      controls.jump.check = false;
      break;

    case "dash":
      controls.dash.pressed = false;
      controls.dash.check = false;
      break;

    case "left":
      if (controls.pressedKeys[key]) {
        controls.moveX = 0;
      }
      break;

    case "right":
      if (controls.pressedKeys[key]) {
        controls.moveX = 0;
      }
      break;

    case "up":
      if (controls.pressedKeys[key]) {
        controls.moveY = 0;
      }
      break;

    case "down":
      if (controls.pressedKeys[key]) {
        controls.moveY = 0;
      }
      break;

    default:
      break;
  }

  controls.pressedKeys[key] = false;
};

export const register = (manager: GameManager) => {
  const frame = manager.context.frame;
  const inputs = manager.context.inputs;
  const controls = manager.context.controls;

  manager.onBefore(() => {
    return {
      process() {
        frame.current++;
      },
    };
  });

  manager.addSystem(() => {
    return {
      process() {
        const frameInputs = inputs.get(frame.current);
        if (!frameInputs) return;
        for (let input of frameInputs) {
          if (input.type === "down") {
            handleKeyDown(controls, input.key);
          } else {
            handleKeyUp(controls, input.key);
          }
        }
      },
    };
  });
};
