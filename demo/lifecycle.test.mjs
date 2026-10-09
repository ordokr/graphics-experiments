import test from 'node:test';
import assert from 'node:assert/strict';
import { mountResources } from './lifecycle.mjs';
test('failed initialization releases already allocated resources in reverse order', async () => {
  const released = [];
  await assert.rejects(mountResources(async own => {
    own(() => released.push('renderer'));
    own(() => released.push('geometry'));
    throw new Error('init failed');
  }), /init failed/);
  assert.deepEqual(released, ['geometry', 'renderer']);
});
test('successful mount returns idempotent cleanup', async () => {
  let disposed = 0;
  const cleanup = await mountResources(async own => own(() => disposed++));
  cleanup(); cleanup();
  assert.equal(disposed, 1);
});
