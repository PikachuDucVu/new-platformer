import { GameLoop, PolygonBatch } from "gdxts";

export const loadMemDebugScript = async () => {
  // @ts-ignore
  await import("https://greggman.github.io/webgl-memory/webgl-memory.js");
};

export const showDebugInfo = (
  target: HTMLElement,
  gl: WebGLRenderingContext,
  loop: GameLoop
) => {
  target.style.backgroundColor = "rgba(0,0,0,0.5)";
  target.style.maxHeight = "50%";
  target.style.top = "0";
  target.style.left = "0";
  const ext = gl.getExtension("GMAN_webgl_memory");
  setInterval(() => {
    target.innerHTML = `<pre>${JSON.stringify(
      {
        "Draw calls": PolygonBatch.totalDrawCalls,
        FPS: loop.getFps(),
        ...ext.getMemoryInfo(),
      },
      null,
      2
    )}</pre>`;
  }, 1000);
};
