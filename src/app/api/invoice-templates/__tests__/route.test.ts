import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockApiHandler, createMockRequest, HttpStatus } from '@/test/helpers/mockApi'
import { mockSession, setupSession } from '@/test/helpers/mockSession'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

vi.mock('@prisma/client')

describe('インボイステンプレートAPI', () => {
  let mockPrisma: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma = {
      invoiceTemplate: {
        findMany: vi.fn(),
        create: vi.fn()
      }
    }
    vi.mocked(PrismaClient).mockImplementation(() => mockPrisma)
  })

  describe('GET /api/invoice-templates', () => {
    it('認証済みユーザーが自分のテンプレート一覧を取得できる', async () => {
      const mockTemplates = [
        {
          id: '1',
          name: 'テストテンプレート1',
          userId: '1',
          templateItems: [
            {
              id: '1',
              itemName: 'テスト商品1',
              quantity: 1,
              unitPrice: '1000',
              taxRate: '0.1',
              description: 'テスト説明1'
            }
          ],
          _count: {
            invoices: 2
          }
        }
      ]

      mockPrisma.invoiceTemplate.findMany.mockResolvedValue(mockTemplates)

      const userSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER' as const
        }
      }

      setupSession(userSession)

      const handler = mockApiHandler()
      const request = createMockRequest({
        method: 'GET',
        url: '/api/invoice-templates'
      })

      const response = await handler(request)
      expect(response.status).toBe(HttpStatus.OK)
      const data = await response.json()
      expect(data).toEqual({
        data: mockTemplates
      })

      expect(mockPrisma.invoiceTemplate.findMany).toHaveBeenCalledWith({
        where: {
          userId: '1'
        },
        include: {
          templateItems: true,
          _count: {
            select: { invoices: true }
          }
        }
      })
    })

    it('未認証の場合はエラーになる', async () => {
      setupSession(null)

      const handler = mockApiHandler()
      const request = createMockRequest({
        method: 'GET',
        url: '/api/invoice-templates'
      })

      const response = await handler(request)
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
      const data = await response.json()
      expect(data).toEqual({
        error: '認証が必要です'
      })
    })

    it('テンプレートが存在しない場合は空配列を返す', async () => {
      mockPrisma.invoiceTemplate.findMany.mockResolvedValue([])

      const userSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER' as const
        }
      }

      setupSession(userSession)

      const handler = mockApiHandler()
      const request = createMockRequest({
        method: 'GET',
        url: '/api/invoice-templates'
      })

      const response = await handler(request)
      expect(response.status).toBe(HttpStatus.OK)
      const data = await response.json()
      expect(data).toEqual({
        data: []
      })
    })
  })

  describe('POST /api/invoice-templates', () => {
    it('有効なデータでテンプレートを作成できる', async () => {
      const mockTemplate = {
        id: '1',
        name: 'テストテンプレート',
        userId: '1',
        templateItems: [
          {
            id: '1',
            itemName: 'テスト商品',
            quantity: 1,
            unitPrice: '1000',
            taxRate: '0.1',
            description: 'テスト説明'
          }
        ]
      }

      mockPrisma.invoiceTemplate.create.mockResolvedValue(mockTemplate)

      const userSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER' as const
        }
      }

      setupSession(userSession)

      const handler = mockApiHandler()
      const request = createMockRequest({
        method: 'POST',
        url: '/api/invoice-templates',
        body: {
          name: 'テストテンプレート',
          items: [
            {
              itemName: 'テスト商品',
              quantity: 1,
              unitPrice: 1000,
              taxRate: 0.1,
              description: 'テスト説明'
            }
          ]
        }
      })

      const response = await handler(request)
      expect(response.status).toBe(HttpStatus.OK)
      const data = await response.json()
      expect(data).toEqual({
        data: mockTemplate
      })
    })

    it('バリデーションエラーの場合はエラーになる', async () => {
      const userSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER' as const
        }
      }

      setupSession(userSession)

      const handler = mockApiHandler()
      const request = createMockRequest({
        method: 'POST',
        url: '/api/invoice-templates',
        body: {
          name: '',  // 空文字列は無効
          items: []  // 空の配列は無効
        }
      })

      const response = await handler(request)
      expect(response.status).toBe(HttpStatus.BAD_REQUEST)
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })

    it('未認証の場合はエラーになる', async () => {
      setupSession(null)

      const handler = mockApiHandler()
      const request = createMockRequest({
        method: 'POST',
        url: '/api/invoice-templates',
        body: {
          name: 'テストテンプレート',
          items: [
            {
              itemName: 'テスト商品',
              quantity: 1,
              unitPrice: 1000,
              taxRate: 0.1,
              description: 'テスト説明'
            }
          ]
        }
      })

      const response = await handler(request)
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
      const data = await response.json()
      expect(data).toEqual({
        error: '認証が必要です'
      })
    })
  })
}) 