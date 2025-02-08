import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

// テスト環境の設定を読み込み
dotenv.config({ path: '.env.test' })

export default defineConfig({
  testDir: './e2e',
  timeout: 30000, // グローバルタイムアウト: 30秒
  expect: {
    timeout: 5000, // アサーションのタイムアウト: 5秒
    // カスタムマッチャーの設定
    toHaveScreenshot: {
      maxDiffPixels: 100,
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.1,
    },
  },
  fullyParallel: false, // リソース制約を考慮し、並列実行を無効化
  forbidOnly: !!process.env.CI, // CI環境では特定のテストのみの実行を禁止
  retries: process.env.CI ? 1 : 0, // CI環境では1回のリトライを許可
  workers: process.env.CI ? 1 : undefined, // CI環境ではワーカー数を1に制限
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    // テスト環境のベースURL
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    
    // ブラウザの設定
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // トレースとデバッグ
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // その他の設定
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: {
        storageState: path.join(__dirname, 'e2e/.auth/user.json'),
      },
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
  outputDir: 'test-results/',
  globalSetup: path.join(__dirname, 'e2e/global-setup.ts'),
  globalTeardown: path.join(__dirname, 'e2e/global-teardown.ts'),
});