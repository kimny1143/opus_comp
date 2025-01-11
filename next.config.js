const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.join(__dirname, 'src'),
      }
    } else {
      // クライアントサイドでのPrismaの使用を防ぐ
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        'fs/promises': false,
        async_hooks: false,
      }
    }
    return config
  }
}

module.exports = nextConfig