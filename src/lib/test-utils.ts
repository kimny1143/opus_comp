import { Session } from 'next-auth'

type MockUser = {
  id: string
  name: string | null
  email: string | null
}

export const createMockSession = (data: { user: MockUser }): Session => {
  return {
    user: data.user,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  }
}

export type { MockUser } 