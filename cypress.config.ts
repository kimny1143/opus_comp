import { defineConfig } from 'cypress'
import { setupTestDatabase, cleanupTestDatabase } from './cypress/support/helpers'
import { PrismaClient, VendorCategory, VendorStatus, BusinessType } from '@prisma/client'

const prisma = new PrismaClient()

export default defineConfig({
  e2e: {
    async setupNodeEvents(on, config) {
      // タスクの定義
      on('task', {
        async setupTestDatabase() {
          await setupTestDatabase()
          return null
        },
        async cleanupTestDatabase() {
          await cleanupTestDatabase()
          return null
        },
        async 'db:seed'() {
          try {
            // テストユーザーの作成
            const user = await prisma.user.upsert({
              where: { email: 'test@example.com' },
              update: {
                role: 'ADMIN',
                hashedPassword: 'test-hash'
              },
              create: {
                email: 'test@example.com',
                role: 'ADMIN',
                hashedPassword: 'test-hash'
              }
            })

            // テストデータの作成
            await prisma.vendor.createMany({
              data: [
                {
                  id: 'test-vendor-1',
                  name: 'テスト株式会社',
                  code: 'TEST001',
                  category: VendorCategory.CORPORATION,
                  status: VendorStatus.ACTIVE,
                  email: 'test-vendor@example.com',
                  phone: '03-1234-5678',
                  createdById: user.id,
                  updatedById: user.id
                },
                {
                  id: 'test-vendor-2',
                  name: 'サンプル商事',
                  code: 'TEST002',
                  category: VendorCategory.CORPORATION,
                  status: VendorStatus.ACTIVE,
                  email: 'sample-vendor@example.com',
                  phone: '03-8765-4321',
                  createdById: user.id,
                  updatedById: user.id
                }
              ],
              skipDuplicates: true
            })

            return null
          } catch (error) {
            console.error('Failed to seed test data:', error)
            throw error
          }
        },
        async 'db:cleanup'() {
          try {
            // テストデータのクリーンアップ
            await prisma.vendor.deleteMany({
              where: {
                id: {
                  in: ['test-vendor-1', 'test-vendor-2']
                }
              }
            })

            await prisma.user.deleteMany({
              where: {
                email: 'test@example.com'
              }
            })

            return null
          } catch (error) {
            console.error('Failed to cleanup test data:', error)
            throw error
          }
        }
      })

      // 環境変数の設定
      config.env = {
        ...config.env,
        DATABASE_URL: process.env.DATABASE_URL
      }

      return config
    },
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: false,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000
  },
  env: {
    apiUrl: 'http://localhost:3000/api'
  },
  viewportWidth: 1280,
  viewportHeight: 720,
})