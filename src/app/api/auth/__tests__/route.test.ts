import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, DELETE, GET } from '../route'
import { prisma } from '@/lib/prisma'
import { session } from '@/lib/auth'

// モックの設定
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn()
    }
  }
}))

const mockedSession = vi.mocked(session, true)

describe('認証API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ログイン', () => {
    it('有効な認証情報でログインできる', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'テストユーザー',
        role: 'USER'
      }

      // @ts-expect-error モックのため型を完全に合わせる必要はない
      prisma.user.findUnique.mockResolvedValue(mockUser)
      mockedSession.create.mockResolvedValue({
        id: 'session-id',
        userId: '1',
        role: 'USER',
        createdAt: new Date(),
        expiresAt: new Date()
      })

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'テストユーザー',
          role: 'USER'
        }
      })
    })

    it('管理者としてログインできる', async () => {
      const mockAdminUser = {
        id: '2',
        email: 'admin@example.com',
        name: '管理者',
        role: 'ADMIN'
      }

      // @ts-expect-error モックのため型を完全に合わせる必要はない
      prisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockedSession.create.mockResolvedValue({
        id: 'admin-session-id',
        userId: '2',
        role: 'ADMIN',
        createdAt: new Date(),
        expiresAt: new Date()
      })

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'admin123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.role).toBe('ADMIN')
    })

    it('一般ユーザーとしてログインできる', async () => {
      const mockRegularUser = {
        id: '3',
        email: 'user@example.com',
        name: '一般ユーザー',
        role: 'USER'
      }

      // @ts-expect-error モックのため型を完全に合わせる必要はない
      prisma.user.findUnique.mockResolvedValue(mockRegularUser)
      mockedSession.create.mockResolvedValue({
        id: 'user-session-id',
        userId: '3',
        role: 'USER',
        createdAt: new Date(),
        expiresAt: new Date()
      })

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'user123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.role).toBe('USER')
    })
  })

  describe('セッション管理', () => {
    it('ログアウト時にセッションが削除される', async () => {
      mockedSession.destroy.mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/auth/logout', {
        method: 'POST'
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockedSession.destroy).toHaveBeenCalled()
    })

    it('無効なセッションでアクセスできない', async () => {
      mockedSession.get.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })
}) 