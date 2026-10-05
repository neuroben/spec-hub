import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // Stable React/router vendor chunk: app changes do not invalidate it in the browser cache.
        // antd is deliberately NOT grouped: a vendor group would pull editor-only antd components
        // (ColorPicker, Form, Select…) into the eagerly loaded bundle. Rolldown keeps them in the lazy editor chunk.
        codeSplitting: {
          groups: [
            { name: 'react', test: /[\\/]node_modules[\\/](react|react-dom|react-router|scheduler|zustand)[\\/]/, priority: 20 },
          ],
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // The shared launcher supplies the backend URL after selecting a free port.
      '/api': {
        target: process.env.SPECHUB_BACKEND_URL || 'http://localhost:5117',
        changeOrigin: true,
      },
    },
  },
})
