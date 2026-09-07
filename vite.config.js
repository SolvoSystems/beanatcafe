import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Zero-config for Netlify: `npm run build` outputs to dist/ and Netlify
// auto-detects Vite. SPA fallback is handled by public/_redirects.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});