import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/profs': 'http://localhost:8081/planning-data',
      '/seances': 'http://localhost:8081/planning-data',
      '/classes': 'http://localhost:8081/planning-data',
      '/eleves': 'http://localhost:8081/planning-data',
      '/matieres': 'http://localhost:8081/planning-data',
      '/salles': 'http://localhost:8081/planning-data'
    }
  }
})

