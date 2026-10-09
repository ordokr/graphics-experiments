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

## Remaining captures

| Experiment | What is needed before a genuine capture |
|---|---|
| ASCII material | A browser renderer, glyph atlas, input textures, uniforms, and a chosen Three.js version. |
| CRT scene | A browser host, selected screen content, required assets, and compatible Three.js setup. |
| Bioluminescence | Missing parameter module plus browser host and compatible Three.js setup. |
| Planet atmosphere | Missing parameter module plus browser host and compatible Three.js setup. |
| Froxel fog | Missing grid constants plus a host scene, camera/shadow inputs, and compatible Three.js setup. |
| Voxel pathfinding | A host that supplies a valid grid and visualizes the worker's actual returned paths. |

No browser was connected during this capture pass. These six runtime previews
remain unavailable; generated concept art would not establish their behavior.
