// Original demo inputs; these are not recovered upstream assets.
export function makeGlyphAtlas() {
  const tileSize = 32;
  return { characters: [' ', '.', ':', '+', '*', '#'], tileSize, width: tileSize * 6 };
}

export function makeSourcePixels(width, height) {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = x / width * 2 - 1, ny = y / height * 2 - 1;
      const radius = Math.hypot(nx, ny);
      const bands = (Math.sin(radius * 18 - Math.atan2(ny, nx) * 3) + 1) / 2;
      const signal = Math.max(0, 1 - radius) * bands;
      const i = (y * width + x) * 4;
      data[i] = Math.round(255 * signal);
      data[i + 1] = Math.round(255 * Math.sqrt(signal));
      data[i + 2] = Math.round(255 * Math.min(1, signal * 1.5));
      data[i + 3] = 255;
    }
  }
  return data;
}
