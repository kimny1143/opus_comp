    // Start of Selection
    import NextAuth, { NextAuthOptions } from 'next-auth';
    import { PrismaAdapter } from '@next-auth/prisma-adapter';
    import { prisma } from '@/lib/prisma';
    import CredentialsProvider from 'next-auth/providers/credentials';
    import { compare } from 'bcryptjs';
    import { User as PrismaUser } from '@prisma/client';
    
    export const authOptions: NextAuthOptions = {
      providers: [
        CredentialsProvider({
          id: 'credentials',
          name: 'Credentials',
          credentials: {
            email: { label: "メールアドレス", type: "email" },
            password: { label: "パスワード", type: "password" }
          },
          async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
              throw new Error('メールアドレスとパスワードを入力してください');
            }
    
            const user: PrismaUser | null = await prisma.user.findUnique({
              where: { email: credentials.email },
            });
    
            if (!user || !user.password) {
              throw new Error('認証に失敗しました');
            }
    
            if (await compare(credentials.password, user.password)) {
              const { password, ...userWithoutPassword } = user;
              return userWithoutPassword;
            } else {
              throw new Error('認証に失敗しました');
            }
          }
        })
      ],
      adapter: PrismaAdapter(prisma),
      session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30日
      },
      pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
      },
      callbacks: {
        async jwt({ token, user }) {
          if (user) {
            token.id = user.id;
            token.role = user.role;
          } else if (!token.id) {
            token.id = token.sub;
          }
          return token;
        },
        async session({ session, token }) {
          if (session.user && token.id) {
            session.user.id = token.id as string;
          }
          if (token.role) {
            session.user.role = token.role as string;
          }

          // セッションの整合性チェック（警告のみ残す）
          if (!session.user.id || !session.user.role) {
            console.warn('セッションユーザーに必要な情報が不足しています');
          }

          return session;
        },
        async redirect({ url, baseUrl }) {
          return url.startsWith(baseUrl) ? url : baseUrl;
        }
      }
    };
    
    export default NextAuth(authOptions);