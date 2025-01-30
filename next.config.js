const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Server Actions設定
    serverActions: {
      enabled: true
    },
    // Turbopackを無効化（カバレッジ計測のため）
    turbo: false,
    // パフォーマンス最適化（一時的に無効化）
    optimizeCss: false,
    optimizePackageImports: ['@/components'],
    instrumentationHook: false
  },
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { dev, isServer }) => {
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
    // 開発環境かつクライアントサイドの場合のみカバレッジを有効化
    if (dev && !isServer) {
      config.module.rules.push({
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: '@jsdevtools/coverage-istanbul-loader',
            options: {
              // プロダクションコードのみを対象とする
              exclude: [
                /node_modules/,
                /\.test\./,
                /\.spec\./,
                /e2e\//,
                /__tests__/
              ]
            }
          }
        ]
      })
    }
    return config
  }
}

module.exports = nextConfig
