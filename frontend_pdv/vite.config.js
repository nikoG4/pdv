import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:8080",
    } ,
    port: 5175
  } ,
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
