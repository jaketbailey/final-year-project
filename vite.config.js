import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import vitePluginRequire from 'vite-plugin-require';

export default defineConfig(() => {
  return {
    server: {
      proxy: {
        '/api': 'http://localhost:8080',
      }
    },
    root: 'src/client',
    envDir: '../../',
    define: {
        'process.env': {},
    },
    build: {
        outDir: 'build',
    },
    plugins: [
        react(),
        svgr({ svgrOptions: { icon: true } }),
        vitePluginRequire({ fileRegex:/(.jsx?|.tsx?|.vue)$/ }),
    ],
  }; 
});
