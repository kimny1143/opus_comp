/// <reference types="cypress" />

import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: false,
    // TODO: 型定義に存在しないため一時的にコメントアウト
    // experimentalSessionAndOrigin: true,
  },
  env: {
    apiUrl: 'http://localhost:3000/api',
  },
  viewportWidth: 1280,
  viewportHeight: 720,
}) 