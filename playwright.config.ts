import { defineConfig } from "@playwright/test";
import dotenv from 'dotenv';
import path from 'path';

// テスト環境の環境変数を読み込む
dotenv.config({ path: '.env.test' });

const PORT = process.env.PORT || 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  timeout: 30000, // グローバルタイムアウトを30秒に短縮
  expect: {
    timeout: 10000, // expect操作のタイムアウトを10秒に設定
  },
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],
  use: {
    baseURL,
    trace: "on-first-retry",
    actionTimeout: 10000, // アクション(クリックなど)のタイムアウトを10秒に設定
    navigationTimeout: 15000, // ナビゲーションのタイムアウトを15秒に設定
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: "npm run dev",
    url: baseURL,
    timeout: 60000, // サーバー起動待機時間を60秒に設定
    reuseExistingServer: true, // 既存のサーバーを再利用
    stdout: 'pipe',
    stderr: 'pipe',
  },
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 2 : process.env.TEST_RETRY_COUNT ? Number(process.env.TEST_RETRY_COUNT) : 0,
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "chromium",
      use: { 
        browserName: "chromium",
        // デバッグ用の設定を追加
        launchOptions: {
          slowMo: process.env.DEBUG ? 100 : 0, // デバッグ時は操作を遅くする
        }
      },
      dependencies: ["setup"],
    },
  ],
});