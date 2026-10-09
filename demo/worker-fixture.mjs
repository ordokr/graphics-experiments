import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const workerUrl = new URL('../voxelPathfindingWorker.ts', import.meta.url);

export function makeWorkerGrid() {
  return {
    countX: 2, countY: 1, countZ: 2,
    startX: 0, startY: 0, startZ: 0,
    voxelSizeXZ: 1, voxelHeight: 1, basePlatformHeight: 0,
    xEdgesOpen: false, zEdgesOpen: false, twoSided: false,
    gridX: 0, gridZ: 0, gridStartX: 0, gridStartZ: 0, step: 1,
    instanceCount: 0,
    paramA: new Float32Array(0), paramB: new Float32Array(0), paramC: new Float32Array(0),
    minHeightUnits: 1, maxHeightUnits: 1,
    minPedestalUnits: 0, maxPedestalUnits: 0,
    minPaddingUnits: 0, maxPaddingUnits: 0,
    minPedestalPaddingUnits: 0, maxPedestalPaddingUnits: 0,
    minPedestalTaperX: 0, maxPedestalTaperX: 0,
    minPedestalTaperZ: 0, maxPedestalTaperZ: 0,
    minTaperX: 0, maxTaperX: 0,
    minTaperZ: 0, maxTaperZ: 0,
    buildingExponent: 1, pedestalExponent: 1, paddingLimitCap: 0,
    rollStep: 0, twistStep: 0
  };
}

export async function runWorkerFixture({ maxPaths = 2, maxTries = 12 } = {}) {
  const source = await readFile(workerUrl, 'utf8');
  const javascript = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None }
  }).outputText;
  const messages = [];
  const self = { postMessage(message) { messages.push(message); } };
  const deterministicMath = Object.create(Math);
  deterministicMath.random = () => 0;
  vm.runInNewContext(javascript, {
    self,
    Math: deterministicMath,
    Float32Array, Int8Array, Int32Array, Uint8Array, Uint16Array,
    Array, Set, Number, Object, Error
  }, { filename: workerUrl.pathname });
  self.onmessage({ data: {
    type: 'build', id: 1, grid: makeWorkerGrid(),
    maxPaths, maxTries, maxPathsPerVertex: 4
  }});
  return messages;
}
