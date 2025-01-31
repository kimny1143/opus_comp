import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    globals: true,
    testTimeout: 30000,
    maxWorkers: 0.5, // 50%を数値で表現
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})