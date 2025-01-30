import { defineConfig } from "@playwright/test";
import dotenv from 'dotenv';
import path from 'path';

// テスト環境の環境変数を読み込む
dotenv.config({ path: '.env.test' });

const PORT = process.env.PORT || 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  timeout: 60000,
  expect: {
    timeout: 15000,
  },
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run build && npm run start",
    url: baseURL,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 2 : 0,
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "chromium",
      use: { browserName: "chromium" },
      dependencies: ["setup"],
    },
  ],
}); 