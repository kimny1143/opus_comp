import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

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
  private sessions: Map<string, Session>

  constructor() {
    this.sessions = new Map()
  }

  async create(params: SessionCreateParams): Promise<Session> {
    const sessionId = uuidv4()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24時間後

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

    // 有効期限切れのセッションを削除
    if (new Date() > session.expiresAt) {
      this.sessions.delete(sessionId)
      return null
    }

    return session
  }

  async destroy(sessionId: string): Promise<boolean> {
    return this.sessions.delete(sessionId)
  }
}

export const session = new SessionManager()

// テスト用のモックセッション
interface MockFunction<T> {
  (...args: any[]): T;
  mockResolvedValue: (value: T extends Promise<infer U> ? U : never) => void;
  mockImplementation: (fn: (...args: any[]) => T) => void;
}

interface MockedSessionManager {
  create: MockFunction<Promise<Session>>;
  get: MockFunction<Promise<Session | null>>;
  destroy: MockFunction<Promise<boolean>>;
}

function createMockFunction<T>(): MockFunction<T> {
  let implementation = (...args: any[]): T => ({} as T);
  const fn = (...args: any[]): T => implementation(...args);
  fn.mockResolvedValue = (value: T extends Promise<infer U> ? U : never) => {
    implementation = (async () => value) as unknown as (...args: any[]) => T;
  };
  fn.mockImplementation = (newImpl: (...args: any[]) => T) => {
    implementation = newImpl;
  };
  return fn as MockFunction<T>;
}

export const mockSession: MockedSessionManager = {
  create: createMockFunction<Promise<Session>>(),
  get: createMockFunction<Promise<Session | null>>(),
  destroy: createMockFunction<Promise<boolean>>()
};

export type { Session, SessionCreateParams } 