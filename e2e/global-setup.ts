import { chromium, FullConfig } from '@playwright/test';
import { login } from './helpers/auth.helper';

async function waitForServer(url: string, timeout: number = 60000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // 接続エラーは無視して再試行
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Server at ${url} did not respond within ${timeout}ms`);
}

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  if (!baseURL) throw new Error('baseURL is required');

  // サーバーの準備完了を待つ
  console.log('Waiting for server to be ready...');
  await waitForServer(baseURL);
  console.log('Server is ready');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // グローバルな認証状態を作成
  try {
    await login(page);
    // 認証状態を保存
    await page.context().storageState({
      path: 'playwright/.auth/user.json'
    });
  } catch (error) {
    console.error('認証状態の作成に失敗しました:', error);
  } finally {
    await browser.close();
  }
}

export default globalSetup; 