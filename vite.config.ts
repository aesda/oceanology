import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('astronomy-engine')) return 'vendor-ephemeris';
            if (id.includes('world-atlas') || id.includes('d3-') || id.includes('topojson')) {
              return 'vendor-cartography';
            }
            if (id.includes('react') || id.includes('lucide-react')) return 'vendor-ui';
          }
          if (id.includes('/src/data/')) {
            return 'classical-codices';
          }
        },
      },
    },
  },
});
