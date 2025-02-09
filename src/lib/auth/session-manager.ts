// MVPではシンプルなJWTベースの認証を使用するため、このファイルは不要です。
// 認証はnext-authのデフォルト実装に任せます。

export interface Session {
  id: string
  userId: string
  role: string
}

export interface SessionCreateParams {
  userId: string
  role: string
}

class SessionManager {
  async create(params: SessionCreateParams): Promise<Session> {
    return {
      id: params.userId,
      userId: params.userId,
      role: params.role
    }
  }

  async destroy(sessionId: string): Promise<boolean> {
    return true
  }
}

export const sessionManager = new SessionManager()