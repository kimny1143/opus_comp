import { getRedisClient } from '@/lib/redis/client'
import { createLogger } from '@/lib/logger'
import { v4 as uuidv4 } from 'uuid'

const logger = createLogger('session-manager')
const SESSION_PREFIX = 'session:'
const SESSION_TTL = 24 * 60 * 60 // 24時間(秒)
const OPERATION_RETRY_COUNT = 3

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

  private async retryOperation<T>(
    operation: () => Promise<T>,
    retryCount: number = OPERATION_RETRY_COUNT
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let i = 0; i < retryCount; i++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        logger.warn(`操作に失敗しました。リトライ ${i + 1}/${retryCount}`, error)
        if (i < retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
        }
      }
    }

    throw lastError || new Error('不明なエラーが発生しました')
  }

  async create(params: SessionCreateParams): Promise<Session> {
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

    try {
      const redis = await getRedisClient()
      await this.retryOperation(async () => {
        await redis.setex(
          this.getKey(sessionId),
          SESSION_TTL,
          JSON.stringify(session)
        )
      })

      logger.info(`セッションを作成しました: ${sessionId}`)
      return session
    } catch (error) {
      logger.error('セッションの作成に失敗しました:', error)
      throw new Error('セッションの作成に失敗しました')
    }
  }

  async get(sessionId: string): Promise<Session | null> {
    try {
      const redis = await getRedisClient()
      const data = await this.retryOperation(async () => {
        return await redis.get(this.getKey(sessionId))
      })

      if (!data) {
        logger.debug(`セッションが見つかりません: ${sessionId}`)
        return null
      }

      const session: Session = JSON.parse(data)
      
      // 有効期限切れのセッションを削除
      if (new Date() > new Date(session.expiresAt)) {
        logger.info(`有効期限切れのセッションを削除: ${sessionId}`)
        await this.destroy(sessionId)
        return null
      }

      return session
    } catch (error) {
      logger.error('セッションの取得に失敗しました:', error)
      return null
    }
  }

  async destroy(sessionId: string): Promise<boolean> {
    try {
      const redis = await getRedisClient()
      const result = await this.retryOperation(async () => {
        return await redis.del(this.getKey(sessionId))
      })

      const success = result === 1
      if (success) {
        logger.info(`セッションを削除しました: ${sessionId}`)
      } else {
        logger.warn(`セッションの削除に失敗しました: ${sessionId}`)
      }

      return success
    } catch (error) {
      logger.error('セッションの削除中にエラーが発生しました:', error)
      return false
    }
  }

  async refresh(sessionId: string): Promise<Session | null> {
    try {
      const session = await this.get(sessionId)
      if (!session) {
        logger.debug(`リフレッシュ対象のセッションが見つかりません: ${sessionId}`)
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
      })

      logger.info(`セッションをリフレッシュしました: ${sessionId}`)
      return updatedSession
    } catch (error) {
      logger.error('セッションのリフレッシュに失敗しました:', error)
      return null
    }
  }
}

export const sessionManager = new SessionManager()
export type { Session, SessionCreateParams }