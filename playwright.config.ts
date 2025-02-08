import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

// テスト環境の設定を読み込み
dotenv.config({ path: '.env.test' })

export default defineConfig({
  testDir: './e2e',
  
  // タイムアウト設定 (統合指示文書セクション21に基づく)
  timeout: 30000,
  expect: {
    timeout: 15000, // 最小15秒
  },

  // テストの実行設定
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // リトライは1回のみ
  workers: process.env.CI ? 2 : undefined, // CI環境では2ワーカーに制限
  
  // レポート設定
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  // グローバル設定
  use: {
    // ベースURL設定
    baseURL: 'http://localhost:3000',
    
    // ビューポート設定
    viewport: { width: 1280, height: 720 },
    
    // ブラウザ設定
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    },
    
    // タイムアウト設定
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // トレースとデバッグ (常時有効化)
    trace: 'on',
    screenshot: 'on',
    video: 'on-first-retry',
    
    // その他の設定
    ignoreHTTPSErrors: true,
    bypassCSP: true,
  },

  // プロジェクト設定
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: path.join(__dirname, 'e2e/.auth/user.json')
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