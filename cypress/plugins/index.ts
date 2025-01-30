import { PrismaClient } from '@prisma/client'
import { defineConfig } from 'cypress'

const prisma = new PrismaClient()

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        async 'db:seed'() {
          // テストデータの作成
          const testUser = await prisma.user.upsert({
            where: { email: 'test@example.com' },
            update: {},
            create: {
              email: 'test@example.com',
              name: 'Test User',
              hashedPassword: 'password123' // 実際の環境ではハッシュ化が必要
            }
          })

          const testVendor = await prisma.vendor.create({
            data: {
              name: 'テスト取引先',
              category: 'CORPORATION',
              status: 'ACTIVE',
              createdById: testUser.id
            }
          })

          const testPurchaseOrder = await prisma.purchaseOrder.create({
            data: {
              orderNumber: 'PO-TEST-001',
              orderDate: new Date(),
              vendorId: testVendor.id,
              status: 'DRAFT',
              totalAmount: 10000,
              taxAmount: 1000,
              createdById: testUser.id
            }
          })

          const testInvoice = await prisma.invoice.create({
            data: {
              createdById: testUser.id,
              purchaseOrderId: testPurchaseOrder.id,
              vendorId: testVendor.id,
              status: 'DRAFT',
              issueDate: new Date(),
              dueDate: new Date(),
              totalAmount: 10000,
              bankInfo: {},
              invoiceNumber: 'TEST-001'
            }
          })

          const testTag = await prisma.tag.create({
            data: {
              name: '既存タグ'
            }
          })

          return null
        }
      })
    }
  }
}) 