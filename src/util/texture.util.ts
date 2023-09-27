import { Texture, TextureRegion } from "gdxts";

export const splitTexture = (
  texture: Texture,
  cols: number,
  rows: number,
  padding?: number | [number, number] | [number, number, number, number]
): TextureRegion[] => {
  if (padding === undefined) {
    padding = 0;
  }
  if (typeof padding === "number") {
    padding = [padding, padding, padding, padding];
  }
  if (padding.length === 2) {
    padding = [padding[0], 0, padding[1], 0];
  }

  const { width, height } = texture;
  const regionWidth = width / cols;
  const regionHeight = height / rows;

  const regions = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      regions.push(
        new TextureRegion(
          texture,
          x * regionWidth + padding[0],
          y * regionHeight + padding[2],
          regionWidth - padding[0] - padding[1],
          regionHeight - padding[2] - padding[3],
          {}
        )
      );
    }
  }
  return regions;
};
