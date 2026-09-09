import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // local dev: /api/* -> .NET backend (http://localhost:5117)
      '/api': {
        target: 'http://localhost:5117',
        changeOrigin: true,
      },
    },
  },
})
