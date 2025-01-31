import { redis } from '@/lib/redis/client'
import { v4 as uuidv4 } from 'uuid'

const SESSION_PREFIX = 'session:'
const SESSION_TTL = 24 * 60 * 60 // 24時間(秒)

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
      await redis.setex(
        this.getKey(sessionId),
        SESSION_TTL,
        JSON.stringify(session)
      )
      return session
    } catch (error) {
      console.error('Failed to create session:', error)
      throw new Error('セッションの作成に失敗しました')
    }
  }

  async get(sessionId: string): Promise<Session | null> {
    try {
      const data = await redis.get(this.getKey(sessionId))
      if (!data) return null

      const session: Session = JSON.parse(data)
      
      // 有効期限切れのセッションを削除
      if (new Date() > new Date(session.expiresAt)) {
        await this.destroy(sessionId)
        return null
      }

      return session
    } catch (error) {
      console.error('Failed to get session:', error)
      return null
    }
  }

  async destroy(sessionId: string): Promise<boolean> {
    try {
      const result = await redis.del(this.getKey(sessionId))
      return result === 1
    } catch (error) {
      console.error('Failed to destroy session:', error)
      return false
    }
  }

  async refresh(sessionId: string): Promise<Session | null> {
    try {
      const session = await this.get(sessionId)
      if (!session) return null

      // セッションを更新
      const now = new Date()
      const expiresAt = new Date(now.getTime() + SESSION_TTL * 1000)
      const updatedSession: Session = {
        ...session,
        expiresAt
      }

      await redis.setex(
        this.getKey(sessionId),
        SESSION_TTL,
        JSON.stringify(updatedSession)
      )

      return updatedSession
    } catch (error) {
      console.error('Failed to refresh session:', error)
      return null
    }
  }
}

export const sessionManager = new SessionManager()
export type { Session, SessionCreateParams }