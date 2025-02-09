import 'next-auth'
import 'next-auth/jwt'

type UserRole = 'USER' | 'ADMIN'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      role: UserRole
    }
  }

  interface User {
    id: string
    email: string
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    email?: string
    role?: UserRole
  }
}