declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      REDIS_URL: string
      NEXTAUTH_URL: string
      NEXTAUTH_SECRET: string
      DATABASE_URL: string
      SMTP_HOST: string
      SMTP_PORT: string
      SMTP_USER: string
      SMTP_PASS: string
      SMTP_FROM: string
      [key: string]: string | undefined
    }
  }
}

export {}