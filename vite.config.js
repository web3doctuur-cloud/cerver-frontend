import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://cerver-api-ehb0hnc4fvdnfkc0.eastasia-01.azurewebsites.net',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
