export interface Session {
  id: string
  userId: string
  role: string
  createdAt: Date
  expiresAt: Date
}

export interface SessionCreateParams {
  userId: string
  role: string
}

export interface AuthUser {
  id: string
  email: string
  role: string
}