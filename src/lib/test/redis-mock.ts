import { createLogger } from '../logger'

const logger = createLogger('redis-mock')

class MockRedis {
  private store: Map<string, string>
  private expirations: Map<string, number>

  constructor() {
    this.store = new Map()
    this.expirations = new Map()
  }

  async connect(): Promise<void> {
    logger.info('Mock Redis connected')
  }

  async ping(): Promise<string> {
    return 'PONG'
  }

  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    this.store.set(key, value)
    this.expirations.set(key, Date.now() + seconds * 1000)
    return 'OK'
  }

  async get(key: string): Promise<string | null> {
    const expiration = this.expirations.get(key)
    if (expiration && Date.now() > expiration) {
      this.store.delete(key)
      this.expirations.delete(key)
      return null
    }
    return this.store.get(key) || null
  }

  async del(key: string): Promise<number> {
    const existed = this.store.has(key)
    this.store.delete(key)
    this.expirations.delete(key)
    return existed ? 1 : 0
  }

  async quit(): Promise<'OK'> {
    this.store.clear()
    this.expirations.clear()
    return 'OK'
  }

  // テスト用のヘルパーメソッド
  _getStore(): Map<string, string> {
    return this.store
  }

  _getExpirations(): Map<string, number> {
    return this.expirations
  }

  _clear(): void {
    this.store.clear()
    this.expirations.clear()
  }
}

class MockRedisClient {
  private static instance: MockRedis | null = null

  public static getInstance(): MockRedis {
    if (!this.instance) {
      this.instance = new MockRedis()
    }
    return this.instance
  }

  public static reset(): void {
    if (this.instance) {
      this.instance._clear()
    }
  }
}

// テスト環境でのみモックを使用
const isTesting = process.env.NODE_ENV === 'test'

export const getMockRedisClient = () => {
  if (!isTesting) {
    throw new Error('MockRedisは本番環境では使用できません')
  }
  return MockRedisClient.getInstance()
}

export const resetMockRedis = () => {
  if (!isTesting) {
    throw new Error('MockRedisは本番環境では使用できません')
  }
  MockRedisClient.reset()
}

export type { MockRedis }