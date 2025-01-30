import { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '../.auth/user.json');
const AUTH_DIR = path.dirname(AUTH_FILE);
const DEFAULT_TIMEOUT = 30000;  // タイムアウトを30秒に延長

// 認証状態保存ディレクトリの作成
const ensureAuthDir = () => {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }
};

// セッションの状態を確認
const verifySession = async (page: Page): Promise<boolean> => {
  try {
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('next-auth.session-token'));
    
    if (!sessionCookie) {
      console.log('セッションCookieが見つかりません');
      return false;
    }

    // ダッシュボードにアクセスしてセッションを検証
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    const content = await page.content();
    return content.includes('ダッシュボード');
  } catch (error) {
    console.error('セッション検証エラー:', error);
    return false;
  }
};

// ページの準備完了を待機
const waitForPageReady = async (page: Page) => {
  await Promise.all([
    page.waitForLoadState('domcontentloaded'),
    page.waitForLoadState('networkidle')
  ]);
};

export const login = async (page: Page): Promise<void> => {
  try {
    console.log('ログインプロセスを開始');
    ensureAuthDir();

    // ログインページに移動
    await page.goto('http://localhost:3000/auth/signin');
    await waitForPageReady(page);
    console.log('ログインページに移動完了');

    // フォームの準備完了を待機
    await page.waitForSelector('form', { state: 'visible', timeout: DEFAULT_TIMEOUT });
    const emailInput = await page.waitForSelector('input[type="email"]', { state: 'visible', timeout: DEFAULT_TIMEOUT });
    const passwordInput = await page.waitForSelector('input[type="password"]', { state: 'visible', timeout: DEFAULT_TIMEOUT });
    console.log('フォームの準備完了');

    if (!emailInput || !passwordInput) {
      throw new Error('フォーム要素が見つかりません');
    }

    // テスト用アカウントでログイン
    await emailInput.fill(process.env.TEST_USER_EMAIL || 'test@example.com');
    await passwordInput.fill(process.env.TEST_USER_PASSWORD || 'testpassword');
    console.log('認証情報を入力');

    // ログインボタンクリックとリダイレクト完了を待機
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button[type="submit"]')
    ]);

    // ダッシュボードの表示を確認
    await page.waitForSelector('h1:has-text("ダッシュボード")', { state: 'visible', timeout: DEFAULT_TIMEOUT });
    console.log('ダッシュボード表示を確認');

    // セッション状態を保存
    await page.context().storageState({ path: AUTH_FILE });
    const cookies = await page.context().cookies();
    console.log('認証状態を保存:', {
      cookieCount: cookies.length,
      sessionCookie: cookies.find(c => c.name.includes('next-auth.session-token'))?.name
    });

  } catch (error) {
    console.error('ログイン処理でエラーが発生:', error);
    await page.screenshot({ path: `login-error-${Date.now()}.png`, fullPage: true });
    const html = await page.content();
    fs.writeFileSync(`login-error-dom-${Date.now()}.html`, html);
    throw error;
  }
};

export async function setupAuthState(page: Page): Promise<void> {
  try {
    console.log('認証状態のセットアップを開始');
    ensureAuthDir();

    // 既存の認証状態をチェック
    if (fs.existsSync(AUTH_FILE)) {
      const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
      if (authData && authData.cookies) {
        await page.context().addCookies(authData.cookies);
        return;
      }
    }

    // 新規ログイン
    await login(page);
    
    // ログイン後の状態を再確認
    const isValid = await verifySession(page);
    if (!isValid) {
      throw new Error('ログイン後の認証状態が無効です');
    }

  } catch (error) {
    console.error('認証状態のセットアップに失敗:', error);
    await page.screenshot({ path: `auth-setup-error-${Date.now()}.png` });
    throw error;
  }
}

export async function clearAuthState() {
  if (fs.existsSync(AUTH_FILE)) {
    fs.unlinkSync(AUTH_FILE);
  }
} 