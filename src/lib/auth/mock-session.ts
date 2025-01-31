import { Session, SessionCreateParams } from './session-manager'
import { v4 as uuidv4 } from 'uuid'

class MockSessionManager {
  private sessions: Map<string, Session>

  constructor() {
    this.sessions = new Map()
  }

  async create(params: SessionCreateParams): Promise<Session> {
    const sessionId = uuidv4()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const session: Session = {
      id: sessionId,
      userId: params.userId,
      role: params.role,
      createdAt: now,
      expiresAt
    }

    this.sessions.set(sessionId, session)
    return session
  }

  async get(sessionId: string): Promise<Session | null> {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    if (new Date() > session.expiresAt) {
      this.sessions.delete(sessionId)
      return null
    }

    return session
  }

  async destroy(sessionId: string): Promise<boolean> {
    return this.sessions.delete(sessionId)
  }

  async refresh(sessionId: string): Promise<Session | null> {
    const session = await this.get(sessionId)
    if (!session) return null

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const updatedSession: Session = {
      ...session,
      expiresAt
    }

    this.sessions.set(sessionId, updatedSession)
    return updatedSession
  }

  clear(): void {
    this.sessions.clear()
  }
}

export const mockSessionManager = new MockSessionManager()