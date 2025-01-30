import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockApiHandler, createMockRequest, HttpStatus } from '@/test/helpers/mockApi'
import { mockSession, setupSession } from '@/test/helpers/mockSession'
import { NextResponse } from 'next/server'

describe('セッション管理', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('セッションの有効性', () => {
    it('有効なセッションでリクエストを送信できる', async () => {
      const validSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER' as const
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      setupSession(validSession)

      const handler = mockApiHandler()
      const request = createMockRequest({
        method: 'GET',
        url: '/api/protected-resource'
      })

      const response = await handler(request)
      expect(response.status).toBe(HttpStatus.OK)
      const data = await response.json()
      expect(data).toEqual({
        data: {
          message: 'アクセスが許可されています'
        }
      })
    })

    it('期限切れセッションでリクエストを送信するとエラーになる', async () => {
      const expiredSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER' as const
        },
        expires: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }

      setupSession(expiredSession)

      const handler = mockApiHandler()
      const request = createMockRequest({
        method: 'GET',
        url: '/api/protected-resource'
      })

      const response = await handler(request)
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
      const data = await response.json()
      expect(data).toEqual({
        error: 'セッションの有効期限が切れています'
      })
    })
  })

  describe('セッションの更新', () => {
    it('セッションを正常に更新できる', async () => {
      const currentSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER' as const
        },
        expires: new Date(Date.now() + 1000).toISOString()
      }

      setupSession(currentSession)

      const handler = mockApiHandler()
      const request = createMockRequest({
        method: 'POST',
        url: '/api/auth/session'
      })

      const response = await handler(request)
      expect(response.status).toBe(HttpStatus.OK)
      
      const data = await response.json()
      expect(new Date(data.data.expires).getTime()).toBeGreaterThan(
        new Date(currentSession.expires).getTime()
      )
    })
  })

  describe('セッションの破棄', () => {
    it('ログアウト時にセッションが破棄される', async () => {
      const activeSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER' as const
        }
      }

      setupSession(activeSession)

      const handler = mockApiHandler()
      const request = createMockRequest({
        method: 'DELETE',
        url: '/api/auth/session'
      })

      const response = await handler(request)
      expect(response.status).toBe(HttpStatus.OK)
      const data = await response.json()
      expect(data).toEqual({
        data: {
          message: 'セッションを破棄しました'
        }
      })

      // セッションが破棄されたことを確認
      const nextHandler = mockApiHandler()
      const nextRequest = createMockRequest({
        method: 'GET',
        url: '/api/protected-resource'
      })

      const nextResponse = await nextHandler(nextRequest)
      expect(nextResponse.status).toBe(HttpStatus.UNAUTHORIZED)
      const nextData = await nextResponse.json()
      expect(nextData).toEqual({
        error: '認証が必要です'
      })
    })
  })
}) 