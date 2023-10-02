import {
  Animation,
  AssetManager,
  MultiTextureBatch,
  PlayMode,
  PolygonBatch,
  TextureFilter,
  createGameLoop,
  createStage,
  createViewport,
} from "gdxts";
import { loadMemDebugScript, showDebugInfo } from "./util/mem.debug";
import { splitTexture } from "./util/texture.util";

const WORLD_WIDTH = 384;
const WORLD_HEIGHT = 240;

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
  camera.setYDown(true);

  const batch = new MultiTextureBatch(gl);
  batch.setYDown(true);

  const assetManager = new AssetManager(gl);

  assetManager.loadTexture("./assets/sheet/player.png", "playerSheet", {
    minFilter: TextureFilter.Nearest,
    magFilter: TextureFilter.Nearest,
  });

  assetManager.loadTexture("./assets/tex/back.png", "bg", {
    minFilter: TextureFilter.Nearest,
    magFilter: TextureFilter.Nearest,
  });

  assetManager.loadAtlas("./assets/atlas/character_run.atlas", "runAtlas", {
    generateMipmaps: true,
  });

  await assetManager.finishLoading();

  const playerSheet = assetManager.getTexture("playerSheet")!;
  const bg = assetManager.getTexture("bg")!;

  const playerRegions = splitTexture(playerSheet, 6, 6, [0, 1]);

  const idleAnimation = new Animation(playerRegions.slice(0, 4), 1 / 12);
  const runAnimation = new Animation(playerRegions.slice(6, 12), 1 / 12);

  const kitRunRegions = assetManager
    .getAtlas("runAtlas")!
    .findRegions("run_full");
  const kitRunAnimation = new Animation(kitRunRegions, 1 / 32);

  const MAX_DELTA = 1 / 30;
  let stateTime = 0;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  const loop = createGameLoop((delta) => {
    delta = Math.min(delta, MAX_DELTA);
    stateTime += delta;

    gl.clear(gl.COLOR_BUFFER_BIT);
    PolygonBatch.resetTotalDrawCalls();

    batch.setProjection(camera.combined);
    batch.begin();
    batch.draw(bg, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    idleAnimation
      .getKeyFrame(stateTime, PlayMode.LOOP)
      .draw(batch, 50, 150, 32, 32);
    runAnimation
      .getKeyFrame(stateTime, PlayMode.LOOP)
      .draw(batch, 100, 150, 32, 32);

    kitRunAnimation
      .getKeyFrame(stateTime, PlayMode.LOOP)
      .draw(batch, 150, 150, 125 / 2, 150 / 2);
    batch.end();
  });

  SHOW_MEMORY && showDebugInfo(stage.getInfo(), gl, loop);
};

init();
