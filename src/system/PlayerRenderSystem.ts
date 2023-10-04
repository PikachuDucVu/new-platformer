import { Animation, PlayMode, TextureRegion } from "gdxts";
import { GameManager } from "..";
import { Direction } from "../lib/enum/direction";
import { splitTexture } from "../util/texture.util";

interface DustEffect {
  type: "jump" | "run" | "land";
  x: number;
  y: number;
  time: number;
  duration: number;
}

const JUMP_DUST_DURATION = 0.5;
const RUN_DUST_DURATION = 0.5;
const LAND_DUST_DURATION = 0.2;

export const register = (manager: GameManager) => {
  const playerEntity = manager.context.player;

  const batch = manager.context.batch;

  const assetManager = manager.context.assetManager;
  const dustAtlas = assetManager.getAtlas("dust")!;

  const jumpDustAnim = new Animation(dustAtlas.findRegions("jump"), 1 / 12);
  const runDustAnim = new Animation(dustAtlas.findRegions("run"), 1 / 6);
  const landDustAnim = new Animation(dustAtlas.findRegions("fall"), 1 / 24);

  const effects: DustEffect[] = [];

  const playerSheet = assetManager.getTexture("playerSheet")!;
  const playerRegions = splitTexture(playerSheet, 6, 6, [0, 1]);
  const idleAnimation = new Animation(playerRegions.slice(0, 4), 1 / 12);
  const runAnimation = new Animation(playerRegions.slice(6, 12), 1 / 24);
  const jumpRegion = playerRegions[30];
  const landRegion = playerRegions[31];
  const slideRegion = playerRegions[19];

  let onGround = true;
  let playerStateTime = 0;
  const PLAYER_OFFSET_Y = 2;

  let accumulate = 0;

  manager.addSystem(() => {
    return {
      process(delta) {
        for (let i = effects.length - 1; i >= 0; i--) {
          const fx = effects[i];
          fx.time += delta;
          if (fx.time >= fx.duration) {
            effects.splice(i, 1);
            continue;
          }
        }

        playerStateTime += delta;

        let playerRegion: TextureRegion = idleAnimation.getKeyFrame(playerStateTime, PlayMode.LOOP);
        if (playerEntity.onGround && !playerEntity.isDashing) {
          if (!onGround) {
            onGround = true;
            effects.push({
              type: "land",
              x: playerEntity.position.x + playerEntity.hitbox.width / 2,
              y: playerEntity.position.y + playerEntity.hitbox.height,
              time: 0,
              duration: LAND_DUST_DURATION,
            });
          }
          if (playerEntity.speed.x === 0) {
            playerRegion = idleAnimation.getKeyFrame(playerStateTime, PlayMode.LOOP);
            accumulate = 0;
          } else {
            playerRegion = runAnimation.getKeyFrame(playerStateTime, PlayMode.LOOP);
            accumulate += delta;
            if (accumulate > 0.1) {
              accumulate = 0;
              effects.push({
                type: "run",
                x: playerEntity.position.x + playerEntity.hitbox.width / 2,
                y: playerEntity.position.y + playerEntity.hitbox.height,
                time: 0,
                duration: RUN_DUST_DURATION,
              });
            }
          }
        } else if (!playerEntity.onGround && !playerEntity.isDashing) {
          if (onGround) {
            onGround = false;
            playerStateTime = 0;
            effects.push({
              type: "jump",
              x: playerEntity.position.x + playerEntity.hitbox.width / 2,
              y: playerEntity.position.y + playerEntity.hitbox.height,
              time: 0,
              duration: JUMP_DUST_DURATION,
            });
          }
          if (playerEntity.speed.y > 0) {
            playerRegion = landRegion;
          } else {
            playerRegion = jumpRegion;
          }
        } else if (playerEntity.isDashing) {
          playerRegion = slideRegion;
        }
        playerRegion.draw(
          batch,
          playerEntity.position.x - playerEntity.hitbox.width / 2,
          playerEntity.position.y - playerEntity.hitbox.height + PLAYER_OFFSET_Y,
          playerEntity.hitbox.width * 2,
          playerEntity.hitbox.height * 2,
          playerEntity.hitbox.width,
          playerEntity.hitbox.height,
          0,
          playerEntity.facing === Direction.LEFT ? -1 : 1,
          1
        );

        for (let fx of effects) {
          if (fx.type === "jump") {
            jumpDustAnim.getKeyFrame(fx.time, PlayMode.NORMAL).draw(batch, fx.x - 26, fx.y - 10, 52, 20);
          } else if (fx.type === "land") {
            landDustAnim.getKeyFrame(fx.time, PlayMode.NORMAL).draw(batch, fx.x - 26, fx.y - 10, 52, 20);
          } else {
            runDustAnim.getKeyFrame(fx.time, PlayMode.NORMAL).draw(batch, fx.x - 26, fx.y - 5, 52, 20);
          }
        }
      },
    };
  });
};
