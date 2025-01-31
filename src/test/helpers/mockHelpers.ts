import { jest } from '@jest/globals'

/**
 * モジュールのモック化
 */
export const mockModule = jest.mock

/**
 * モック関数の作成
 */
export const mockFn = jest.fn

/**
 * オブジェクトの監視
 */
export const spyOn = jest.spyOn

/**
 * すべてのモックをクリア
 */
export const clearAllMocks = jest.clearAllMocks

/**
 * すべてのモックをリセット
 */
export const resetAllMocks = jest.resetAllMocks

/**
 * すべてのモックを復元
 */
export const restoreAllMocks = jest.restoreAllMocks

/**
 * 実装を持つモック関数を作成
 */
export function createMockFunction<Args extends any[], R>(
  implementation: (...args: Args) => R
) {
  return jest.fn(implementation)
}

/**
 * 解決値を返す非同期モック関数を作成
 */
export function createAsyncMockFunction<T>(resolvedValue: T) {
  return jest.fn().mockImplementation(() => Promise.resolve(resolvedValue))
}

/**
 * エラーを返す非同期モック関数を作成
 */
export function createAsyncErrorMockFunction(error: Error) {
  return jest.fn().mockImplementation(() => Promise.reject(error))
}

/**
 * Prismaトランザクションのモック作成
 */
export function createTransactionMockFunction<T>(callback: (prisma: any) => T) {
  return jest.fn((fn: (prisma: any) => T) => fn(callback))
}

/**
 * テスト用のセットアップヘルパー
 */
export function setupTestMocks(): void {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })
}

/**
 * モックの初期化ヘルパー
 */
export function initializeMocks(): void {
  jest.resetModules()
  jest.clearAllMocks()
}

// Vitestからの移行用エイリアス
export const vi = {
  mock: mockModule,
  fn: mockFn,
  spyOn: spyOn,
  clearAllMocks: clearAllMocks,
  resetAllMocks: resetAllMocks,
  restoreAllMocks: restoreAllMocks,
} as const