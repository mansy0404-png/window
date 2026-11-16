import { defineConfig } from 'vite';
import { cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Assets live at the repo root so the site can be served directly with any
// static file server (e.g. `python3 -m http.server`). During a Vite build we
// copy those folders into dist/ so the bundled output stays self-contained.
function copyStaticAssets() {
  const folders = ['fonts', 'media'];
  const files = ['favicon.svg'];

  return {
    name: 'copy-static-assets',
    closeBundle() {
      const root = process.cwd();
      const out = resolve(root, 'dist');
      for (const dir of folders) {
        const from = resolve(root, dir);
        if (existsSync(from)) cpSync(from, resolve(out, dir), { recursive: true });
      }
      for (const file of files) {
        const from = resolve(root, file);
        if (existsSync(from)) cpSync(from, resolve(out, file));
      }
    },
  };
}

export default defineConfig({
  base: './',
  // We copy the root asset folders ourselves in copyStaticAssets().
  publicDir: false,
  plugins: [copyStaticAssets()],
  server: {
    port: 5173,
    open: false,
  },
  build: {
    target: 'es2022',
  },
});
