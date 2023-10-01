type Button = {
  check: boolean;
  pressed: boolean;
  release: () => void;
};

export class Controls {
  pressedKeys: { [key in string]: boolean } = {};

  jump: Button = {
    check: false,
    pressed: false,
    release: () => {
      this.jump.pressed = false;
    },
  };

  // grab: Button = {
  //   check: false,
  //   pressed: false,
  //   release: () => {
  //     this.grab.pressed = false;
  //   }
  // };

  dash: Button = {
    check: false,
    pressed: false,
    release: () => {
      this.dash.pressed = false;
    },
  };

  moveX: number = 0;
  moveY: number = 0;

  constructor() {}

  update() {}
}
