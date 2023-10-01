import { AssetManager, PolygonBatch } from "gdxts";

export abstract class Parallax {
  protected x = 0;
  protected startX = 0;
  protected endX = 0;
  public constructor(
    protected assetManager: AssetManager,
    public size: number,
    protected offsetX = 0
  ) {}
  public abstract act(playerX: number): void;
  public abstract drawSingle(batch: PolygonBatch, x: number): void;
  public draw(batch: PolygonBatch, startX: number, endX: number): void {
    this.startX = startX;
    this.endX = endX;

    let drawStart = this.x;
    while (drawStart + this.size < startX) {
      drawStart += this.size;
    }
    while (drawStart < endX) {
      this.drawSingle(batch, drawStart);
      drawStart += this.size;
    }
  }
}
