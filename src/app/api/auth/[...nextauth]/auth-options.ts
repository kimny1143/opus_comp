import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { NextAuthOptions, DefaultSession, DefaultUser } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { sessionManager } from '@/lib/auth/session-manager'
import type { Session as RedisSession } from '@/lib/auth/session-manager'
import bcrypt from 'bcryptjs'
import { createLogger } from '@/lib/logger'
import { getRedisClient } from '@/lib/redis/client'

const logger = createLogger('auth')
const LOGIN_ATTEMPTS_PREFIX = 'login-attempts:'
const MAX_LOGIN_ATTEMPTS = 5
const LOGIN_BLOCK_DURATION = 15 * 60 // 15分(秒)

// カスタムユーザー型
interface CustomUser extends DefaultUser {
  role?: string
  deviceInfo?: {
    userAgent: string
    ip: string
  }
}

// カスタムセッション型
interface CustomSession extends DefaultSession {
  user?: CustomUser & {
    id: string
    sessionId?: string
  }
}

declare module 'next-auth' {
  interface User extends CustomUser {}
  interface Session extends CustomSession {}
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string
    role: string
    sessionId?: string
  }
}

// Redisベースのログイン試行管理
class LoginAttemptManager {
  private getKey(email: string): string {
    return `${LOGIN_ATTEMPTS_PREFIX}${email}`
  }

  async checkAttempts(email: string): Promise<boolean> {
    const redis = await getRedisClient()
    const key = this.getKey(email)
    const attempts = await redis.get(key)

    if (!attempts) {
      await redis.setex(key, LOGIN_BLOCK_DURATION, '1')
      return true
    }

    const count = parseInt(attempts, 10)
    if (count >= MAX_LOGIN_ATTEMPTS) {
      return false
    }

    const pipeline = redis.pipeline()
    pipeline.incr(key)
    pipeline.expire(key, LOGIN_BLOCK_DURATION)
    await pipeline.exec()
    return true
  }

  async resetAttempts(email: string): Promise<void> {
    const redis = await getRedisClient()
    await redis.del(this.getKey(email))
  }
}

const loginAttemptManager = new LoginAttemptManager()

// セッションの安全な再生成
async function regenerateSession(
  userId: string,
  role: string,
  context: {
    userAgent?: string
    ip?: string
  }
): Promise<RedisSession> {
  try {
    // 既存のセッションを取得
    const existingSessions = await prisma.session.findMany({
      where: { userId }
    })
    
    // 古いセッションを削除
    for (const session of existingSessions) {
      await sessionManager.destroy(session.id)
    }

    // 新しいセッションを作成
    const fingerprint = await generateSessionFingerprint(userId, context)
    return await sessionManager.create({
      userId,
      role,
      fingerprint,
      deviceInfo: {
        userAgent: context.userAgent || 'unknown',
        ip: context.ip || 'unknown'
      }
    })
  } catch (error) {
    logger.error('セッション再生成に失敗しました', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  }
}

// セッションフィンガープリントの生成
async function generateSessionFingerprint(
  userId: string,
  context: {
    userAgent?: string
    ip?: string
  }
): Promise<string> {
  const data = {
    userId,
    userAgent: context.userAgent,
    ip: context.ip,
    timestamp: Date.now()
  }
  return Buffer.from(JSON.stringify(data)).toString('base64')
}

// リクエストコンテキストの取得
function getRequestContext(req?: any): { userAgent?: string; ip?: string } {
  if (!req?.headers) {
    return {}
  }

  try {
    const userAgent = req.headers['user-agent']
    const forwardedFor = req.headers['x-forwarded-for']
    const realIp = req.headers['x-real-ip']
    
    return {
      userAgent: userAgent || undefined,
      ip: (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0] : undefined) || 
          (typeof realIp === 'string' ? realIp : undefined)
    }
  } catch (error) {
    logger.warn('リクエストコンテキストの取得に失敗しました', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return {}
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', autocomplete: 'email' },
        password: { label: 'Password', type: 'password', autocomplete: 'current-password' }
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('認証情報が不足しています')
          }

          // ログイン試行のチェック
          const canAttempt = await loginAttemptManager.checkAttempts(credentials.email)
          if (!canAttempt) {
            throw new Error('一時的にログインがブロックされています')
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.hashedPassword) {
            throw new Error('認証に失敗しました')
          }

          const isValid = await bcrypt.compare(credentials.password, user.hashedPassword)
          if (!isValid) {
            throw new Error('認証に失敗しました')
          }

          // 成功時は試行回数をリセット
          await loginAttemptManager.resetAttempts(credentials.email)

          // デバイス情報を追加
          const context = getRequestContext(req)
          const deviceInfo = {
            userAgent: context.userAgent || 'unknown',
            ip: context.ip || 'unknown'
          }

          logger.info('認証成功', { userId: user.id })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            deviceInfo
          }
        } catch (error) {
          logger.error('認証エラー', {
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          throw error
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24時間
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id
        token.role = user.role || 'USER'
      }
      return token
    },
    async session({ session, token }): Promise<CustomSession> {
      if (token && session.user) {
        try {
          // セッションの安全な再生成
          const context = getRequestContext()
          
          const redisSession = await regenerateSession(
            token.userId as string,
            token.role as string,
            context
          )

          return {
            ...session,
            user: {
              ...session.user,
              id: token.userId,
              role: token.role,
              sessionId: redisSession.id,
              deviceInfo: {
                userAgent: context.userAgent || 'unknown',
                ip: context.ip || 'unknown'
              }
            },
          }
        } catch (error) {
          logger.error('セッション作成に失敗しました', {
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          return session
        }
      }
      return session
    },
  },
  events: {
    async signOut({ token }) {
      try {
        if (token && typeof token.sessionId === 'string') {
          await sessionManager.destroy(token.sessionId)
        }
      } catch (error) {
        logger.error('セッション削除に失敗しました', {
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

export type { CustomSession, CustomUser }