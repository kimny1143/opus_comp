import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { validationMessages } from '@/lib/validations/messages'

// 環境変数のチェックと詳細ログ
const checkEnvironmentVariables = () => {
  const vars = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '設定済み' : '未設定',
    NEXTAUTH_DEBUG: process.env.NEXTAUTH_DEBUG,
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };
  console.log('環境変数チェック:', vars);
  return vars;
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      role?: string
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error(validationMessages.auth.required)
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error(validationMessages.auth.invalidCredentials)
        }

        const isPasswordValid = await compare(credentials.password, user.hashedPassword)

        if (!isPasswordValid) {
          throw new Error(validationMessages.auth.invalidCredentials)
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30日
    updateAge: 24 * 60 * 60 // 24時間
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // 初回ログイン時にユーザー情報をトークンに追加
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      // セッションにユーザー情報を追加
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string
        }
      }
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        console.log('[NextAuth] Google SignIn:', {
          userId: user.id,
          email: user.email,
          role: user.role,
          timestamp: new Date().toISOString()
        });
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('[NextAuth] リダイレクト:', {
        url,
        baseUrl,
        timestamp: new Date().toISOString()
      });
      
      // 認証コールバック時はダッシュボードへ
      if (url.includes('/api/auth/callback')) {
        return `${baseUrl}/dashboard`;
      }
      
      // 認証ページにいる場合はダッシュボードへ
      if (url.includes('/auth/')) {
        return `${baseUrl}/dashboard`;
      }
      
      // その他のURLはそのまま
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    async signIn(message) {
      console.log('[NextAuth] サインインイベント:', {
        userId: message.user.id,
        email: message.user.email,
        provider: message.account?.provider,
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV
      });
    },
    async signOut(message) {
      console.log('[NextAuth] サインアウトイベント:', {
        userId: message.token?.sub,
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV
      });
    },
    async createUser(message) {
      console.log('[NextAuth] ユーザー作成:', {
        userId: message.user.id,
        email: message.user.email,
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV
      });
    },
    async linkAccount(message) {
      console.log('[NextAuth] アカウントリンク:', {
        userId: message.user.id,
        provider: message.account.provider,
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV
      });
    },
    async session(message) {
      console.log('[NextAuth] セッション更新:', {
        userId: message.token?.sub,
        sessionExpiry: message.session?.expires,
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV
      });
    }
  }
}; 