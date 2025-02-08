import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

// テスト環境の設定を読み込み
dotenv.config({ path: '.env.test' })

export default defineConfig({
  testDir: './e2e',
  
  // タイムアウト設定
  timeout: 30000,
  expect: {
    timeout: 15000
  },

  // テストの実行設定
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  
  // レポート設定
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  // グローバル設定
  use: {
    // ブラウザ設定
    headless: false, // 動作確認のため無効化
    launchOptions: {
      slowMo: 1000, // 動作を遅くして確認
    },
    
    // タイムアウト設定
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // トレースとデバッグ (常時有効化)
    trace: 'on',
    screenshot: 'on',
    video: 'on',
  },

  // プロジェクト設定
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: path.join(__dirname, 'e2e/.auth/user.json'),
      },
      dependencies: ['setup'],
      testIgnore: ['**/auth.setup.ts'],
    }
  ],

  // 出力設定
  outputDir: 'test-results/',
  
  // グローバルセットアップ/ティアダウン
  globalSetup: path.join(__dirname, 'e2e/global-setup.ts'),
  globalTeardown: path.join(__dirname, 'e2e/global-teardown.ts'),
});