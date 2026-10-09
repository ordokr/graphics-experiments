import { mountResources } from './lifecycle.mjs';
const demos = {
  ascii: ['Glyph material', 'Actual upstream buildAsciiMaterial, with an original procedural image and generated six-glyph atlas.'],
  crt: ['CRT display', 'Actual upstream CRTScreenScene with its internal Julia shader. Keyboard and external media disabled.'],
  planet: ['Planet atmosphere', 'Actual upstream PlanetScene. Parameter defaults reconstructed for this demo; not upstream originals.'],
  bioluminescence: ['Bioluminescence', 'Actual upstream BioluminescenceScene. Parameter defaults reconstructed for this demo; not upstream originals.'],
  fog: ['Froxel fog', 'Actual upstream BoxFroxelPipeline, displayed as a depth slice with original bounded demo inputs.'],
  paths: ['Voxel paths', 'Actual upstream worker results, drawn by an original host visualization.'],
  layout: ['Page layouts', 'Recorded output of the upstream Python generator, using its nine fixed seeds.'],
};
const requested = new URLSearchParams(location.search).get('demo') || 'ascii';
const key = requested in demos ? requested as keyof typeof demos : 'ascii';
const status = document.querySelector<HTMLDivElement>('#status')!;
document.querySelector('#navigation')!.innerHTML = Object.entries(demos).map(([id, [title]]) =>
  `<a href="?demo=${id}" ${id === key ? 'aria-current="page"' : ''}>${title}</a>`).join('');
document.querySelector('#title')!.textContent = demos[key][0];
document.querySelector('#description')!.textContent = demos[key][1];
const canvas = document.querySelector<HTMLCanvasElement>('#view')!;
let cleanup: (() => void) | undefined;
let stopped = false;
function fail(error: unknown) {
  stopped = true; cleanup?.(); status.dataset.state = 'error';
  status.textContent = `Could not render: ${error instanceof Error ? error.message : String(error)}`;
  console.error(error);
}
window.addEventListener('unhandledrejection', event => fail(event.reason));
window.addEventListener('pagehide', () => { stopped = true; cleanup?.(); });
async function run() {
  if (key === 'layout') {
    canvas.hidden = true; document.querySelector<HTMLElement>('#layout')!.hidden = false;
    status.dataset.state = 'recorded'; status.textContent = 'Recorded Python output; see docs/previews for provenance.'; return;
  }
  if (key === 'ascii') cleanup = await (await import('./ascii-demo')).mountAscii(canvas);
  else if (key === 'paths') cleanup = await (await import('./worker-demo')).mountWorkerDemo(canvas);
  else if (key === 'fog') cleanup = await (await import('./fog-demo')).mountFog(canvas);
  else {
    cleanup = await mountResources(async (own: (release: () => void) => void) => {
    let scene: any;
    let renderer: any;
    own(() => scene?.cleanup?.());
    if (key === 'crt') {
      const THREE = await import('three/webgpu');
      const { CRTScreenScene } = await import('../CRTScreenScene');
      scene = new CRTScreenScene();
      scene.updateParameters({ keyboardEnabled: false, displayMode: 'shader', screenResolution: '320x200', emulatorLoadRom: false, dosLoadBundle: false });
      renderer = new THREE.WebGPURenderer({ canvas, antialias: true });
      own(() => renderer?.dispose());
      renderer.setPixelRatio(1); renderer.setSize(1100, 650, false); await renderer.init();
      await scene.init(canvas, renderer);
    } else {
      scene = key === 'planet' ? new (await import('../PlanetScene')).PlanetScene() : new (await import('../BioluminescenceScene')).BioluminescenceScene();
      await scene.init(canvas);
    }
    let previous = performance.now();
    const frame = (now: number) => {
      if (stopped) return;
      try { scene.update(Math.min((now - previous) / 1000, 0.05)); previous = now; scene.render(); requestAnimationFrame(frame); }
      catch (error) { fail(error); }
    };
    requestAnimationFrame(frame);
    });
  }
  if (stopped) { cleanup?.(); return; }
  if (!stopped) { status.dataset.state = 'initialized'; status.textContent = 'Initialized. Visual output requires browser inspection; this status is not a capture receipt.'; }
}
run().catch(fail);
