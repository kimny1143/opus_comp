import { getRedisClient } from '@/lib/redis/client'
import { createLogger } from '@/lib/logger'
import { v4 as uuidv4 } from 'uuid'

const logger = createLogger('session-manager')
const SESSION_PREFIX = 'session:'
const USER_SESSIONS_PREFIX = 'user-sessions:'
const SESSION_TTL = 24 * 60 * 60 // 24時間(秒)
const OPERATION_RETRY_COUNT = 3
const MAX_SESSIONS_PER_USER = 5
const SESSION_RATE_LIMIT_WINDOW = 60 // 1分(秒)
const MAX_SESSIONS_PER_WINDOW = 10

interface Session {
  id: string
  userId: string
  role: string
  createdAt: Date
  expiresAt: Date
}

interface SessionCreateParams {
  userId: string
  role: string
}

class SessionManager {
  private getKey(sessionId: string): string {
    return `${SESSION_PREFIX}${sessionId}`
  }

  private getUserSessionsKey(userId: string): string {
    return `${USER_SESSIONS_PREFIX}${userId}`
  }

  private getRateLimitKey(userId: string): string {
    return `rate-limit:${userId}`
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    retryCount: number = OPERATION_RETRY_COUNT
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let i = 0; i < retryCount; i++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        logger.warn(`操作に失敗しました。リトライ ${i + 1}/${retryCount}`, {
          error: lastError.message,
          attempt: i + 1,
          maxAttempts: retryCount
        })
        if (i < retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
        }
      }
    }

    throw lastError || new Error('不明なエラーが発生しました')
  }

  private async checkRateLimit(userId: string): Promise<boolean> {
    const redis = await getRedisClient()
    const key = this.getRateLimitKey(userId)
    const count = await redis.incr(key)
    
    if (count === 1) {
      await redis.expire(key, SESSION_RATE_LIMIT_WINDOW)
    }

    return count <= MAX_SESSIONS_PER_WINDOW
  }

  private async getUserSessionCount(userId: string): Promise<number> {
    const redis = await getRedisClient()
    const sessions = await redis.smembers(this.getUserSessionsKey(userId))
    return sessions.length
  }

  private async addUserSession(userId: string, sessionId: string): Promise<void> {
    const redis = await getRedisClient()
    await redis.sadd(this.getUserSessionsKey(userId), sessionId)
    await redis.expire(this.getUserSessionsKey(userId), SESSION_TTL)
  }

  private async removeUserSession(userId: string, sessionId: string): Promise<void> {
    const redis = await getRedisClient()
    await redis.srem(this.getUserSessionsKey(userId), sessionId)
  }

  async create(params: SessionCreateParams): Promise<Session> {
    try {
      // レート制限チェック
      const withinLimit = await this.checkRateLimit(params.userId)
      if (!withinLimit) {
        logger.warn(`セッション生成レート制限超過: ${params.userId}`, {
          userId: params.userId,
          rateWindow: SESSION_RATE_LIMIT_WINDOW,
          maxSessions: MAX_SESSIONS_PER_WINDOW
        })
        throw new Error('セッション生成の制限を超えました')
      }

      // ユーザーあたりの最大セッション数チェック
      const sessionCount = await this.getUserSessionCount(params.userId)
      if (sessionCount >= MAX_SESSIONS_PER_USER) {
        logger.warn(`ユーザーあたりの最大セッション数超過: ${params.userId}`, {
          userId: params.userId,
          currentCount: sessionCount,
          maxAllowed: MAX_SESSIONS_PER_USER
        })
        throw new Error('アクティブなセッション数が上限を超えています')
      }

      const sessionId = uuidv4()
      const now = new Date()
      const expiresAt = new Date(now.getTime() + SESSION_TTL * 1000)

      const session: Session = {
        id: sessionId,
        userId: params.userId,
        role: params.role,
        createdAt: now,
        expiresAt
      }

      const redis = await getRedisClient()
      await this.retryOperation(async () => {
        await redis.setex(
          this.getKey(sessionId),
          SESSION_TTL,
          JSON.stringify(session)
        )
        await this.addUserSession(params.userId, sessionId)
      })

      logger.info(`セッションを作成しました: ${sessionId}`, {
        userId: params.userId,
        sessionCount: sessionCount + 1,
        expiresAt: expiresAt.toISOString()
      })
      return session
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      logger.error('セッションの作成に失敗しました:', {
        error: err.message,
        userId: params.userId
      })
      throw err
    }
  }

  async get(sessionId: string): Promise<Session | null> {
    try {
      const redis = await getRedisClient()
      const data = await this.retryOperation(async () => {
        return await redis.get(this.getKey(sessionId))
      })

      if (!data) {
        logger.debug(`セッションが見つかりません: ${sessionId}`, {
          sessionId
        })
        return null
      }

      const session: Session = JSON.parse(data)
      
      // 有効期限切れのセッションを削除
      if (new Date() > new Date(session.expiresAt)) {
        logger.info(`有効期限切れのセッションを削除: ${sessionId}`, {
          sessionId,
          userId: session.userId,
          expiresAt: session.expiresAt
        })
        await this.destroy(sessionId)
        return null
      }

      return session
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      logger.error('セッションの取得に失敗しました:', {
        error: err.message,
        sessionId
      })
      return null
    }
  }

  async destroy(sessionId: string): Promise<boolean> {
    try {
      const redis = await getRedisClient()
      const session = await this.get(sessionId)
      
      if (session) {
        await this.retryOperation(async () => {
          await redis.del(this.getKey(sessionId))
          await this.removeUserSession(session.userId, sessionId)
        })

        logger.info(`セッションを削除しました: ${sessionId}`, {
          sessionId,
          userId: session.userId
        })
        return true
      }

      return false
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      logger.error('セッションの削除中にエラーが発生しました:', {
        error: err.message,
        sessionId
      })
      return false
    }
  }

  async refresh(sessionId: string): Promise<Session | null> {
    try {
      const session = await this.get(sessionId)
      if (!session) {
        logger.debug(`リフレッシュ対象のセッションが見つかりません: ${sessionId}`, {
          sessionId
        })
        return null
      }

      const now = new Date()
      const expiresAt = new Date(now.getTime() + SESSION_TTL * 1000)
      const updatedSession: Session = {
        ...session,
        expiresAt
      }

      const redis = await getRedisClient()
      await this.retryOperation(async () => {
        await redis.setex(
          this.getKey(sessionId),
          SESSION_TTL,
          JSON.stringify(updatedSession)
        )
        await redis.expire(this.getUserSessionsKey(session.userId), SESSION_TTL)
      })

      logger.info(`セッションをリフレッシュしました: ${sessionId}`, {
        sessionId,
        userId: session.userId,
        newExpiresAt: expiresAt.toISOString()
      })
      return updatedSession
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      logger.error('セッションのリフレッシュに失敗しました:', {
        error: err.message,
        sessionId
      })
      return null
    }
  }

  async cleanup(): Promise<void> {
    try {
      const redis = await getRedisClient()
      const sessionKeys = await redis.keys(`${SESSION_PREFIX}*`)
      let cleanedCount = 0
      
      for (const key of sessionKeys) {
        const data = await redis.get(key)
        if (data) {
          const session: Session = JSON.parse(data)
          if (new Date() > new Date(session.expiresAt)) {
            const sessionId = key.replace(SESSION_PREFIX, '')
            await this.destroy(sessionId)
            cleanedCount++
          }
        }
      }

      logger.info('期限切れセッションのクリーンアップを完了しました', {
        totalScanned: sessionKeys.length,
        cleanedCount
      })
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      logger.error('セッションクリーンアップ中にエラーが発生しました:', {
        error: err.message
      })
    }
  }
}

export const sessionManager = new SessionManager()
export type { Session, SessionCreateParams }