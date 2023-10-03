import { Controls } from "../controls";

export const initKeyboardInputSystem = (controls: Controls) => {
  document.body.addEventListener("keydown", (ev) => {
    switch (ev.key) {
      case "x":
        if (!controls.jump.check) {
          controls.jump.pressed = true;
          controls.jump.check = true;
        }
        break;

      // case 'z':
      //   controls.grab.pressed = true;
      //   controls.grab.check = true;
      //   break;

      case "c":
        controls.dash.pressed = true;
        controls.dash.check = true;
        break;

      case "ArrowLeft":
        controls.pressedKeys["ArrowRight"] = false;
        controls.moveX = -1;
        break;

      case "ArrowRight":
        controls.pressedKeys["ArrowLeft"] = false;
        controls.moveX = 1;
        break;

      case "ArrowUp":
        controls.pressedKeys["ArrowDown"] = false;
        controls.moveY = -1;
        break;

      case "ArrowDown":
        controls.pressedKeys["ArrowUp"] = false;
        controls.moveY = 1;
        break;

      default:
        break;
    }

    controls.pressedKeys[ev.key] = true;
  });

  document.documentElement.addEventListener("keyup", (ev) => {
    switch (ev.key) {
      case "x":
        controls.jump.pressed = false;
        controls.jump.check = false;
        break;

      // case 'z':
      //   controls.grab.pressed = false;
      //   controls.grab.check = false;
      //   break;

      case "c":
        controls.dash.pressed = false;
        controls.dash.check = false;
        break;

      case "ArrowLeft":
        if (controls.pressedKeys[ev.key]) {
          controls.moveX = 0;
        }
        break;

      case "ArrowRight":
        if (controls.pressedKeys[ev.key]) {
          controls.moveX = 0;
        }
        break;

      case "ArrowUp":
        if (controls.pressedKeys[ev.key]) {
          controls.moveY = 0;
        }
        break;

      case "ArrowDown":
        if (controls.pressedKeys[ev.key]) {
          controls.moveY = 0;
        }
        break;

      default:
        break;
    }

    controls.pressedKeys[ev.key] = false;
  });
};
