import {
  Animation,
  AssetManager,
  Color,
  MultiTextureBatch,
  PlayMode,
  PolygonBatch,
  Texture,
  TextureFilter,
  TextureRegion,
  Vector2,
  createGameLoop,
  createStage,
  createViewport,
} from "gdxts";
import { Controls } from "./controls";
import { Player } from "./lib/entities/Player";
import { Direction } from "./lib/enum/direction";
import { EntityType, PlatformWorld } from "./lib/world";
import mapData from "./map/test.json";
import { smoothDampVec2 } from "./util/common/mathUtil";
import { initKeyboardInputSystem } from "./util/keyboardInput";
import { loadMemDebugScript, showDebugInfo } from "./util/mem.debug";
import { splitTexture } from "./util/texture.util";

const WORLD_WIDTH = 1152;
const WORLD_HEIGHT = 720;

const SHOW_MEMORY = true;

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

const init = async () => {
  SHOW_MEMORY && (await loadMemDebugScript());

  const stage = createStage();
  const canvas = stage.getCanvas();

  const viewport = createViewport(canvas, WORLD_WIDTH, WORLD_HEIGHT, {
    crop: false,
  });

  const gl = viewport.getContext();
  const camera = viewport.getCamera();
  camera.zoom = 0.75;
  camera.setYDown(true);

  const assetManager = new AssetManager(gl);

  assetManager.loadAtlas("./assets/atlas/dust.atlas", "dust");
  assetManager.loadTexture("./assets/sheet/player.png", "playerSheet", {
    minFilter: TextureFilter.Nearest,
    magFilter: TextureFilter.Nearest,
  });

  assetManager.loadTexture("./assets/tex/back.png", "bg", {
    minFilter: TextureFilter.Nearest,
    magFilter: TextureFilter.Nearest,
  });

  await assetManager.finishLoading();

  const dustAtlas = assetManager.getAtlas("dust")!;

  const jumpDustAnim = new Animation(dustAtlas.findRegions("jump"), 1 / 12);
  const runDustAnim = new Animation(dustAtlas.findRegions("run"), 1 / 6);
  const landDustAnim = new Animation(dustAtlas.findRegions("fall"), 1 / 24);

  const effects: DustEffect[] = [];

  const bg = assetManager.getTexture("bg")!;
  const playerSheet = assetManager.getTexture("playerSheet")!;
  const playerRegions = splitTexture(playerSheet, 6, 6, [0, 1]);
  const idleAnimation = new Animation(playerRegions.slice(0, 4), 1 / 12);
  const runAnimation = new Animation(playerRegions.slice(6, 12), 1 / 24);
  const jumpRegion = playerRegions[30];
  const landRegion = playerRegions[31];
  const slideRegion = playerRegions[19];
  // const jumpAnimation = new Animation(playerRegions.slice(30, 32), 1 / 12);

  const batch = new MultiTextureBatch(gl);
  batch.setYDown(true);

  const white = Texture.createWhiteTexture(gl);

  const controls = new Controls();
  const world = new PlatformWorld(controls);
  const player = world.createPlayer(
    {
      x: 100,
      y: 500,
      width: 32,
      height: 32,
    },
    undefined,
    {
      maxJumpCount: 2,
      // disableDash: true,
      grabWallOnTouch: false,
      disableWallJump: true,
    }
  );
  const playerEntity = world.getEntity(player)! as Player;

  const solidLayer = mapData.layers.find((l) => l.name === "solid")!;
  solidLayer.objects.forEach((obj) => {
    world.createSolidPlatform({
      x: obj.x,
      y: obj.y,
      width: obj.width,
      height: obj.height,
    });
  });

  initKeyboardInputSystem(controls);

  const camPos = new Vector2(playerEntity.position.x, playerEntity.position.y);
  const camTarget = new Vector2();
  const vel = new Vector2();

  let onGround = true;
  let playerStateTime = 0;
  const PLAYER_OFFSET_Y = 2;

  let accumulate = 0;

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  const loop = createGameLoop((delta) => {
    for (let i = effects.length - 1; i >= 0; i--) {
      const fx = effects[i];
      fx.time += delta;
      if (fx.time >= fx.duration) {
        effects.splice(i, 1);
        continue;
      }
    }
    playerStateTime += delta;
    gl.clear(gl.COLOR_BUFFER_BIT);
    PolygonBatch.resetTotalDrawCalls();

    world.update(delta);

    camTarget.set(playerEntity.position.x, playerEntity.position.y);
    smoothDampVec2(camPos, camTarget, vel, 0.5, Infinity, delta, camPos);

    camera.setPosition(camPos.x, camPos.y);
    camera.update();
    batch.setProjection(camera.combined);
    batch.begin();
    batch.draw(bg, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    batch.setColor(0, 0, 0, 1);
    for (let solid of world.getEntities(EntityType.SOLID)) {
      batch.draw(
        white,
        solid.position.x,
        solid.position.y,
        solid.hitbox.width,
        solid.hitbox.height
      );
    }
    batch.setColor(Color.WHITE);

    let playerRegion: TextureRegion = idleAnimation.getKeyFrame(
      playerStateTime,
      PlayMode.LOOP
    );
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
        playerRegion = idleAnimation.getKeyFrame(
          playerStateTime,
          PlayMode.LOOP
        );
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
        jumpDustAnim
          .getKeyFrame(fx.time, PlayMode.NORMAL)
          .draw(batch, fx.x - 26, fx.y - 10, 52, 20);
      } else if (fx.type === "land") {
        landDustAnim
          .getKeyFrame(fx.time, PlayMode.NORMAL)
          .draw(batch, fx.x - 26, fx.y - 10, 52, 20);
      } else {
        runDustAnim
          .getKeyFrame(fx.time, PlayMode.NORMAL)
          .draw(batch, fx.x - 26, fx.y - 5, 52, 20);
      }
    }

    batch.end();
  });

  SHOW_MEMORY && showDebugInfo(stage.getInfo(), gl, loop);
};

init();
