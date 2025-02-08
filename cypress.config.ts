import { defineConfig } from 'cypress'
import { setupTestUser, cleanupTestData } from './cypress/support/helpers'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: false,
    setupNodeEvents(on, config) {
      on('task', {
        async 'db:seed'() {
          try {
            await setupTestUser()
            return null
          } catch (error) {
            console.error('Failed to seed database:', error)
            throw error
          }
        },
        async 'db:cleanup'() {
          try {
            await cleanupTestData()
            return null
          } catch (error) {
            console.error('Failed to cleanup database:', error)
            throw error
          }
        }
      })
    }
  }
})