import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('../../', import.meta.url));

export default defineConfig({
  plugins: [react()],
  envDir: false,
  server: { host: '127.0.0.1', port: 5284, strictPort: true, fs: { allow: [packageRoot] } },
  build: { outDir: 'dist', emptyOutDir: true },
});
