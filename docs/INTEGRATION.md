# Reading and integrating the experiments

These notes describe the checked-in source, not a verified runtime demo. Start
with one file and its inputs rather than trying to assemble the collection as a
single app. Check permissions as described in the [README](../README.md).

## TypeScript graphics

The rendering files import Three.js, including `three/webgpu`, `three/tsl`, and
selected example modules. The local viewer pins Three.js 0.186.1 and Vite 8.3.4. Its production build
passes; browser/GPU runtime compatibility has not yet been established.

| Entry point | Inputs or integration work |
|---|---|
| `buildAsciiMaterial(options)` in `asciiMaterial.ts` | Provide the atlas, glyph, color, source, and gradient textures, the glyph ramp, and the viewport/grid/atlas uniforms declared in `AsciiMaterialOptions`. A material alone does not create a renderer or populate those textures. |
| `CRTScreenScene` | Supply a browser canvas and the selected screen content. Inspect its parameter interface and external media loading before choosing a source. |
| `BioluminescenceScene` | The viewer supplies a newly reconstructed `./BioluminescenceSceneParameters`; inspect the demo choices before using them elsewhere. |
| `PlanetScene` | The viewer supplies a newly reconstructed `./PlanetSceneParameters`; inspect the demo choices before using them elsewhere. |
| `BoxFroxelPipeline` | Vite aliases the missing upstream constants module to `demo/fog-constants.mjs`. The host provides camera and fog inputs with shadows disabled; it displays a volume depth slice, not the missing original scene. |

The viewer supplies an entry point, generated glyph/source textures, and an
actual-worker route visualization. Next check initialization, resizing, rendering,
and resource disposal in the target browser. Do not infer runtime
compatibility from the presence of WebGPU imports alone.

## Voxel pathfinding worker

`voxelPathfindingWorker.ts` receives `build` and `cancel` messages. Build requests
include an ID, a detailed `WorkerGrid`, and path limits. Responses include path,
completion, debug, and error messages; path buffers can be transferred to the host.

The file contains the search machinery, not the application that constructs the
geometry or displays results. Read its message types before writing a host.
Cancellation responsiveness under a long build has not been qualified; a cancel
message in the interface is not evidence that running synchronous work can be
interrupted promptly.

## Geometric page-layout generator

`orl_clean_band_generator.py` is a separate Python experiment. It uses **Shapely**
for geometry and **Pillow** for raster drawing. No versions are pinned.

Its layout vocabulary keeps a rectangular main-content core surrounded by bands
for direct commentary, commentary on commentary, and outer apparatus. Some
regions merge across adjacent bands. This is a geometric illustration, not a
text typesetting system: it does not measure real paragraphs or paginate content.

The script's `main()` uses nine fixed seeds and writes:

- `orl_clean_band_layouts_3x3.png`
- `orl_clean_band_layouts_3x3.svg`
- `orl_clean_band_layouts_3x3.orl.json`

The output directory is hard-coded to `/mnt/data`. It must exist and be writable;
the script does not create it. On Windows, do not assume that path names your
intended destination. Before running a permitted local copy, choose an appropriate
output location and install dependencies in an isolated environment. There is no
command-line output-directory option in the upstream script.

PNG output attempts to use DejaVu Sans and falls back if it cannot load the font.
Raster appearance may therefore vary between machines even with identical seeds.

## Useful next improvements

These are remaining opportunities, not implemented features:

1. Establish reuse permissions and document source/asset provenance.
2. Visually qualify the supplied viewer on an actual browser/GPU.
3. Add screenshots generated from that verified demo, with reproduction steps.
4. Give the Python generator an explicit output-directory option and dependency setup.
5. Extend the tested nonempty worker fixture to cancellation, invalid grids, and resource limits before application use.

The viewer preserves the upstream source files unchanged; its host and reconstructed input modules are separate additions.
