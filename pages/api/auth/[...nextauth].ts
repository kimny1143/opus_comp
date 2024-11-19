import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: "ユーザー名", type: "text", placeholder: "ユーザー名を入力" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials) return null;
        const { username, password } = credentials;

        // 認証ロジックをここに記述
        if (username === 'admin' && password === 'password') {
          return { id: '1', name: '管理者', email: 'admin@example.com', role: 'admin' };
        }
        // 一般ユーザー
        if (username === 'user' && password === 'password') {
          return { id: '2', name: 'ユーザー', email: 'user@example.com', role: 'user' };
        }
        // 認証失敗の場合は null を返す
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user!.id = token.id;
        session.user!.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
}); 