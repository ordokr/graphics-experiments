import test from 'node:test';
import assert from 'node:assert/strict';
test('fog preset bounds the host volume allocation and shader loop', async () => {
  const { FROXEL_PIXEL_SIZE, FROXEL_SLICE_COUNT, MAX_FROXEL_SLICES } = await import('./fog-constants.mjs');
  assert.ok(Number.isInteger(FROXEL_PIXEL_SIZE) && FROXEL_PIXEL_SIZE >= 16);
  assert.ok(FROXEL_SLICE_COUNT > 0 && FROXEL_SLICE_COUNT <= MAX_FROXEL_SLICES);
  assert.ok(MAX_FROXEL_SLICES <= 64);
  assert.ok(Math.floor(1100 / FROXEL_PIXEL_SIZE) * Math.floor(650 / FROXEL_PIXEL_SIZE) * FROXEL_SLICE_COUNT < 150000);
});
