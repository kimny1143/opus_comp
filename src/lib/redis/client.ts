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
    // インスタンスが存在し、準備完了状態の場合
    if (this.instance?.status === 'ready') {
      return this.instance
    }

    // 接続処理中の場合は既存のPromiseを返す
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise
    }

    // 新しい接続を開始
    this.isConnecting = true
    this.connectionPromise = this.connect()
      .then(client => {
        this.instance = client
        this.isConnecting = false
        return client
      })
      .catch(error => {
        this.isConnecting = false
        this.connectionPromise = null
        this.instance = null
        throw error
      })

    return this.connectionPromise
  }

  private static async connect(): Promise<Redis> {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    const config = this.getConfig()

    try {
      logger.info('Redis接続を開始します')
      const redis = new Redis(redisUrl, config)

      redis.on('error', (error: Error) => {
        logger.error('Redisエラー:', { message: error.message, stack: error.stack })
        // エラー発生時にインスタンスをクリア
        this.instance = null
        this.connectionPromise = null
      })

      redis.on('connect', () => {
        logger.info('Redis接続確立')
      })

      redis.on('ready', () => {
        logger.info('Redisクライアント準備完了')
      })

      redis.on('close', () => {
        logger.warn('Redis接続クローズ')
        // 接続クローズ時にインスタンスをクリア
        this.instance = null
        this.connectionPromise = null
      })

      redis.on('reconnecting', () => {
        logger.info('Redis再接続中...')
      })

      // 接続テスト
      await redis.ping()
      logger.info('Redis接続テスト成功')
      return redis
    } catch (error) {
      const err = error as Error
      logger.error('Redis接続エラー:', { message: err.message, stack: err.stack })
      throw new Error('Redisサーバーに接続できません')
    }
  }

  public static async close(): Promise<void> {
    if (this.instance) {
      try {
        await this.instance.quit()
        logger.info('Redis接続を正常に終了しました')
      } catch (error) {
        const err = error as Error
        logger.error('Redis接続の終了中にエラーが発生しました:', { message: err.message, stack: err.stack })
      } finally {
        this.instance = null
        this.connectionPromise = null
        this.isConnecting = false
      }
    }
  }
}

export const getRedisClient = RedisClient.getInstance.bind(RedisClient)
export const closeRedisConnection = RedisClient.close.bind(RedisClient)