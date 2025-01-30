import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockApiHandler, createMockRequest, HttpStatus } from '@/test/helpers/mockApi'
import { mockSession, setupSession } from '@/test/helpers/mockSession'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

vi.mock('@prisma/client')

describe('ロールベースアクセス制御', () => {
  let mockPrisma: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma = {
      activityLog: {
        create: vi.fn().mockResolvedValue({
          id: '1',
          userId: '1',
          action: 'create_invoice',
          resourceId: '123',
          timestamp: new Date()
        }),
        findFirst: vi.fn()
      }
    }
    vi.mocked(PrismaClient).mockImplementation(() => mockPrisma)
  })

  describe('管理者権限', () => {
    it('管理者は全てのリソースにアクセスできる', async () => {
      const adminSession = {
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'ADMIN' as const
        }
      }

      setupSession(adminSession)

      const handler = mockApiHandler()
      const request = createMockRequest({
        method: 'GET',
        url: '/api/admin/users'
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

    it('一般ユーザーは管理者用リソースにアクセスできない', async () => {
      const userSession = {
        user: {
          id: '2',
          email: 'user@example.com',
          name: 'Normal User',
          role: 'USER' as const
        }
      }

      setupSession(userSession)

      const handler = mockApiHandler()
      const request = createMockRequest({
        method: 'GET',
        url: '/api/admin/users'
      })

      const response = await handler(request)
      expect(response.status).toBe(HttpStatus.FORBIDDEN)
      const data = await response.json()
      expect(data).toEqual({
        error: 'このリソースにアクセスする権限がありません'
      })
    })
  })

  describe('操作ログ記録', () => {
    it('ユーザーのアクションが操作ログに記録される', async () => {
      const userSession = {
        user: {
          id: '1',
          email: 'user@example.com',
          name: 'Test User',
          role: 'USER' as const
        }
      }

      setupSession(userSession)

      const handler = mockApiHandler()
      const request = createMockRequest({
        method: 'POST',
        url: '/api/invoices',
        body: {
          action: 'create_invoice',
          data: { invoiceId: '123' }
        }
      })

      const response = await handler(request)
      expect(response.status).toBe(HttpStatus.OK)
      const data = await response.json()
      expect(data).toEqual({
        data: {
          message: 'アクションが記録されました'
        }
      })

      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith({
        data: {
          userId: '1',
          action: 'create_invoice',
          resourceId: '123'
        }
      })

      const logEntry = await mockPrisma.activityLog.findFirst({
        where: {
          userId: '1',
          action: 'create_invoice',
          resourceId: '123'
        }
      })

      expect(logEntry).toBeDefined()
      expect(logEntry?.action).toBe('create_invoice')
      expect(logEntry?.userId).toBe('1')
    })
  })
}) 