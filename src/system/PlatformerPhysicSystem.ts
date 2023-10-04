import { GameManager } from "..";

export const register = (manager: GameManager) => {
  manager.addSystem(() => {
    return {
      process(delta) {
        manager.context.world.update(delta);
      },
    };
  }, true);
};
