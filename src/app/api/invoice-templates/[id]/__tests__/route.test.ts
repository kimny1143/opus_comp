import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockApiHandler, createMockRequest, HttpStatus } from '@/test/helpers/mockApi'
import { mockSession, setupSession } from '@/test/helpers/mockSession'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

vi.mock('@prisma/client')

describe('個別のテンプレート操作API', () => {
  let mockPrisma: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma = {
      invoiceTemplate: {
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      },
      $transaction: vi.fn(callback => callback(mockPrisma))
    }
    vi.mocked(PrismaClient).mockImplementation(() => mockPrisma)
  })

  describe('GET /api/invoice-templates/[id]', () => {
    it('認証済みユーザーが自分のテンプレートを取得できる', async () => {
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
        ],
        _count: {
          invoices: 0
        }
      }

      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue(mockTemplate)

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
        url: '/api/invoice-templates/1'
      })

      const response = await handler(request, { params: { id: '1' } })
      expect(response.status).toBe(HttpStatus.OK)
      const data = await response.json()
      expect(data).toEqual({
        data: mockTemplate
      })
    })

    it('他のユーザーのテンプレートは取得できない', async () => {
      const mockTemplate = {
        id: '1',
        userId: '2'  // 別のユーザーのID
      }

      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue(mockTemplate)

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
        url: '/api/invoice-templates/1'
      })

      const response = await handler(request, { params: { id: '1' } })
      expect(response.status).toBe(HttpStatus.NOT_FOUND)
      const data = await response.json()
      expect(data).toEqual({
        error: 'テンプレートが見つかりません'
      })
    })

    it('存在しないテンプレートは404エラー', async () => {
      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue(null)

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
        url: '/api/invoice-templates/999'
      })

      const response = await handler(request, { params: { id: '999' } })
      expect(response.status).toBe(HttpStatus.NOT_FOUND)
      const data = await response.json()
      expect(data).toEqual({
        error: 'テンプレートが見つかりません'
      })
    })

    it('未認証は401エラー', async () => {
      setupSession(null)

      const handler = mockApiHandler()
      const request = createMockRequest({
        method: 'GET',
        url: '/api/invoice-templates/1'
      })

      const response = await handler(request, { params: { id: '1' } })
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
      const data = await response.json()
      expect(data).toEqual({
        error: '認証が必要です'
      })
    })
  })

  describe('PATCH /api/invoice-templates/[id]', () => {
    it('認証済みユーザーが自分のテンプレートを更新できる', async () => {
      const mockTemplate = {
        id: '1',
        userId: '1',
        name: 'テストテンプレート',
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

      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue(mockTemplate)
      mockPrisma.invoiceTemplate.update.mockResolvedValue({
        ...mockTemplate,
        name: '更新後のテンプレート'
      })

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
        method: 'PATCH',
        url: '/api/invoice-templates/1',
        body: {
          name: '更新後のテンプレート',
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

      const response = await handler(request, { params: { id: '1' } })
      expect(response.status).toBe(HttpStatus.OK)
      const data = await response.json()
      expect(data.data.name).toBe('更新後のテンプレート')
    })

    it('他のユーザーのテンプレートは更新できない', async () => {
      const mockTemplate = {
        id: '1',
        userId: '2'  // 別のユーザーのID
      }

      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue(mockTemplate)

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
        method: 'PATCH',
        url: '/api/invoice-templates/1',
        body: {
          name: '更新後のテンプレート',
          items: []
        }
      })

      const response = await handler(request, { params: { id: '1' } })
      expect(response.status).toBe(HttpStatus.NOT_FOUND)
      const data = await response.json()
      expect(data).toEqual({
        error: 'テンプレートが見つかりません'
      })
    })
  })

  describe('DELETE /api/invoice-templates/[id]', () => {
    it('認証済みユーザーが未使用のテンプレートを削除できる', async () => {
      const mockTemplate = {
        id: '1',
        userId: '1',
        _count: {
          invoices: 0
        }
      }

      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue(mockTemplate)
      mockPrisma.invoiceTemplate.delete.mockResolvedValue(mockTemplate)

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
        method: 'DELETE',
        url: '/api/invoice-templates/1'
      })

      const response = await handler(request, { params: { id: '1' } })
      expect(response.status).toBe(HttpStatus.OK)
      const data = await response.json()
      expect(data).toEqual({
        data: { success: true }
      })
    })

    it('使用中のテンプレートは削除できない', async () => {
      const mockTemplate = {
        id: '1',
        userId: '1',
        _count: {
          invoices: 1  // 使用中
        }
      }

      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue(mockTemplate)

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
        method: 'DELETE',
        url: '/api/invoice-templates/1'
      })

      const response = await handler(request, { params: { id: '1' } })
      expect(response.status).toBe(HttpStatus.BAD_REQUEST)
      const data = await response.json()
      expect(data).toEqual({
        error: '使用中のテンプレートは削除できません'
      })
    })

    it('他のユーザーのテンプレートは削除できない', async () => {
      const mockTemplate = {
        id: '1',
        userId: '2',  // 別のユーザーのID
        _count: {
          invoices: 0
        }
      }

      mockPrisma.invoiceTemplate.findUnique.mockResolvedValue(mockTemplate)

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
        method: 'DELETE',
        url: '/api/invoice-templates/1'
      })

      const response = await handler(request, { params: { id: '1' } })
      expect(response.status).toBe(HttpStatus.NOT_FOUND)
      const data = await response.json()
      expect(data).toEqual({
        error: 'テンプレートが見つかりません'
      })
    })
  })
}) 