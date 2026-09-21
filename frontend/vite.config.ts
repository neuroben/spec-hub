import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // Stable vendor chunks: app changes do not invalidate the cached libraries.
        codeSplitting: {
          groups: [
            { name: 'react', test: /[\\/]node_modules[\\/](react|react-dom|react-router|scheduler|zustand)[\\/]/, priority: 20 },
            { name: 'antd', test: /[\\/]node_modules[\\/](antd|@ant-design|@rc-component|rc-[^\\/]+)[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
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
