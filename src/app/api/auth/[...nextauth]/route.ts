import NextAuth from 'next-auth'
import { authOptions } from './auth-options'

// @ts-ignore - Temporarily ignore type check for Next.js 15 compatibility
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 