// テスト環境の設定
process.env.NODE_ENV = 'test'
process.env.REDIS_URL = 'redis://localhost:6379'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret-key'

// タイムアウトの設定
jest.setTimeout(10000)

// コンソール出力の制御
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const originalConsoleLog = console.log

// テスト中は特定のコンソール出力を抑制
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Redis connection error') ||
      args[0].includes('Failed to create session'))
  ) {
    return
  }
  originalConsoleError.apply(console, args)
}

console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Redis connection warning')
  ) {
    return
  }
  originalConsoleWarn.apply(console, args)
}

console.log = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Redis connected successfully')
  ) {
    return
  }
  originalConsoleLog.apply(console, args)
}

// グローバルのテストクリーンアップ
afterEach(() => {
  jest.clearAllMocks()
})

// テスト終了時にコンソール出力を元に戻す
afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
  console.log = originalConsoleLog
})