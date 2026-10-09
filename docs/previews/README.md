# Preview provenance

`orl-layouts.png`, `orl-layouts.svg`, and `orl-layouts.json` were generated on
2026-10-09 by running the upstream `orl_clean_band_generator.py` retained in
this fork. Only the three output-path globals were overridden in memory to
write into this directory. The source file was not modified.

Environment: Python 3.14 on Windows, Shapely 2.2.0, Pillow 12.3.0,
NumPy 2.5.3. The PNG was opened and visually inspected. The font loader's
fallback means raster text appearance may differ between machines.

Seeds: 5101, 5279, 5441, 5639, 5801, 5987, 6151, 6317, 6521.

## Reproduce

From the repository root, with Shapely and Pillow installed in an isolated
Python environment, run this Python snippet:

```python
import importlib.util
import sys
from pathlib import Path

spec = importlib.util.spec_from_file_location(
    "orl_preview", Path("orl_clean_band_generator.py")
)
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)

out = Path("docs/previews")
out.mkdir(parents=True, exist_ok=True)
module.PNG = out / "orl-layouts.png"
module.SVG = out / "orl-layouts.svg"
module.JSON_PATH = out / "orl-layouts.json"
module.main()
```

## Browser captures supplied by Tim V

Four screenshots were supplied from the local viewer in Microsoft Edge on
2026-10-09, after viewer commit `7b121c2`. The screenshot alone does not identify
the exact GPU, rendering backend, browser version, or loaded source hash.

| Image | Captured route | Inputs |
|---|---|---|
| [glyph-material.png](glyph-material.png) | `?demo=ascii` | Generated six-glyph atlas and procedural image. |
| [crt-display.png](crt-display.png) | `?demo=crt` | Internal Julia shader; keyboard and external media disabled. |
| [planet-atmosphere.png](planet-atmosphere.png) | `?demo=planet` | Reconstructed demo parameters. |
| [bioluminescence.png](bioluminescence.png) | `?demo=bioluminescence` | Reconstructed demo parameters. |

Each image is a lossless rectangular crop of the visible canvas. No resize,
color adjustment, sharpening, retouching, or generative editing was applied.
The planet, CRT, and bioluminescence screenshots did not include the bottom of
the full canvas; the crops retain only what was actually captured. The mouse
pointer visible in the planet capture is retained.

Original screenshots remain outside the repository. Source hashes, output hashes,
and crop rectangles in original pixel coordinates are recorded in
[screenshot-crops.json](screenshot-crops.json). Cropped pixel bytes were checked
against the corresponding source regions, and all four crops were visually inspected.

## Remaining captures

Froxel fog and voxel pathfinding still need genuine captures. The agent's browser
runtime remains disconnected; user-supplied frames establish only the visible
output shown above, not independent runtime or performance qualification.
