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
const CLEANUP_BATCH_SIZE = 100
const ANONYMOUS_SESSION_TTL = 30 * 60 // 30分(秒)

interface Session {
  id: string
  userId?: string
  role?: string
  createdAt: Date
  expiresAt: Date
  fingerprint?: string
  lastActivity?: Date
  deviceInfo?: {
    userAgent: string
    ip: string
  }
}

interface SessionCreateParams {
  userId?: string
  role?: string
  fingerprint?: string
  deviceInfo?: {
    userAgent: string
    ip: string
  }
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

  private async checkRateLimit(key: string): Promise<boolean> {
    const redis = await getRedisClient()
    
    // パイプラインを使用して複数のコマンドを一度に実行
    const pipeline = redis.pipeline()
    pipeline.incr(key)
    pipeline.expire(key, SESSION_RATE_LIMIT_WINDOW)
    
    const results = await pipeline.exec()
    if (!results) return false

    const count = results[0][1] as number
    return count <= MAX_SESSIONS_PER_WINDOW
  }

  private async getUserSessionCount(userId: string): Promise<number> {
    if (!userId) return 0

    const redis = await getRedisClient()
    const sessions = await redis.smembers(this.getUserSessionsKey(userId))
    
    // 有効なセッションのみをカウント
    let validCount = 0
    const pipeline = redis.pipeline()
    
    for (const sessionId of sessions) {
      pipeline.get(this.getKey(sessionId))
    }
    
    const results = await pipeline.exec()
    if (!results) return 0
    
    for (const result of results) {
      if (result[1]) {
        const session = JSON.parse(result[1] as string)
        if (new Date() <= new Date(session.expiresAt)) {
          validCount++
        }
      }
    }
    
    return validCount
  }

  private async addUserSession(userId: string, sessionId: string): Promise<void> {
    if (!userId) return

    const redis = await getRedisClient()
    const pipeline = redis.pipeline()
    pipeline.sadd(this.getUserSessionsKey(userId), sessionId)
    pipeline.expire(this.getUserSessionsKey(userId), SESSION_TTL)
    await pipeline.exec()
  }

  private async removeUserSession(userId: string, sessionId: string): Promise<void> {
    if (!userId) return

    const redis = await getRedisClient()
    await redis.srem(this.getUserSessionsKey(userId), sessionId)
  }

  async create(params: SessionCreateParams): Promise<Session> {
    try {
      const rateLimitKey = params.userId ? 
        this.getRateLimitKey(params.userId) : 
        `rate-limit:anonymous:${params.deviceInfo?.ip || 'unknown'}`

      // レート制限チェック
      const withinLimit = await this.checkRateLimit(rateLimitKey)
      if (!withinLimit) {
        logger.warn(`セッション生成レート制限超過`, {
          userId: params.userId,
          ip: params.deviceInfo?.ip,
          rateWindow: SESSION_RATE_LIMIT_WINDOW,
          maxSessions: MAX_SESSIONS_PER_WINDOW
        })
        throw new Error('セッション生成の制限を超えました')
      }

      // 認証済みユーザーの場合のみセッション数を制限
      if (params.userId) {
        const sessionCount = await this.getUserSessionCount(params.userId)
        if (sessionCount >= MAX_SESSIONS_PER_USER) {
          logger.warn(`ユーザーあたりの最大セッション数超過: ${params.userId}`, {
            userId: params.userId,
            currentCount: sessionCount,
            maxAllowed: MAX_SESSIONS_PER_USER
          })
          throw new Error('アクティブなセッション数が上限を超えています')
        }
      }

      const sessionId = uuidv4()
      const now = new Date()
      const ttl = params.userId ? SESSION_TTL : ANONYMOUS_SESSION_TTL
      const expiresAt = new Date(now.getTime() + ttl * 1000)

      const session: Session = {
        id: sessionId,
        ...(params.userId && { userId: params.userId }),
        ...(params.role && { role: params.role }),
        createdAt: now,
        expiresAt,
        ...(params.fingerprint && { fingerprint: params.fingerprint }),
        lastActivity: now,
        ...(params.deviceInfo && { deviceInfo: params.deviceInfo })
      }

      const redis = await getRedisClient()
      await this.retryOperation(async () => {
        const pipeline = redis.pipeline()
        pipeline.setex(
          this.getKey(sessionId),
          ttl,
          JSON.stringify(session)
        )
        if (params.userId) {
          pipeline.sadd(this.getUserSessionsKey(params.userId), sessionId)
          pipeline.expire(this.getUserSessionsKey(params.userId), ttl)
        }
        await pipeline.exec()
      })

      // 非同期でクリーンアップを実行
      this.cleanup().catch(error => {
        logger.error('セッションクリーンアップに失敗:', error)
      })

      logger.info(`セッションを作成しました: ${sessionId}`, {
        userId: params.userId,
        sessionType: params.userId ? 'authenticated' : 'anonymous',
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

  // 他のメソッドは変更なし...
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

      // 最終アクティビティを更新
      session.lastActivity = new Date()
      const ttl = session.userId ? SESSION_TTL : ANONYMOUS_SESSION_TTL
      await redis.setex(
        this.getKey(sessionId),
        ttl,
        JSON.stringify(session)
      )

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
          const pipeline = redis.pipeline()
          pipeline.del(this.getKey(sessionId))
          if (session.userId) {
            pipeline.srem(this.getUserSessionsKey(session.userId), sessionId)
          }
          await pipeline.exec()
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
      const ttl = session.userId ? SESSION_TTL : ANONYMOUS_SESSION_TTL
      const expiresAt = new Date(now.getTime() + ttl * 1000)
      const updatedSession: Session = {
        ...session,
        expiresAt,
        lastActivity: now
      }

      const redis = await getRedisClient()
      await this.retryOperation(async () => {
        const pipeline = redis.pipeline()
        pipeline.setex(
          this.getKey(sessionId),
          ttl,
          JSON.stringify(updatedSession)
        )
        if (session.userId) {
          pipeline.expire(this.getUserSessionsKey(session.userId), ttl)
        }
        await pipeline.exec()
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
      let cursor = '0'
      let cleanedCount = 0
      
      do {
        // SCANを使用して効率的にキーを取得
        const [newCursor, keys] = await redis.scan(
          cursor,
          'MATCH',
          `${SESSION_PREFIX}*`,
          'COUNT',
          CLEANUP_BATCH_SIZE
        )
        cursor = newCursor

        if (keys.length > 0) {
          // パイプラインを使用して一括処理
          const pipeline = redis.pipeline()
          keys.forEach(key => pipeline.get(key))
          const results = await pipeline.exec()

          const expiredKeys: string[] = []
          const expiredUserSessions = new Map<string, string[]>()

          results?.forEach((result, index) => {
            if (result[1]) {
              const session: Session = JSON.parse(result[1] as string)
              if (new Date() > new Date(session.expiresAt)) {
                const key = keys[index]
                expiredKeys.push(key)
                
                if (session.userId) {
                  const userSessions = expiredUserSessions.get(session.userId) || []
                  userSessions.push(key.replace(SESSION_PREFIX, ''))
                  expiredUserSessions.set(session.userId, userSessions)
                }
              }
            }
          })

          if (expiredKeys.length > 0) {
            const cleanupPipeline = redis.pipeline()
            
            // 期限切れセッションの削除
            cleanupPipeline.del(...expiredKeys)
            
            // ユーザーセッション参照の削除
            for (const [userId, sessionIds] of Array.from(expiredUserSessions.entries())) {
              cleanupPipeline.srem(this.getUserSessionsKey(userId), ...sessionIds)
            }
            
            await cleanupPipeline.exec()
            cleanedCount += expiredKeys.length
          }
        }
      } while (cursor !== '0')

      if (cleanedCount > 0) {
        logger.info('期限切れセッションのクリーンアップを完了しました', {
          cleanedCount
        })
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      logger.error('セッションクリーンアップ中にエラーが発生しました:', {
        error: err.message
      })
    }
  }

  async validateSession(sessionId: string, context: {
    fingerprint?: string
    deviceInfo?: {
      userAgent: string
      ip: string
    }
  }): Promise<boolean> {
    const session = await this.get(sessionId)
    if (!session) return false

    // フィンガープリントの検証
    if (session.fingerprint && context.fingerprint) {
      if (session.fingerprint !== context.fingerprint) {
        logger.warn('セッションフィンガープリントが一致しません', {
          sessionId,
          userId: session.userId
        })
        return false
      }
    }

    // デバイス情報の検証
    if (session.deviceInfo && context.deviceInfo) {
      if (
        session.deviceInfo.userAgent !== context.deviceInfo.userAgent ||
        session.deviceInfo.ip !== context.deviceInfo.ip
      ) {
        logger.warn('セッションのデバイス情報が一致しません', {
          sessionId,
          userId: session.userId
        })
        return false
      }
    }

    // 最終アクティビティの更新
    await this.refresh(sessionId)
    return true
  }
}

export const sessionManager = new SessionManager()
export type { Session, SessionCreateParams }