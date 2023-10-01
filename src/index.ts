import {
  Color,
  MultiTextureBatch,
  PolygonBatch,
  Texture,
  Vector2,
  createGameLoop,
  createStage,
  createViewport,
} from "gdxts";
import { Controls } from "./controls";
import { EntityType, PlatformWorld } from "./lib/world";
import mapData from "./map/test.json";
import { smoothDampVec2 } from "./util/common/mathUtil";
import { initKeyboardInputSystem } from "./util/keyboardInput";
import { loadMemDebugScript, showDebugInfo } from "./util/mem.debug";

const WORLD_WIDTH = 1152;
const WORLD_HEIGHT = 720;

const SHOW_MEMORY = true;

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

  const batch = new MultiTextureBatch(gl);
  batch.setYDown(true);

  const white = Texture.createWhiteTexture(gl);

  const controls = new Controls();
  const world = new PlatformWorld(controls);
  const player = world.createPlayer(
    {
      x: 100,
      y: 500,
      width: 16,
      height: 16,
    },
    undefined,
    {
      maxJumpCount: 2,
      // disableDash: true,
      grabWallOnTouch: false,
      disableWallJump: true,
    }
  );
  const playerEntity = world.getEntity(player)!;

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

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  const loop = createGameLoop((delta) => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    PolygonBatch.resetTotalDrawCalls();

    world.update(delta);

    camTarget.set(playerEntity.position.x, playerEntity.position.y);
    smoothDampVec2(camPos, camTarget, vel, 0.2, Infinity, delta, camPos);

    camera.setPosition(camPos.x, camPos.y);
    camera.update();
    batch.setProjection(camera.combined);
    batch.begin();
    batch.draw(white, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    batch.setColor(Color.GREEN);
    batch.draw(
      white,
      playerEntity.position.x,
      playerEntity.position.y,
      playerEntity.hitbox.width,
      playerEntity.hitbox.height
    );
    batch.setColor(Color.WHITE);

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

    batch.end();
  });

  SHOW_MEMORY && showDebugInfo(stage.getInfo(), gl, loop);
};

init();
