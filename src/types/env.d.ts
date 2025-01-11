declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // アプリケーション設定
      NODE_ENV: 'development' | 'production' | 'test';
      NEXT_PUBLIC_APP_URL: string;

      // データベース設定
      DATABASE_URL: string;

      // メール設定
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_USER: string;
      SMTP_PASSWORD: string;
      SMTP_FROM: string;
      SMTP_SECURE: string;

      // 会社情報
      COMPANY_NAME: string;
      COMPANY_ADDRESS: string;
      COMPANY_TEL?: string;
      COMPANY_EMAIL?: string;
      INVOICE_REGISTRATION_NUMBER: string;

      // 認証設定
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
    }
  }
}

export {}; 