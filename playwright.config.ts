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
    toHaveScreenshot: {
      maxDiffPixels: 100,
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.1,
    },
  },

  // テストの実行設定
  fullyParallel: false, // 並列実行を無効化
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // ワーカー数を1に制限
  
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
      slowMo: 100, // 操作を遅くして安定性を向上
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
    
    // トレースとデバッグ
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // その他の設定
    ignoreHTTPSErrors: true,
    bypassCSP: true,
  },

  // プロジェクト設定
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
        contextOptions: {
          reducedMotion: 'reduce',
          forcedColors: 'none',
          strictSelectors: true,
        }
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