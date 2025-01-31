import { vi, beforeEach, afterEach, afterAll } from 'vitest'

/**
 * モジュールのモック化
 */
export const mockModule = vi.mock

/**
 * モック関数の作成
 */
export const mockFn = vi.fn

/**
 * オブジェクトの監視
 */
export const spyOn = vi.spyOn

/**
 * すべてのモックをクリア
 */
export const clearAllMocks = vi.clearAllMocks

/**
 * すべてのモックをリセット
 */
export const resetAllMocks = vi.resetAllMocks

/**
 * すべてのモックを復元
 */
export const restoreAllMocks = vi.restoreAllMocks

/**
 * 実装を持つモック関数を作成
 */
export function createMockFunction<Args extends any[], R>(
  implementation: (...args: Args) => R
) {
  return vi.fn(implementation)
}

/**
 * 解決値を返す非同期モック関数を作成
 */
export function createAsyncMockFunction<T>(resolvedValue: T) {
  return vi.fn().mockImplementation(() => Promise.resolve(resolvedValue))
}

/**
 * エラーを返す非同期モック関数を作成
 */
export function createAsyncErrorMockFunction(error: Error) {
  return vi.fn().mockImplementation(() => Promise.reject(error))
}

/**
 * Prismaトランザクションのモック作成
 */
export function createTransactionMockFunction<T>(callback: (prisma: any) => T) {
  return vi.fn((fn: (prisma: any) => T) => fn(callback))
}

/**
 * テスト用のセットアップヘルパー
 */
export function setupTestMocks(): void {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })
}

/**
 * モックの初期化ヘルパー
 */
export function initializeMocks(): void {
  vi.resetModules()
  vi.clearAllMocks()
}

// Jestとの互換性のためのエイリアス
export const jest = {
  mock: mockModule,
  fn: mockFn,
  spyOn: spyOn,
  clearAllMocks: clearAllMocks,
  resetAllMocks: resetAllMocks,
  restoreAllMocks: restoreAllMocks,
} as const