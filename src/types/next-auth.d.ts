import { User } from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: User & {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      hashedPassword?: string
    }
  }

  interface User {
    id: string
    role?: string
    hashedPassword?: string
    //companyLogo?: string //マルチテナントの場合はコメントアウトを解除
    //companyName?: string //マルチテナントの場合はコメントアウトを解除
  }

  interface JWT {
    id: string;
    role: string;
  }
} 