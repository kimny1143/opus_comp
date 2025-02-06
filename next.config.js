const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // パフォーマンス最適化
    optimizeCss: true,
    optimizePackageImports: ['@/components'],
    // Server Actionsのセキュリティ強化
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || []
    }
  },
  compiler: {
    // 本番環境でのみconsole.logを削除
    removeConsole: process.env.NODE_ENV === 'production'
  },
  // TypeScript設定
  typescript: {
    // ビルド時の型チェックを無効化（テスト時は別途実行）
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.join(__dirname, 'src'),
      }
    } else {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        'fs/promises': false,
        async_hooks: false,
      }
    }
    // テスト環境でのカバレッジ計測はV8カバレッジを使用
    if (process.env.NODE_ENV === 'test') {
      config.optimization = {
        ...config.optimization,
        minimize: false
      }
      // V8カバレッジ設定
      if (!isServer && !dev) {
        config.optimization.minimizer = []
      }
    }
    return config
  }
}

module.exports = nextConfig
