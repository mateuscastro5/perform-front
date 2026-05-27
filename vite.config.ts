import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const isWeb = process.env.BUILD_TARGET === 'web'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: isWeb ? '/' : './',
  build: {
    outDir: "dist-react",
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5123,
    strictPort: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/ui/assets'),
      '@components': path.resolve(__dirname, './src/ui/components'),
      '@pages': path.resolve(__dirname, './src/ui/pages'),
    }
  }
})
