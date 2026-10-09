import test from 'node:test';
import assert from 'node:assert/strict';
import { makeWorkerGrid, runWorkerFixture } from './worker-fixture.mjs';

test('real voxel path worker emits a nonzero path with valid finite grid coordinates', async () => {
  const messages = await runWorkerFixture();
  const paths = messages.filter(message => message.type === 'path');
  const done = messages.find(message => message.type === 'done');
  assert.ok(done, 'worker should finish');
  assert.ok(paths.length > 0, 'worker should find at least one path');

  const grid = makeWorkerGrid();
  const nx = grid.countX + 1;
  const ny = grid.countY + 1;
  const nz = grid.countZ + 1;
  const vertexCount = nx * ny * nz;
  for (const { path } of paths) {
    const indices = Array.from(path);
    assert.ok(indices.length > 1, 'path should contain at least two distinct steps');
    assert.ok(indices.every(index => Number.isInteger(index) && index >= 0 && index < vertexCount));
    const points = indices.map(index => {
      const x = index % nx;
      const y = Math.floor(index / nx) % ny;
      const z = Math.floor(index / (nx * ny));
      return [
        grid.startX - grid.voxelSizeXZ / 2 + x * grid.voxelSizeXZ,
        grid.startY - grid.voxelHeight / 2 + y * grid.voxelHeight,
        grid.startZ - grid.voxelSizeXZ / 2 + z * grid.voxelSizeXZ
      ];
    });
    assert.ok(points.every(point => point.every(Number.isFinite)));
    assert.ok(points.some((point, i) => i > 0 && point.some((value, axis) => value !== points[0][axis])));
  }
});
