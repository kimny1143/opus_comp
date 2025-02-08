import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { NextAuthOptions, DefaultSession, DefaultUser } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { sessionManager } from '@/lib/auth/session-manager'
import type { Session as RedisSession } from '@/lib/auth/session-manager'
import bcrypt from 'bcryptjs'

// カスタムユーザー型
interface CustomUser extends DefaultUser {
  role?: string
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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', autocomplete: 'email' },
        password: { label: 'Password', type: 'password', autocomplete: 'current-password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('メールアドレスとパスワードを入力してください')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.hashedPassword) {
          throw new Error('ユーザーが見つかりません')
        }

        const isValid = await bcrypt.compare(credentials.password, user.hashedPassword)

        if (!isValid) {
          throw new Error('パスワードが正しくありません')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
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
          // Redisセッションの作成または更新
          const redisSession = await sessionManager.create({
            userId: token.userId as string,
            role: token.role as string,
          })

          return {
            ...session,
            user: {
              ...session.user,
              id: token.userId,
              role: token.role,
              sessionId: redisSession.id,
            },
          }
        } catch (error) {
          console.error('Failed to create/update Redis session:', error)
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
        console.error('Failed to destroy session:', error)
      }
    },
  },
}

export type { CustomSession, CustomUser }