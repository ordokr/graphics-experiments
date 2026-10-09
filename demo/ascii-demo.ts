import * as THREE from 'three/webgpu';
import { uniform } from 'three/tsl';
import { buildAsciiMaterial } from '../asciiMaterial';
import { makeGlyphAtlas, makeSourcePixels } from './fixtures.mjs';
import { mountResources } from './lifecycle.mjs';

export async function mountAscii(canvas: HTMLCanvasElement) {
  return mountResources(async (own: (release: () => void) => void) => {
  const width = 1100, height = 650, cell = 10;
  const grid = new THREE.Vector2(width / cell, height / cell);
  const atlas = makeGlyphAtlas();
  const glyphCanvas = document.createElement('canvas');
  glyphCanvas.width = atlas.width; glyphCanvas.height = atlas.tileSize;
  const context = glyphCanvas.getContext('2d')!;
  context.font = 'bold 28px monospace'; context.fillStyle = 'white';
  context.textAlign = 'center'; context.textBaseline = 'middle';
  atlas.characters.forEach((glyph: string, i: number) => context.fillText(glyph, i * 32 + 16, 16));
  const atlasTexture = new THREE.CanvasTexture(glyphCanvas);
  own(() => atlasTexture.dispose());
  atlasTexture.minFilter = atlasTexture.magFilter = THREE.NearestFilter;
  const sourceTexture = new THREE.DataTexture(makeSourcePixels(grid.x, grid.y), grid.x, grid.y);
  own(() => sourceTexture.dispose());
  sourceTexture.needsUpdate = true;
  const blank = new THREE.DataTexture(new Uint8Array(grid.x * grid.y * 4), grid.x, grid.y);
  own(() => blank.dispose());
  blank.needsUpdate = true;
  const gradientTexture = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255, 50, 200, 255, 255]), 2, 1);
  own(() => gradientTexture.dispose());
  gradientTexture.needsUpdate = true;
  const material = buildAsciiMaterial({
    atlasTexture, glyphTexture: blank, colorTexture: blank, sourceTexture, gradientTexture,
    gradientRowCount: 1, useRampDither: true, useGradientSignal: false, invertGradient: false,
    glyphRampIndices: [0, 1, 2, 3, 4, 5],
    viewportSizeUniform: uniform(new THREE.Vector2(width, height)), gridSizeUniform: uniform(grid),
    gridOriginUniform: uniform(new THREE.Vector2()), gridDisplaySizeUniform: uniform(new THREE.Vector2(width, height)),
    displayCellSizeUniform: uniform(new THREE.Vector2(cell, cell)), atlasSizeUniform: uniform(new THREE.Vector2(atlas.width, 32)),
    tileSizeUniform: uniform(new THREE.Vector2(32, 32)), atlasColsUniform: uniform(6), gradientIndexUniform: uniform(0),
    debugTimeUniform: uniform(0), emailDyeDebugEnabledUniform: uniform(0),
    emailDyeDebugCenterUniform: uniform(new THREE.Vector2()), emailDyeDebugHalfSizeUniform: uniform(new THREE.Vector2()),
  });
  const renderer = new THREE.WebGPURenderer({ canvas, antialias: true });
  own(() => material.dispose()); own(() => renderer.dispose());
  renderer.setPixelRatio(1); renderer.setSize(width, height, false); await renderer.init();
  const scene = new THREE.Scene();
  const geometry = new THREE.PlaneGeometry(2, 2);
  own(() => geometry.dispose());
  scene.add(new THREE.Mesh(geometry, material));
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
  camera.position.z = 1;
  await renderer.renderAsync(scene, camera);
  });
}
