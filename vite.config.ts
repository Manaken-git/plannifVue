import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/profs': 'http://localhost:8081',
      '/seances': 'http://localhost:8081',
      '/classes': 'http://localhost:8081',
      '/eleves': 'http://localhost:8081',
      '/matieres': 'http://localhost:8081',
      '/salles': 'http://localhost:8081',
    }
  }
})

