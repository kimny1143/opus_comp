import { defineConfig } from 'cypress'
import { setupTestDatabase, cleanupTestDatabase } from './cypress/support/helpers'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        setupTestDatabase: () => {
          return setupTestDatabase()
        },
        cleanupTestDatabase: () => {
          return cleanupTestDatabase()
        }
      })
    },
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: false,
  },
  env: {
    apiUrl: 'http://localhost:3000/api',
    DATABASE_URL: process.env.DATABASE_URL
  },
  viewportWidth: 1280,
  viewportHeight: 720,
})