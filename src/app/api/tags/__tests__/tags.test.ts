import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createMockSession } from '@/lib/test-utils'
import { GET, POST } from '../route'
import { DELETE, PUT, PATCH } from '../[id]/route'
import { Prisma, Tag, Invoice, InvoiceStatus, PurchaseOrderStatus } from '@prisma/client'

// モックセッションの設定
const mockSession = createMockSession({
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com'
  }
})

// テストデータ
const testTag = {
  name: 'テストタグ'
}

// NextRequestのモック作成ヘルパー
const createMockRequest = (url: string, options: RequestInit = {}) => {
  const req = new Request(url, options) as unknown as NextRequest
  return Object.assign(req, {
    cookies: new Map(),
    nextUrl: new URL(url)
  })
}

describe('タグ管理API', () => {
  let createdTag: Tag

  beforeEach(async () => {
    // テストデータのセットアップ
    createdTag = await prisma.tag.create({
      data: {
        name: 'テストタグ'
      }
    })
  })

  afterEach(async () => {
    // テストデータのクリーンアップ
    await prisma.tag.deleteMany({
      where: {
        name: {
          startsWith: 'テスト'
        }
      }
    })
  })

  describe('GET /api/tags', () => {
    it('タグ一覧を取得できる', async () => {
      const res = await GET()
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.tags)).toBe(true)
      expect(data.tags.some((tag: Tag) => tag.name === testTag.name)).toBe(true)
    })
  })

  describe('POST /api/tags', () => {
    it('新しいタグを作成できる', async () => {
      const newTag = {
        name: 'テスト新規タグ'
      }

      const req = createMockRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify(newTag)
      })
      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.tag.name).toBe(newTag.name)
    })

    it('同じ名前のタグは作成できない', async () => {
      const req = createMockRequest('http://localhost:3000/api/tags', {
        method: 'POST',
        body: JSON.stringify(testTag)
      })
      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('同じ名前のタグが既に存在します')
    })
  })

  describe('DELETE /api/tags/[id]', () => {
    it('タグを削除できる', async () => {
      const params = { id: createdTag.id }
      const req = createMockRequest(`http://localhost:3000/api/tags/${createdTag.id}`)
      const res = await DELETE(req, { params })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.tag.id).toBe(createdTag.id)

      // 削除されたことを確認
      const deletedTag = await prisma.tag.findUnique({
        where: { id: createdTag.id }
      })
      expect(deletedTag).toBeNull()
    })
  })

  describe('タグの関連付けと解除', () => {
    let testInvoice: Invoice

    beforeEach(async () => {
      // テスト用の請求書を作成
      testInvoice = await prisma.invoice.create({
        data: {
          invoiceNumber: 'TEST-001',
          issueDate: new Date(),
          dueDate: new Date(),
          totalAmount: new Prisma.Decimal(1000),
          bankInfo: {},
          status: InvoiceStatus.DRAFT,
          vendor: {
            create: {
              name: 'テストベンダー',
              category: 'CORPORATION',
              createdBy: {
                connect: { id: mockSession.user.id }
              }
            }
          },
          purchaseOrder: {
            create: {
              orderNumber: 'PO-TEST-001',
              orderDate: new Date(),
              totalAmount: new Prisma.Decimal(1000),
              taxAmount: new Prisma.Decimal(100),
              status: PurchaseOrderStatus.DRAFT,
              vendor: {
                connect: { id: mockSession.user.id }
              },
              createdBy: {
                connect: { id: mockSession.user.id }
              }
            }
          },
          createdBy: {
            connect: { id: mockSession.user.id }
          }
        }
      })
    })

    afterEach(async () => {
      // テストデータのクリーンアップ
      await prisma.invoice.deleteMany({
        where: {
          invoiceNumber: {
            startsWith: 'TEST-'
          }
        }
      })
    })

    it('タグを請求書に関連付けできる', async () => {
      const params = { id: createdTag.id }
      const body = {
        targetType: 'invoice',
        targetId: testInvoice.id
      }

      const req = createMockRequest(`http://localhost:3000/api/tags/${createdTag.id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      })
      const res = await PUT(req, { params })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)

      // 関連付けを確認
      const updatedInvoice = await prisma.invoice.findFirst({
        where: { id: testInvoice.id },
        include: {
          tags: true
        }
      })

      expect(updatedInvoice?.tags.some(tag => tag.id === createdTag.id)).toBe(true)
    })

    it('タグの関連付けを解除できる', async () => {
      // まず関連付け
      await prisma.invoice.update({
        where: { id: testInvoice.id },
        data: {
          tags: {
            connect: { id: createdTag.id }
          }
        }
      })

      const params = { id: createdTag.id }
      const body = {
        targetType: 'invoice',
        targetId: testInvoice.id
      }

      const req = createMockRequest(`http://localhost:3000/api/tags/${createdTag.id}`, {
        method: 'PATCH',
        body: JSON.stringify(body)
      })
      const res = await PATCH(req, { params })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)

      // 関連付けが解除されたことを確認
      const updatedInvoice = await prisma.invoice.findFirst({
        where: { id: testInvoice.id },
        include: {
          tags: true
        }
      })

      expect(updatedInvoice?.tags.some(tag => tag.id === createdTag.id)).toBe(false)
    })
  })
}) 