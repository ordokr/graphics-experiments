import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  resolve: { alias: {
    '../oneill-cylinder/constants': fileURLToPath(new URL('./demo/fog-constants.mjs', import.meta.url)),
  } },
  server: { host: '127.0.0.1', port: 5188, strictPort: true },
});
