import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_TARGET = 'http://localhost:8080';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/planning': { target: API_TARGET, changeOrigin: true },
      '/profs':    { target: API_TARGET, changeOrigin: true },
      '/salles':   { target: API_TARGET, changeOrigin: true },
      '/classes':  { target: API_TARGET, changeOrigin: true },
      '/matieres': { target: API_TARGET, changeOrigin: true },
      '/seances':  { target: API_TARGET, changeOrigin: true },
      '/eleves':   { target: API_TARGET, changeOrigin: true },
    }
  }
});
