import { defineConfig } from 'vite';

// Minimal Vite config. Web Awesome auto-detects its asset base path from the
// bundled module, and MapLibre needs no special handling, so defaults are enough.
export default defineConfig({
  server: { open: true },
  build: {
    // Target modern evergreen browsers (per the spec). This also lets esbuild emit
    // the `:is()` CSS nesting used by Web Awesome's stylesheet.
    target: ['chrome111', 'edge111', 'firefox111', 'safari16'],
    // MapLibre + CodeMirror + Web Awesome are inherently large; a single bundle is
    // fine for this single-page learning demo, so lift the size warning.
    chunkSizeWarningLimit: 2000,
  },
});
