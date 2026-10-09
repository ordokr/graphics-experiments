import * as THREE from 'three/webgpu';
import { uniform, texture, uv, vec3, float, floor } from 'three/tsl';
import { BoxFroxelPipeline } from '../BoxFroxelPipeline';
import { mountResources } from './lifecycle.mjs';

// Displays actual accumulated volume data over a checkerboard. This is a
// diagnostic depth slice, not a reconstruction of the missing upstream scene.
export async function mountFog(canvas: HTMLCanvasElement) {
  return mountResources(async (own: (release: () => void) => void) => {
  const renderer = new THREE.WebGPURenderer({ canvas, antialias: true });
  own(() => renderer.dispose());
  renderer.setPixelRatio(1); renderer.setSize(1100, 650, false); await renderer.init();
  if (!(renderer.backend as any).isWebGPUBackend) {
    throw new Error('Froxel compute requires a working WebGPU backend.');
  }
  const camera = new THREE.PerspectiveCamera(50, 1100 / 650, 0.1, 12);
  camera.position.set(0, 0, 5); camera.updateMatrixWorld();
  const depth = new THREE.DataTexture(new Float32Array([1, 1, 1, 1]), 1, 1, THREE.RGBAFormat, THREE.FloatType);
  own(() => depth.dispose());
  depth.needsUpdate = true;
  const fog = new BoxFroxelPipeline({
    froxelResolutionUniform: uniform(new THREE.Vector3()), froxelStepUniform: uniform(1),
    cameraProjectionInverseUniform: uniform(camera.projectionMatrixInverse.clone()),
    cameraWorldMatrixUniform: uniform(camera.matrixWorld.clone()),
    cameraNearUniform: uniform(camera.near), cameraFarUniform: uniform(camera.far),
    fogDensityUniform: uniform(0), cameraIsOrthographicUniform: uniform(0),
    shadowDepthTextureNode: texture(depth), shadowReadyUniform: uniform(0),
    shadowBiasUniform: uniform(0), shadowMapSizeUniform: uniform(new THREE.Vector2(1, 1)),
    shadowMatrixUniform: uniform(new THREE.Matrix4()), shadowWebGPUUniform: uniform(1),
  });
  own(() => fog.dispose());
  fog.init(1100, 650, camera);
  fog.setFogVolumes([
    { type: 'sphere', center: new THREE.Vector3(-0.8, 0.3, 0), radius: 1.1, density: 12, falloff: 0.4 },
    { type: 'sphere', center: new THREE.Vector3(1, -0.2, -1), radius: 1.3, density: 8, falloff: 0.5 },
  ]);
  fog.compute(renderer);
  const sample = fog.getViewSampler()!.sample(vec3(uv().x, uv().y, float(0.98)));
  const checker = floor(uv().x.mul(20)).add(floor(uv().y.mul(12))).mod(2).mul(0.18).add(0.08);
  const material = new THREE.MeshBasicNodeMaterial();
  own(() => material.dispose());
  material.colorNode = sample.rgb.mul(vec3(0.2, 0.65, 1)).add(vec3(checker).mul(sample.a));
  const geometry = new THREE.PlaneGeometry(2, 2);
  own(() => geometry.dispose());
  const scene = new THREE.Scene(); scene.add(new THREE.Mesh(geometry, material));
  const displayCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
  displayCamera.position.z = 1;
  await renderer.renderAsync(scene, displayCamera);
  });
}
