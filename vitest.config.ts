/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
        '**/constants/**',
        '**/styles/**'
      ]
    },
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['src/e2e/**', 'node_modules/**'],
    reporters: ['default', 'html'],
    watch: false
  },
  plugins: [
    tsconfigPaths(),
    react()
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
}) 