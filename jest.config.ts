import type { Config } from '@jest/types'
import nextJest from 'next/jest'

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^uuid$': require.resolve('uuid'),
    '@react-pdf/renderer': '<rootDir>/src/test/mocks/pdfRenderer.ts',
  },
  setupFilesAfterEnv: [
    '@testing-library/jest-dom',
    '<rootDir>/jest.setup.ts'
  ],
  testMatch: [
    '**/src/**/*.test.ts',
    '**/src/**/*.test.tsx',
    '**/src/**/*.spec.ts',
    '**/src/**/*.spec.tsx',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/playwright/',
    '/cypress/',
    '/e2e/',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      diagnostics: false,
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uuid|@react-pdf|react-pdf)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.tsx',
    '!src/**/*.spec.tsx',
    '!src/e2e/**/*',
    '!src/playwright/**/*',
    '!src/cypress/**/*',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 30000, // handover.mdのテスト戦略に基づく
  maxWorkers: '50%', // 並列テスト実行の最適化
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      diagnostics: false,
      isolatedModules: true,
    },
  },
}

export default createJestConfig(customJestConfig)