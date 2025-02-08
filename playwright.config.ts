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
    baseURL: 'http://localhost:3000', // 開発サーバーのURL
    trace: 'on-first-retry', // 最初のリトライ時にトレースを記録
    screenshot: 'only-on-failure', // 失敗時のみスクリーンショットを保存
    video: 'retain-on-failure', // 失敗時のみビデオを保存
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }, // ビューポートサイズを指定
      },
      dependencies: ['setup'],
      testIgnore: ['**/auth.setup.ts'],
      timeout: 60000, // プロジェクト固有のタイムアウト: 60秒
    }
  ],
  outputDir: 'test-results/',
  globalSetup: path.join(__dirname, 'e2e/global-setup.ts'),
  globalTeardown: path.join(__dirname, 'e2e/global-teardown.ts'),
});