# Local experiment host

Goal: run the retained upstream implementations with explicit demo inputs,
then capture genuine frames when a supported browser connects.

- [x] Pin a local Vite/Three.js host and verify fixture behavior before implementation.
- [x] Host the ASCII material with generated glyph/source textures.
- [x] Host CRT with its internal Julia shader, keyboard and media loading disabled.
- [x] Reconstruct missing planet/bioluminescence presets as clearly labeled new inputs.
- [x] Supply fog constants and a bounded fog host; exercise a worker grid fixture.
- [x] Verify build and focused tests; serve only on loopback.
- [ ] Capture each experiment through the supported browser and inspect actual output.

No build or static test substitutes for a completed visual frame. Source behavior
is retained; reconstructed inputs are not represented as upstream defaults.

Verification: npm test (8 passed); npm run build (passed); local viewer and main module HTTP 200 on 127.0.0.1:5188. Browser discovery still reports no connected browsers. Visual acceptance remains open.
