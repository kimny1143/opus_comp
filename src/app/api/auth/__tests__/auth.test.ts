import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockApiHandler, createMockRequest, HttpStatus } from '@/test/helpers/mockApi'
import { mockSession, setupSession } from '@/test/helpers/mockSession'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'
import { NextResponse } from 'next/server'

vi.mock('@prisma/client')
vi.mock('bcrypt')

describe('認証API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupSession()
  })

  describe('サインアップ', () => {
    it('有効なユーザー情報でサインアップできる', async () => {
      const mockHashedPassword = 'hashed_password'
      vi.mocked(hash).mockImplementation(() => Promise.resolve(mockHashedPassword))

      const mockPrisma = {
        user: {
          create: vi.fn().mockResolvedValue({
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'USER' as const
          })
        }
      }

      vi.mocked(PrismaClient).mockImplementation(() => mockPrisma as any)

      const handler = mockApiHandler()
      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        }
      })

      const response = await handler(request)
      expect(response.status).toBe(HttpStatus.CREATED)
      const data = await response.json()
      expect(data).toEqual({
        data: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER'
        }
      })
    })

    it('既存のメールアドレスでサインアップするとエラーになる', async () => {
      const mockPrisma = {
        user: {
          findUnique: vi.fn().mockResolvedValue({
            id: '1',
            email: 'existing@example.com'
          })
        }
      }

      vi.mocked(PrismaClient).mockImplementation(() => mockPrisma as any)

      const handler = mockApiHandler()
      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'existing@example.com',
          password: 'password123',
          name: 'Test User'
        }
      })

      const response = await handler(request)
      expect(response.status).toBe(HttpStatus.BAD_REQUEST)
      const data = await response.json()
      expect(data).toEqual({
        error: 'このメールアドレスは既に登録されています'
      })
    })
  })

  describe('ログイン認証', () => {
    it('有効な認証情報でログインできる', async () => {
      const mockSessionData = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER' as const
        }
      }

      setupSession(mockSessionData)

      const handler = mockApiHandler()
      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      })

      const response = await handler(request)
      expect(response.status).toBe(HttpStatus.OK)
      const data = await response.json()
      expect(data).toEqual({
        data: {
          user: mockSessionData.user
        }
      })
    })

    it('無効な認証情報でログインするとエラーになる', async () => {
      const handler = mockApiHandler()
      const request = createMockRequest({
        method: 'POST',
        body: {
          email: 'invalid@example.com',
          password: 'wrongpassword'
        }
      })

      const response = await handler(request)
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
      const data = await response.json()
      expect(data).toEqual({
        error: 'メールアドレスまたはパスワードが正しくありません'
      })
    })
  })
})