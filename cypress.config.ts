import { defineConfig } from 'cypress'
import { setupTestDatabase, cleanupTestDatabase } from './cypress/support/helpers'

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
  },
  env: {
    apiUrl: 'http://localhost:3000/api'
  },
  viewportWidth: 1280,
  viewportHeight: 720,
})