import test from 'node:test';
import assert from 'node:assert/strict';
import { makeGlyphAtlas, makeSourcePixels } from './fixtures.mjs';

test('atlas has six distinct glyph positions and a transparent blank', () => {
  const atlas = makeGlyphAtlas();
  assert.equal(atlas.characters.length, 6);
  assert.equal(new Set(atlas.characters).size, 6);
  assert.equal(atlas.characters[0], ' ');
  assert.equal(atlas.width, atlas.tileSize * 6);
});

test('source fixture supplies opaque, varying image samples', () => {
  const data = makeSourcePixels(48, 32);
  assert.equal(data.length, 48 * 32 * 4);
  assert.ok(data.some((v, i) => i % 4 === 0 && v > 128));
  assert.ok(data.some((v, i) => i % 4 === 0 && v < 32));
  assert.ok(data.every((v, i) => i % 4 !== 3 || v === 255));
});
