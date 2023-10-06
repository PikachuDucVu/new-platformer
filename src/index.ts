import {
  AssetManager,
  MultiTextureBatch,
  PolygonBatch,
  TextureFilter,
  createGameLoop,
  createStage,
  createViewport,
} from "gdxts";
import { WORLD_HEIGHT, WORLD_WIDTH, getRandomInt } from "./Constants";
import { Controls } from "./controls";
import { Player } from "./lib/entities/Player";
import { PlatformWorld } from "./lib/world";
import mapData from "./map/test.json";
import { Manager } from "./system/System";
import { Frame } from "./types";
import { InputStore } from "./util/InputStore";
import { loadMemDebugScript, showDebugInfo } from "./util/mem.debug";
import { io } from "socket.io-client";

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

  const socket = io("ws://localhost:3000/");

  socket.on("connected", () => {
    console.log(`user ${socket.id} connected`);

    socket.emit("findMatch");
  });

  let index: number | undefined = undefined;
  let roomId: string | undefined = undefined;

  socket.on("matchFound", (e) => {
    console.log(e);
    const { roomId: newRoomId } = e;
    roomId = newRoomId;
    index = e.index;
    console.log(index);
  });

  const batch = new MultiTextureBatch(gl);
  batch.setYDown(true);

  const controls = new Controls();
  const world = new PlatformWorld(controls);
  const player = world.createPlayer(
    {
      x: getRandomInt(100, 400),
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

  const manager = new Manager()
    .register("camera", camera)
    .register("viewport", viewport)
    .register("gl", gl)
    .register("assetManager", assetManager)
    .register("controls", controls)
    .register("batch", batch)
    .register("playerId", player)
    .register("player", playerEntity)
    .register("frame", {
      current: 0,
    } as Frame)
    .register("inputs", new InputStore())
    .register("world", world)
    .register("socket", socket);

  // initKeyboardInputSystem(controls);
  await import("./system/ControlSystem").then((system) => system.register(manager, 10));
  await import("./system/InputHandlingSystem").then((system) => system.register(manager));
  await import("./system/PlatformerPhysicSystem").then((system) => system.register(manager));
  await import("./system/BgRenderSystem").then((system) => system.register(manager));
  await import("./system/PlayerRenderSystem").then((system) => system.register(manager));
  await import("./system/CameraFollowingSystem").then((system) => system.register(manager));
  await import("./system/SaveLoadStateSystem").then((system) => system.register(manager));

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  const loop = createGameLoop((delta) => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    PolygonBatch.resetTotalDrawCalls();

    manager.process(delta);
  });

  SHOW_MEMORY && showDebugInfo(stage.getInfo(), gl, loop);

  return manager;
};

export type GameManager = Awaited<ReturnType<typeof init>>;

init();
