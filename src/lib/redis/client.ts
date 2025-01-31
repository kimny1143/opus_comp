import Redis from 'ioredis'
import { createLogger } from '@/lib/logger'

const logger = createLogger('redis-client')

const RETRY_MAX_ATTEMPTS = 3
const RETRY_INITIAL_DELAY = 1000 // 1秒
const RETRY_MAX_DELAY = 5000 // 5秒

interface RedisConfig {
  maxRetriesPerRequest: number
  retryStrategy: (times: number) => number | null
  enableReadyCheck: boolean
  lazyConnect: boolean
}

class RedisClient {
  private static instance: Redis | null = null
  private static connectionPromise: Promise<Redis> | null = null
  private static isConnecting = false

  private static getConfig(): RedisConfig {
    return {
      maxRetriesPerRequest: RETRY_MAX_ATTEMPTS,
      retryStrategy: (times: number) => {
        if (times > RETRY_MAX_ATTEMPTS) {
          logger.error('Redis接続の最大リトライ回数を超過しました')
          return null
        }
        // 指数バックオフ with jitter
        const delay = Math.min(
          RETRY_INITIAL_DELAY * Math.pow(2, times - 1) + Math.random() * 1000,
          RETRY_MAX_DELAY
        )
        logger.info(`Redis接続をリトライします (${times}回目, ${delay}ms後)`)
        return delay
      },
      enableReadyCheck: true,
      lazyConnect: true
    }
  }

  public static async getInstance(): Promise<Redis> {
    if (this.instance && this.instance.status === 'ready') {
      return this.instance
    }

    if (this.isConnecting) {
      if (this.connectionPromise) {
        return this.connectionPromise
      }
    }

    this.isConnecting = true
    this.connectionPromise = this.connect()

    try {
      this.instance = await this.connectionPromise
      this.isConnecting = false
      return this.instance
    } catch (error) {
      this.isConnecting = false
      this.connectionPromise = null
      throw error
    }
  }

  private static async connect(): Promise<Redis> {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    const config = this.getConfig()

    try {
      const redis = new Redis(redisUrl, config)

      redis.on('error', (error: Error) => {
        logger.error('Redisエラー:', error)
      })

      redis.on('connect', () => {
        logger.info('Redis接続確立')
      })

      redis.on('ready', () => {
        logger.info('Redisクライアント準備完了')
      })

      redis.on('close', () => {
        logger.warn('Redis接続クローズ')
      })

      redis.on('reconnecting', () => {
        logger.info('Redis再接続中...')
      })

      // 接続テスト
      await redis.ping()
      return redis
    } catch (error) {
      logger.error('Redis接続エラー:', error)
      throw new Error('Redisサーバーに接続できません')
    }
  }

  public static async close(): Promise<void> {
    if (this.instance) {
      await this.instance.quit()
      this.instance = null
      this.connectionPromise = null
      this.isConnecting = false
      logger.info('Redis接続を終了しました')
    }
  }
}

export const getRedisClient = RedisClient.getInstance
export const closeRedisConnection = RedisClient.close