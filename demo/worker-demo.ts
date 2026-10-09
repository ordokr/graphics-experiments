type WorkerGrid = {
  countX: number; countY: number; countZ: number;
  startX: number; startY: number; startZ: number;
  voxelSizeXZ: number; voxelHeight: number; basePlatformHeight: number;
  xEdgesOpen: boolean; zEdgesOpen: boolean; twoSided: boolean;
  gridX: number; gridZ: number; gridStartX: number; gridStartZ: number;
  step: number; instanceCount: number;
  paramA: Float32Array; paramB: Float32Array; paramC: Float32Array;
  minHeightUnits: number; maxHeightUnits: number;
  minPedestalUnits: number; maxPedestalUnits: number;
  minPaddingUnits: number; maxPaddingUnits: number;
  minPedestalPaddingUnits: number; maxPedestalPaddingUnits: number;
  minPedestalTaperX: number; maxPedestalTaperX: number;
  minPedestalTaperZ: number; maxPedestalTaperZ: number;
  minTaperX: number; maxTaperX: number;
  minTaperZ: number; maxTaperZ: number;
  buildingExponent: number; pedestalExponent: number; paddingLimitCap: number;
  rollStep: number; twistStep: number;
};

type WorkerOutput =
  | { type: 'path'; id: number; path: Int32Array }
  | { type: 'done'; id: number; placed: number; validCount: number }
  | { type: 'error'; id: number; message: string }
  | { type: 'debug'; id: number; stage: string; detail: Record<string, number | string | boolean> };

const makeGrid = (): WorkerGrid => ({
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
  minTaperX: 0, maxTaperX: 0, minTaperZ: 0, maxTaperZ: 0,
  buildingExponent: 1, pedestalExponent: 1, paddingLimitCap: 0,
  rollStep: 0, twistStep: 0
});

export async function mountWorkerDemo(canvas: HTMLCanvasElement): Promise<() => void> {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D rendering is unavailable.');

  const grid = makeGrid();
  const id = 1;
  const paths: Int32Array[] = [];
  let complete = false;
  let failure: string | undefined;
  let disposed = false;
  const worker = new Worker(new URL('../voxelPathfindingWorker.ts', import.meta.url), { type: 'module' });

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(bounds.width * ratio));
    canvas.height = Math.max(1, Math.round(bounds.height * ratio));
    draw();
  };

  const pointFor = (index: number): [number, number, number] | null => {
    const nx = grid.countX + 1;
    const ny = grid.countY + 1;
    const nz = grid.countZ + 1;
    if (!Number.isInteger(index) || index < 0 || index >= nx * ny * nz) return null;
    const x = index % nx;
    const y = Math.floor(index / nx) % ny;
    const z = Math.floor(index / (nx * ny));
    return [
      grid.startX - grid.voxelSizeXZ / 2 + x * grid.voxelSizeXZ,
      grid.startY - grid.voxelHeight / 2 + y * grid.voxelHeight,
      grid.startZ - grid.voxelSizeXZ / 2 + z * grid.voxelSizeXZ
    ];
  };

  function draw() {
    if (disposed) return;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.width;
    const height = canvas.height;
    context!.setTransform(1, 0, 0, 1, 0, 0);
    context!.fillStyle = '#10151d';
    context!.fillRect(0, 0, width, height);
    context!.font = `${14 * ratio}px system-ui, sans-serif`;
    context!.fillStyle = '#e4ebf4';
    context!.fillText(failure ? `Worker error: ${failure}` : complete
      ? paths.length ? `Worker returned ${paths.length} path${paths.length === 1 ? '' : 's'}` : 'Worker finished: no paths found'
      : 'Building paths in voxelPathfindingWorker…', 18 * ratio, 28 * ratio);

    const projected = paths.map(path => Array.from(path, pointFor));
    const all = projected.flat().filter((point): point is [number, number, number] => point !== null);
    if (all.length === 0) return;
    const project = ([x, y, z]: [number, number, number]): [number, number] => [
      (x - z) * 0.72,
      (x + z) * 0.36 - y * 0.82
    ];
    const screenPoints = all.map(project);
    const minX = Math.min(...screenPoints.map(point => point[0]));
    const maxX = Math.max(...screenPoints.map(point => point[0]));
    const minY = Math.min(...screenPoints.map(point => point[1]));
    const maxY = Math.max(...screenPoints.map(point => point[1]));
    const scale = Math.min(width * 0.7 / Math.max(0.01, maxX - minX), height * 0.65 / Math.max(0.01, maxY - minY));
    const centerX = width / 2 - ((minX + maxX) / 2) * scale;
    const centerY = height * 0.58 - ((minY + maxY) / 2) * scale;

    projected.forEach((path, pathIndex) => {
      const valid = path.filter((point): point is [number, number, number] => point !== null).map(project);
      if (valid.length < 2) return;
      context!.beginPath();
      valid.forEach(([x, y], index) => {
        const sx = centerX + x * scale;
        const sy = centerY + y * scale;
        if (index === 0) context!.moveTo(sx, sy);
        else context!.lineTo(sx, sy);
      });
      context!.strokeStyle = ['#55d6be', '#ffb454', '#a78bfa', '#fb7185'][pathIndex % 4];
      context!.lineWidth = 3 * ratio;
      context!.lineJoin = 'round';
      context!.lineCap = 'round';
      context!.stroke();
      for (const [x, y] of [valid[0], valid[valid.length - 1]]) {
        context!.beginPath();
        context!.arc(centerX + x * scale, centerY + y * scale, 4 * ratio, 0, Math.PI * 2);
        context!.fillStyle = context!.strokeStyle;
        context!.fill();
      }
    });
  }

  worker.onmessage = (event: MessageEvent<WorkerOutput>) => {
    const message = event.data;
    if (message.id !== id) return;
    if (message.type === 'path') paths.push(message.path);
    if (message.type === 'done') complete = true;
    if (message.type === 'error') { failure = message.message; complete = true; }
    draw();
  };
  worker.onerror = event => { failure = event.message || 'Unknown worker failure'; complete = true; draw(); };

  window.addEventListener('resize', resize);
  resize();
  worker.postMessage({ type: 'build', id, grid, maxPaths: 3, maxTries: 12, maxPathsPerVertex: 4 });

  return () => {
    if (disposed) return;
    disposed = true;
    window.removeEventListener('resize', resize);
    worker.postMessage({ type: 'cancel', id });
    worker.terminate();
  };
}
