import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

async function checkSceneDefaults(sceneName, parametersName, exportName) {
  const scene = await readFile(new URL(`../${sceneName}.ts`, import.meta.url), 'utf8');
  const defaults = (await import(`../${parametersName}.ts`))[exportName];
  const referencedKeys = [...scene.matchAll(/(?:this\.parameters|[A-Z_]+_DEFAULTS)\.([A-Za-z][A-Za-z0-9_]*)/g)]
    .map((match) => match[1]);

  for (const key of new Set(referencedKeys)) {
    assert.ok(Object.hasOwn(defaults, key), `${parametersName} is missing ${key}`);
  }
  for (const [key, value] of Object.entries(defaults)) {
    if (typeof value === 'number') assert.ok(Number.isFinite(value), `${key} must be finite`);
    if (key.endsWith('Color')) assert.match(value, /^#[0-9a-f]{6}$/i, `${key} must be a hex color`);
  }
  return defaults;
}

test('planet defaults cover scene parameters with valid atmosphere radii', async () => {
  const defaults = await checkSceneDefaults('PlanetScene', 'PlanetSceneParameters', 'PLANET_SCENE_DEFAULTS');
  assert.ok(defaults.sphere1AtmosphereAltitude > 0);
  assert.ok(defaults.sphere2AtmosphereAltitude > 0);
  assert.ok(defaults.sphere1FalloffPower > 0);
  assert.ok(defaults.sphere2FalloffPower > 0);
  assert.ok(Math.abs(defaults.sphere1PhaseG) < 1);
  assert.ok(Math.abs(defaults.sphere2PhaseG) < 1);
});

test('bioluminescence defaults cover scene parameters with bounded allocations', async () => {
  const defaults = await checkSceneDefaults('BioluminescenceScene', 'BioluminescenceSceneParameters', 'BIOLUMINESCENCE_SCENE_DEFAULTS');
  assert.ok(Number.isInteger(defaults.particleCount) && defaults.particleCount > 0 && defaults.particleCount <= 10000);
  for (const key of ['volumeWidth', 'volumeHeight', 'volumeDepth', 'fieldResX', 'fieldResY', 'fieldResZ', 'densityResX', 'densityResY', 'densityResZ']) {
    assert.ok(defaults[key] > 0 && defaults[key] <= 128, `${key} must be positive and bounded`);
  }
  assert.ok(defaults.bubbleSizeMin > 0 && defaults.bubbleSizeMin <= defaults.bubbleSizeMax);
  assert.ok(defaults.sparkleMin >= 0 && defaults.sparkleMin <= defaults.sparkleMax);
});
