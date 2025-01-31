import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/playwright/**',
      'e2e/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      exclude: [
        'node_modules/',
        'src/tests/mocks/**',
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/e2e/**',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    testTimeout: 30000,
    maxConcurrency: 5,
    maxWorkers: 0.5,
    alias: {
      '@': resolve(__dirname, './src'),
    },
    pool: 'forks', // プロセス分離によるテストの安定性向上
    isolate: true, // テスト間の分離を強化
    sequence: {
      shuffle: true, // テストの順序をランダム化してテスト間の依存関係を検出
    },
    retry: 2, // 不安定なテストの再試行
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})