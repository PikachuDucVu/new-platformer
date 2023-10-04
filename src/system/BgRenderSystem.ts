import { Color, Texture } from "gdxts";
import { GameManager } from "..";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../Constants";
import { EntityType } from "../lib/world";

export const register = (manager: GameManager) => {
  const batch = manager.context.batch;
  const world = manager.context.world;

  const white = Texture.createWhiteTexture(manager.context.gl);

  const bg = manager.context.assetManager.getTexture("bg")!;
  manager.addSystem(() => {
    return {
      process() {
        batch.draw(bg, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);

        batch.setColor(0, 0, 0, 1);
        for (let solid of world.getEntities(EntityType.SOLID)) {
          batch.draw(white, solid.position.x, solid.position.y, solid.hitbox.width, solid.hitbox.height);
        }
        batch.setColor(Color.WHITE);
      },
      dispose() {
        white.dispose();
      },
    };
  });
};
