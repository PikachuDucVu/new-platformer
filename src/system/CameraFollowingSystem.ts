import { Vector2 } from "gdxts";
import { GameManager } from "..";
import { smoothDampVec2 } from "../util/common/mathUtil";

export const register = (manager: GameManager) => {
  manager.onBefore(() => {
    const playerEntity = manager.context.player;
    const camPos = new Vector2(playerEntity.position.x, playerEntity.position.y);
    const camTarget = new Vector2();
    const vel = new Vector2();

    const batch = manager.context.batch;
    const camera = manager.context.camera;

    camera.zoom = 0.75;
    camera.setYDown(true);

    return {
      process(delta) {
        camTarget.set(playerEntity.position.x, playerEntity.position.y);
        smoothDampVec2(camPos, camTarget, vel, 0.5, Infinity, delta, camPos);

        camera.setPosition(camPos.x, camPos.y);
        camera.update();
        batch.setProjection(camera.combined);
        batch.begin();
      },
    };
  });

  manager.onAfter(() => {
    const batch = manager.context.batch;

    return {
      process() {
        batch.end();
      },
    };
  });
};
