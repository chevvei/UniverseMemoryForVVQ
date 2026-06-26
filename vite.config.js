import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      'three/addons/': fileURLToPath(new URL('./node_modules/three/examples/jsm/', import.meta.url))
    }
  },
  build: { target: 'es2020', outDir: 'dist' },
  server: { port: 8099, host: true }
});
